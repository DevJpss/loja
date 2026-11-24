import { SITE_URL } from "./site";

export type PaymentMethod = "pix" | "card" | null;

type SettingRow = { key: string; value: unknown };

export function settingsToNumberMap(rows: SettingRow[]): Map<string, number> {
  return new Map(
    rows
      .filter((row) => typeof row.value === "number")
      .map((row) => [row.key, row.value as number]),
  );
}

export function estimateGatewayFeeCents(
  totalCents: number,
  method: PaymentMethod,
  settings: Map<string, number>,
): number {
  const bps =
    method === "card"
      ? (settings.get("gateway_fee_card_bps") ?? 399)
      : (settings.get("gateway_fee_pix_bps") ?? 100);
  const fixed = settings.get("gateway_fee_fixed_cents") ?? 30;
  return Math.round((totalCents * bps) / 10000) + fixed;
}

export function marginCents(
  totalCents: number,
  costCents: number | null,
  shippingCents: number,
  feeCents: number,
): number | null {
  if (costCents == null) return null;
  return totalCents - costCents - shippingCents - feeCents;
}

export function getWhatsappNumber(rows: SettingRow[]): string {
  const row = rows.find((entry) => entry.key === "whatsapp_number");
  return normalizePhone(typeof row?.value === "string" ? row.value : "");
}

export function parseMoneyToCents(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim().replace(/\s/g, "");
  if (!raw) return null;
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55") && digits.length > 11) return digits;
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}

type NotificationInput = {
  code: string;
  status: string;
  trackingCode?: string | null;
  customerName?: string | null;
  email: string;
  phone?: string | null;
  whatsappNumber?: string;
};

export function buildCustomerNotification(input: NotificationInput) {
  const siteUrl = SITE_URL;
  const tracking = input.trackingCode?.trim();
  const shipped = input.status === "shipped" || input.status === "delivered";
  const subject = shipped
    ? `Seu pedido ${input.code} foi enviado`
    : `Atualização do pedido ${input.code}`;

  const lines = [
    `Olá${input.customerName ? `, ${input.customerName.trim().split(" ")[0]}` : ""}!`,
    shipped
      ? `Seu pedido ${input.code} foi enviado.`
      : `Há uma atualização no seu pedido ${input.code}.`,
  ];
  if (tracking) lines.push(`Código de rastreio: ${tracking}`);
  lines.push(`Acompanhe seu pedido: ${siteUrl}/pedido/${input.code}`);
  const body = lines.join("\n");

  const destination =
    input.whatsappNumber || normalizePhone(String(input.phone ?? ""));
  const whatsapp = destination
    ? `https://wa.me/${destination}?text=${encodeURIComponent(body)}`
    : `https://wa.me/?text=${encodeURIComponent(body)}`;

  return {
    subject,
    body,
    mailto: `mailto:${input.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    whatsapp,
  };
}
