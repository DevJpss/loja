"use server";

import { revalidatePath } from "next/cache";
import { markOrderPaid } from "@/lib/payments/orders";

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
