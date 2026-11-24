import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.mercadopago.com";

type Payer = {
  email: string;
  firstName: string;
  phone?: string;
};

export type PixPayment = {
  id: string;
  status: string;
  qr_code: string;
  qr_code_base64: string;
};

export type CardPreference = {
  id: string;
  init_point: string;
};

export type MPPayment = {
  id: string;
  status: string;
  status_detail: string | null;
  external_reference: string | null;
  transaction_amount: number;
};

function getToken(): string | null {
  return process.env.MERCADO_PAGO_ACCESS_TOKEN || null;
}

export function isLivePayments(): boolean {
  return process.env.PAYMENT_MODE === "live" && Boolean(getToken());
}

async function mpFetch<T>(path: string, init: RequestInit): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurada.");

  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Idempotency-Key": String(init.headers && "X-Idempotency-Key" in init.headers ? (init.headers as Record<string, string>)["X-Idempotency-Key"] : crypto.randomUUID()),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Mercado Pago ${response.status}: ${detail.slice(0, 300)}`);
  }

  return (await response.json()) as T;
}

export async function createPixPayment(input: {
  amountCents: number;
  description: string;
  externalReference: string;
  payer: Payer;
  notificationUrl: string;
}): Promise<PixPayment> {
  const data = await mpFetch<{
    id: number | string;
    status: string;
    point_of_interaction?: {
      transaction_data?: {
        qr_code?: string;
        qr_code_base64?: string;
      };
    };
  }>("/v1/payments", {
    method: "POST",
    body: JSON.stringify({
      transaction_amount: input.amountCents / 100,
      description: input.description,
      payment_method_id: "pix",
      external_reference: input.externalReference,
      payer: {
        email: input.payer.email,
        first_name: input.payer.firstName,
        ...(input.payer.phone ? { phone: { number: input.payer.phone } } : {}),
      },
      notification_url: input.notificationUrl,
    }),
  });

  return {
    id: String(data.id),
    status: data.status,
    qr_code: data.point_of_interaction?.transaction_data?.qr_code ?? "",
    qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64 ?? "",
  };
}

export async function createCardPreference(input: {
  amountCents: number;
  description: string;
  externalReference: string;
  payer: Payer;
  notificationUrl: string;
  siteUrl: string;
}): Promise<CardPreference> {
  const data = await mpFetch<{ id: string; init_point: string }>("/v1/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: [
        {
          id: input.externalReference,
          title: input.description,
          quantity: 1,
          currency_id: "BRL",
          unit_price: input.amountCents / 100,
        },
      ],
      external_reference: input.externalReference,
      payer: { email: input.payer.email, name: input.payer.firstName },
      notification_url: input.notificationUrl,
      back_urls: {
        success: `${input.siteUrl}/pedido/${input.externalReference}`,
        failure: `${input.siteUrl}/pedido/${input.externalReference}`,
        pending: `${input.siteUrl}/pedido/${input.externalReference}`,
      },
      auto_return: "approved",
    }),
  });

  return { id: data.id, init_point: data.init_point };
}

export async function getPayment(id: string): Promise<MPPayment> {
  return mpFetch<MPPayment>(`/v1/payments/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export function verifyWebhookSignature(input: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string;
}): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!input.signatureHeader || !input.requestId) return false;

  const parts = new Map(
    input.signatureHeader.split(",").map((part) => {
      const [key, value] = part.trim().split("=");
      return [key, value ?? ""] as const;
    }),
  );
  const ts = parts.get("ts");
  const v1 = parts.get("v1");
  if (!ts || !v1) return false;

  const manifest = `id:[${input.dataId}];request-id:[${input.requestId}];ts:[${ts}];`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(v1, "hex");
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
