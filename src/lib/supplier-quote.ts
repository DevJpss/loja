import { z } from "zod";

export type SupplierQuote = {
  itemId: string;
  priceCents: number | null;
  available: boolean;
  checkedAt: string | null;
};

const quoteSchema = z
  .object({
    item_id: z.union([z.string(), z.number()]).optional(),
    price_cents: z.coerce.number().nonnegative().optional(),
    price: z.coerce.number().nonnegative().optional(),
    available: z.boolean().optional(),
    in_stock: z.boolean().optional(),
    status: z.string().optional(),
    checked_at: z.string().optional(),
  })
  .passthrough();

export function isSupplierQuoteConfigured(): boolean {
  return Boolean(process.env.SUPPLIER_QUOTE_URL);
}

function buildUrl(itemId: string): string {
  const raw = process.env.SUPPLIER_QUOTE_URL;
  if (!raw) throw new Error("SUPPLIER_QUOTE_URL não configurada");

  const url = new URL(raw);
  const localHttp = url.protocol === "http:" && url.hostname === "localhost";
  if (url.protocol !== "https:" && !localHttp) {
    throw new Error("SUPPLIER_QUOTE_URL deve usar HTTPS (ou http://localhost em dev)");
  }

  const param = process.env.SUPPLIER_QUOTE_ITEM_PARAM || "item_id";
  url.searchParams.set(param, itemId);
  return url.toString();
}

/**
 * Adapter único para a fonte autorizada de preço/disponibilidade.
 * A API de afiliado deve responder um JSON com, no mínimo:
 * { "price_cents": 2632, "available": true }
 */
export async function fetchSupplierQuote(itemId: string): Promise<SupplierQuote> {
  const response = await fetch(buildUrl(itemId), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "Evidence-Reps-Supplier-Check/1.0",
      ...(process.env.SUPPLIER_QUOTE_TOKEN
        ? { Authorization: `Bearer ${process.env.SUPPLIER_QUOTE_TOKEN}` }
        : {}),
    },
    signal: AbortSignal.timeout(Number(process.env.SUPPLIER_QUOTE_TIMEOUT_MS ?? 10000)),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Fonte do fornecedor respondeu ${response.status}`);
  }

  const parsed = quoteSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Resposta da fonte do fornecedor está em formato inválido");
  }

  const raw = parsed.data;
  const status = raw.status?.toLowerCase();
  const available =
    raw.available ??
    raw.in_stock ??
    (status ? ["available", "in_stock", "active", "sim", "yes"].includes(status) : null);

  if (available === null) {
    throw new Error("Resposta da fonte do fornecedor não informou disponibilidade");
  }

  const priceCents =
    raw.price_cents != null
      ? Math.round(raw.price_cents)
      : raw.price != null
        ? Math.round(raw.price * 100)
        : null;

  return {
    itemId: raw.item_id ? String(raw.item_id) : itemId,
    priceCents,
    available,
    checkedAt: raw.checked_at ?? null,
  };
}
