"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionState } from "@/lib/types";
import { reviewSchema } from "@/lib/validation";
import { markOrderPaid } from "@/lib/payments/orders";

const DB_ERROR = "Não foi possível enviar. Tente novamente.";

export async function simulatePayment(formData: FormData): Promise<void> {
  if (process.env.PAYMENT_MODE !== "demo") return;

  const code = String(formData.get("code") ?? "");
  if (!code) return;

  const changed = await markOrderPaid({
    code,
    providerPaymentId: "demo-simulated",
    status: "approved",
  });
  if (changed) revalidatePath(`/pedido/${code}`);
}

/** Só aceita avaliação de item de um pedido entregue; status começa pendente. */
export async function submitReview(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = String(formData.get("code") ?? "").trim();
  const orderItemId = String(formData.get("order_item_id") ?? "");
  if (!code || !z.string().uuid().safeParse(orderItemId).success) {
    return { ok: false, message: "Dados inválidos." };
  }

  const parsed = reviewSchema.safeParse({
    author_name: formData.get("author_name"),
    rating: formData.get("rating"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id,customer_id,status,order_items(id,product_id)")
    .eq("code", code)
    .maybeSingle();

  if (!order || order.status !== "delivered") {
    return { ok: false, message: "Este pedido ainda não permite avaliação." };
  }

  const items = Array.isArray(order.order_items) ? order.order_items : [];
  const item = items.find((entry) => entry.id === orderItemId);
  if (!item?.product_id) {
    return { ok: false, message: "Item não encontrado neste pedido." };
  }

  const { error } = await admin.from("reviews").upsert(
    {
      product_id: item.product_id,
      order_id: order.id,
      customer_id: order.customer_id,
      author_name: parsed.data.author_name,
      rating: parsed.data.rating,
      body: parsed.data.body,
      status: "pending",
      approved_at: null,
    },
    { onConflict: "order_id,product_id" },
  );

  if (error) {
    return {
      ok: false,
      message: error.code === "23505" ? "Você já avaliou este item." : DB_ERROR,
    };
  }

  updateTag("reviews");
  revalidatePath(`/pedido/${code}`);
  return {
    ok: true,
    message: "Avaliação enviada. Ela aparecerá na loja após aprovação.",
  };
}
