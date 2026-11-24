"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createCardPreference,
  createPixPayment,
  isLivePayments,
} from "@/lib/payments/mercadopago";
import type { ActionState } from "@/lib/types";
import { shippingCentsForState } from "@/lib/shipping";
import {
  parseSupplierMonitor,
  priceFromMonitor,
  supplierUnavailable,
} from "@/lib/supplier-monitor";

const checkoutSchema = z.object({
  full_name: z.string().trim().min(3, "Informe seu nome completo"),
  email: z.string().trim().email("E-mail inválido"),
  phone: z.string().trim().min(8, "WhatsApp inválido"),
  cep: z.string().trim().min(8, "CEP inválido"),
  address: z.string().trim().min(2, "Informe o endereço"),
  number: z.string().trim().min(1, "Informe o número"),
  complement: z.string().trim().max(120),
  neighborhood: z.string().trim().min(2, "Informe o bairro"),
  city: z.string().trim().min(2, "Informe a cidade"),
  state: z.string().trim().length(2, "Use a sigla do estado (UF)"),
  payment_method: z.enum(["pix", "card"]),
  items: z.string(),
});

const cartSchema = z.array(
  z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().uuid().nullable(),
    qty: z.number().int().min(1).max(20),
  }),
);

function message(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos";
}

export async function checkout(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = checkoutSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    cep: formData.get("cep"),
    address: formData.get("address"),
    number: formData.get("number"),
    complement: formData.get("complement") ?? "",
    neighborhood: formData.get("neighborhood"),
    city: formData.get("city"),
    state: formData.get("state"),
    payment_method: formData.get("payment_method"),
    items: formData.get("items") ?? "[]",
  });
  if (!parsed.success) return { ok: false, message: message(parsed.error) };

  let cart: z.infer<typeof cartSchema>;
  try {
    cart = cartSchema.parse(JSON.parse(parsed.data.items));
  } catch {
    return { ok: false, message: "Carrinho inválido. Volte ao carrinho e tente novamente." };
  }
  if (!cart.length) return { ok: false, message: "Seu carrinho está vazio." };

  const admin = createAdminClient();

  const { data: settingsData, error: settingsError } = await admin
    .from("settings")
    .select("key,value");
  if (settingsError) return { ok: false, message: settingsError.message };

  const settings = new Map(
    (settingsData ?? [])
      .filter((row) => row.key !== "supplier_monitor")
      .map((row) => [row.key, Number(row.value)]),
  );
  const supplierMonitor = parseSupplierMonitor(
    (settingsData ?? []).find((row) => row.key === "supplier_monitor")?.value,
  );
  const threshold = settings.get("free_shipping_threshold_cents") ?? 29900;
  const regionalShipping = shippingCentsForState(parsed.data.state);
  if (regionalShipping === null) {
    return {
      ok: false,
      message: "UF inválida. Informe a sigla do estado para calcular o frete.",
    };
  }

  const ids = Array.from(new Set(cart.map((item) => item.product_id)));
  const { data: products, error: productsError } = await admin
    .from("products")
    .select(
      "id,name,slug,image_url,source_url,price_cents,stock_status,active,product_variants(id,name,price_cents,stock_status)",
    )
    .in("id", ids);
  if (productsError) return { ok: false, message: productsError.message };

  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  const lines: {
    product_id: string;
    variant_id: string | null;
    name_snapshot: string;
    image_snapshot: string | null;
    source_url_snapshot: string | null;
    price_cents: number;
    qty: number;
  }[] = [];

  for (const item of cart) {
    const product = productMap.get(item.product_id);
    if (!product || !product.active || product.stock_status === "out_of_stock") {
      return { ok: false, message: "Um produto do carrinho não está mais disponível." };
    }
    if (supplierUnavailable(supplierMonitor, product.slug)) {
      return { ok: false, message: "Um produto do carrinho não está disponível no fornecedor." };
    }

    const variant = item.variant_id
      ? (product.product_variants ?? []).find((entry) => entry.id === item.variant_id)
      : null;
    if (item.variant_id && (!variant || variant.stock_status === "out_of_stock")) {
      return { ok: false, message: "Uma opção do carrinho não está mais disponível." };
    }

    lines.push({
      product_id: product.id,
      variant_id: variant?.id ?? null,
      name_snapshot: variant ? `${product.name} — ${variant.name}` : product.name,
      image_snapshot: product.image_url,
      source_url_snapshot: product.source_url,
      price_cents: priceFromMonitor(
        { slug: product.slug, price_cents: variant?.price_cents ?? product.price_cents },
        supplierMonitor,
      ),
      qty: item.qty,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.price_cents * line.qty, 0);
  const shipping = subtotal >= threshold ? 0 : regionalShipping;
  const total = subtotal + shipping;

  const code = `ER-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const live = isLivePayments();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const notificationUrl = `${siteUrl}/api/webhooks/pagamento`;

  const { data: customer, error: customerError } = await admin
    .from("customers")
    .insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      address: {
        cep: parsed.data.cep,
        street: parsed.data.address,
        number: parsed.data.number,
        complement: parsed.data.complement,
        neighborhood: parsed.data.neighborhood,
        city: parsed.data.city,
        state: parsed.data.state.toUpperCase(),
      },
    })
    .select("id")
    .single();
  if (customerError) return { ok: false, message: customerError.message };

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      code,
      customer_id: customer.id,
      status: "pending_payment",
      subtotal_cents: subtotal,
      shipping_cents: shipping,
      total_cents: total,
      payment_provider: live ? "mercadopago" : "demo",
    })
    .select("id")
    .single();
  if (orderError) return { ok: false, message: orderError.message };

  const { error: itemsError } = await admin.from("order_items").insert(
    lines.map((line) => ({ ...line, order_id: order.id })),
  );
  if (itemsError) return { ok: false, message: itemsError.message };

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .insert({
      order_id: order.id,
      provider: live ? "mercadopago" : "demo",
      status: "pending",
      amount_cents: total,
      payload: { method: parsed.data.payment_method, mode: live ? "live" : "demo" },
    })
    .select("id")
    .single();
  if (paymentError) return { ok: false, message: paymentError.message };

  if (live) {
    const paymentInput = {
      amountCents: total,
      description: `Pedido ${code}`,
      externalReference: code,
      payer: {
        email: parsed.data.email.toLowerCase(),
        firstName: parsed.data.full_name.split(" ")[0] ?? "Cliente",
        phone: parsed.data.phone,
      },
      notificationUrl,
    };

    try {
      if (parsed.data.payment_method === "pix") {
        const pix = await createPixPayment(paymentInput);
        await admin
          .from("payments")
          .update({
            provider_payment_id: pix.id,
            payload: {
              method: "pix",
              mode: "live",
              qr_code: pix.qr_code,
              qr_code_base64: pix.qr_code_base64,
            },
          })
          .eq("id", payment.id);
      } else {
        const preference = await createCardPreference({ ...paymentInput, siteUrl });
        await admin
          .from("payments")
          .update({
            provider_payment_id: preference.id,
            payload: { method: "card", mode: "live", init_point: preference.init_point },
          })
          .eq("id", payment.id);
      }
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Falha ao gerar o pagamento.",
      };
    }
  }

  redirect(`/pedido/${code}`);
}
