"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { parseMoneyToCents } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionState } from "@/lib/types";

const uuidSchema = z.string().uuid();
const updated: ActionState = { ok: true, message: "Status atualizado." };
const DB_ERROR = "Não foi possível atualizar o pedido. Tente novamente.";

async function changeStatus(input: {
  id: FormDataEntryValue | null;
  from: string[];
  patch: Record<string, unknown>;
}): Promise<ActionState> {
  const parsedId = uuidSchema.safeParse(String(input.id ?? ""));
  if (!parsedId.success) return { ok: false, message: "Pedido inválido." };

  const admin = createAdminClient();
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id,code,status")
    .eq("id", parsedId.data)
    .maybeSingle();
  if (orderError) return { ok: false, message: DB_ERROR };
  if (!order) return { ok: false, message: "Pedido não encontrado." };
  if (!input.from.includes(order.status)) {
    return { ok: false, message: `Transição inválida para o status atual (${order.status}).` };
  }

  const { error } = await admin
    .from("orders")
    .update(input.patch)
    .eq("id", order.id);
  if (error) return { ok: false, message: DB_ERROR };

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${order.id}`);
  revalidatePath(`/pedido/${order.code}`);
  return updated;
}

export async function startPurchase(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  return changeStatus({
    id: formData.get("id"),
    from: ["paid"],
    patch: { status: "purchasing" },
  });
}

export async function registerPurchase(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const costCents = parseMoneyToCents(formData.get("cost"));
  if (costCents == null) return { ok: false, message: "Informe o custo em reais." };

  const supplierOrderId = String(formData.get("supplier_order_id") ?? "").trim().slice(0, 120);
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 1000);
  const patch: Record<string, unknown> = {
    status: "purchased",
    cost_cents: costCents,
    supplier_order_id: supplierOrderId || null,
  };
  if (notes) patch.notes = notes;

  return changeStatus({
    id: formData.get("id"),
    from: ["paid", "purchasing"],
    patch,
  });
}

export async function markShipped(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const trackingCode = String(formData.get("tracking_code") ?? "").trim().slice(0, 120);
  if (!trackingCode) return { ok: false, message: "Informe o código de rastreio." };

  const notes = String(formData.get("notes") ?? "").trim().slice(0, 1000);
  const patch: Record<string, unknown> = {
    status: "shipped",
    tracking_code: trackingCode,
    shipped_at: new Date().toISOString(),
  };
  if (notes) patch.notes = notes;

  return changeStatus({
    id: formData.get("id"),
    from: ["purchased"],
    patch,
  });
}

export async function markDelivered(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  return changeStatus({
    id: formData.get("id"),
    from: ["shipped"],
    patch: { status: "delivered" },
  });
}

export async function cancelOrder(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  return changeStatus({
    id: formData.get("id"),
    from: ["paid", "purchasing", "purchased", "shipped"],
    patch: { status: "cancelled" },
  });
}

export async function refundOrder(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  return changeStatus({
    id: formData.get("id"),
    from: ["paid", "purchasing", "purchased", "shipped", "delivered"],
    patch: { status: "refunded" },
  });
}

export async function expireOrder(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  return changeStatus({
    id: formData.get("id"),
    from: ["pending_payment"],
    patch: { status: "cancelled" },
  });
}
