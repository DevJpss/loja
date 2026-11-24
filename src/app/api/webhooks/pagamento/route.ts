import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPayment,
  verifyWebhookSignature,
} from "@/lib/payments/mercadopago";
import { markOrderPaid } from "@/lib/payments/orders";
import { paymentWebhookSchema } from "@/lib/validation";

const MAX_BODY_BYTES = 64 * 1024;

export async function POST(request: Request) {
  if (process.env.PAYMENT_MODE !== "live") {
    return Response.json({ received: true, mode: "demo" });
  }

  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return Response.json({ error: "Notificação inválida" }, { status: 400 });
  }
  if (rawBody.length > MAX_BODY_BYTES) {
    return Response.json({ error: "Notificação muito grande" }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = paymentWebhookSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "Notificação inválida" }, { status: 400 });
  }

  const notificationId = parsed.data.data?.id == null ? "" : String(parsed.data.data.id);
  if (!notificationId) {
    return Response.json({ error: "ID ausente" }, { status: 400 });
  }

  if (!verifyWebhookSignature({ signatureHeader: signature, requestId, dataId: notificationId })) {
    return Response.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  if (parsed.data.type !== "payment") {
    return Response.json({ received: true });
  }

  try {
    const payment = await getPayment(notificationId);
    if (payment.status === "approved" && payment.external_reference) {
      await markOrderPaid({
        code: payment.external_reference,
        providerPaymentId: payment.id,
        status: payment.status,
      });
    }

    // Só registra o evento depois de processá-lo. Se a consulta ao gateway falhar,
    // não marcamos como processado e o reenvio do Mercado Pago será aceito.
    const admin = createAdminClient();
    const { error: eventError } = await admin.from("webhook_events").insert({
      provider: "mercadopago",
      event_id: notificationId,
      payload: parsed.data,
      processed_at: new Date().toISOString(),
    });
    if (eventError && eventError.code !== "23505") {
      return Response.json({ error: "Falha ao registrar evento" }, { status: 500 });
    }

    return Response.json({ received: true });
  } catch {
    // Erro genérico de propósito: detalhes do gateway não vazam para a resposta.
    return Response.json({ error: "Falha ao processar pagamento" }, { status: 500 });
  }
}
