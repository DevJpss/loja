import { createAdminClient } from "@/lib/supabase/admin";

export async function markOrderPaid(input: {
  code: string;
  providerPaymentId: string | null;
  status?: string;
}): Promise<boolean> {
  const admin = createAdminClient();

  const { data: order, error } = await admin
    .from("orders")
    .select("id,status")
    .eq("code", input.code)
    .maybeSingle();
  if (error || !order) return false;

  if (["paid", "purchased", "shipped", "delivered"].includes(order.status)) {
    return false;
  }

  const now = new Date().toISOString();

  // Preserva o payload original (forma de pagamento, QR, init_point) ao confirmar.
  const { data: existingPayment } = await admin
    .from("payments")
    .select("payload")
    .eq("order_id", order.id)
    .maybeSingle();

  await admin
    .from("orders")
    .update({
      status: "paid",
      paid_at: now,
      payment_id: input.providerPaymentId,
    })
    .eq("id", order.id);

  await admin
    .from("payments")
    .update({
      status: input.status ?? "approved",
      ...(input.providerPaymentId ? { provider_payment_id: input.providerPaymentId } : {}),
      payload: {
        ...((existingPayment?.payload ?? {}) as Record<string, unknown>),
        confirmed_at: now,
      },
    })
    .eq("order_id", order.id)
    .neq("status", "approved");

  return true;
}
