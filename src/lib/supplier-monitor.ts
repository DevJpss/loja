import { z } from "zod";
import { createAdminClient } from "./supabase/admin";
import { nextSupplierProductState, sellingPriceForCost } from "./supplier-pricing";
import { fetchSupplierQuote, isSupplierQuoteConfigured } from "./supplier-quote";
import type { StockStatus } from "./types";

export const SUPPLIER_MONITOR_SETTING_KEY = "supplier_monitor";
const HISTORY_LIMIT = 30;

const stockStatusSchema = z.enum(["available", "low", "out_of_stock"]);

const historyEntrySchema = z.object({
  run_id: z.string().optional(),
  source: z.enum(["cron", "manual"]).optional(),
  checked_at: z.string(),
  status: z.enum(["ok", "error"]),
  supplier_price_cents: z.number().int().nonnegative().nullable().optional(),
  supplier_available: z.boolean().nullable().optional(),
  price_before_cents: z.number().int().nonnegative().optional(),
  price_after_cents: z.number().int().nonnegative().optional(),
  stock_status_before: stockStatusSchema.nullable().optional(),
  stock_status_after: stockStatusSchema.optional(),
  message: z.string().nullable().optional(),
});

const monitorEntrySchema = z.object({
  supplier_item_id: z.string().min(1),
  price_auto_adjust: z.boolean().default(false),
  supplier_price_cents: z.number().int().nonnegative().nullable().default(null),
  supplier_available: z.boolean().nullable().default(null),
  supplier_checked_at: z.string().nullable().default(null),
  last_error: z.string().nullable().default(null),
  stock_status_before: stockStatusSchema.nullable().default(null),
  history: z.array(historyEntrySchema).default([]),
});

const monitorSchema = z.object({
  products: z.record(z.string(), monitorEntrySchema),
});

export type SupplierCheckHistory = z.infer<typeof historyEntrySchema>;
export type SupplierMonitorEntry = z.infer<typeof monitorEntrySchema>;
export type SupplierMonitor = z.infer<typeof monitorSchema>;

export type SupplierRunItem = {
  slug: string;
  status: "ok" | "error";
  message?: string;
  priceAfterCents?: number;
  stockStatusAfter?: StockStatus;
};

export type SupplierRunResult = {
  ok: boolean;
  checked: number;
  updated: number;
  errors: string[];
  items: SupplierRunItem[];
};

export function emptySupplierMonitor(): SupplierMonitor {
  return { products: {} };
}

export function parseSupplierMonitor(value: unknown): SupplierMonitor {
  const parsed = monitorSchema.safeParse(value);
  return parsed.success ? parsed.data : emptySupplierMonitor();
}

export async function readSupplierMonitor(
  client = createAdminClient(),
): Promise<SupplierMonitor> {
  const { data, error } = await client
    .from("settings")
    .select("value")
    .eq("key", SUPPLIER_MONITOR_SETTING_KEY)
    .maybeSingle();
  if (error || !data) return emptySupplierMonitor();
  return parseSupplierMonitor(data.value);
}

export async function writeSupplierMonitor(
  monitor: SupplierMonitor,
  client = createAdminClient(),
): Promise<void> {
  const { error } = await client
    .from("settings")
    .upsert(
      { key: SUPPLIER_MONITOR_SETTING_KEY, value: monitor },
      { onConflict: "key" },
    );
  if (error) throw new Error(error.message);
}

export function priceFromMonitor<T extends { slug: string; price_cents: number }>(
  product: T,
  monitor: SupplierMonitor,
): number {
  const entry = monitor.products[product.slug];
  if (!entry?.price_auto_adjust || entry.supplier_price_cents == null) {
    return product.price_cents;
  }
  try {
    return sellingPriceForCost(entry.supplier_price_cents);
  } catch {
    return product.price_cents;
  }
}

export function supplierUnavailable(
  monitor: SupplierMonitor,
  slug: string,
): boolean {
  return monitor.products[slug]?.supplier_available === false;
}

function appendHistory(entry: SupplierMonitorEntry, record: SupplierCheckHistory): void {
  const last = entry.history[entry.history.length - 1];
  if (record.run_id && last?.run_id === record.run_id) return;
  entry.history = [...entry.history, record].slice(-HISTORY_LIMIT);
}

/** Registra uma checagem feita pelo operador no painel. */
export async function applyManualSupplierCheck({
  slug,
  priceCents,
  available,
  runId = crypto.randomUUID(),
}: {
  slug: string;
  priceCents: number;
  available: boolean;
  runId?: string;
}): Promise<{ ok: boolean; message: string }> {
  const admin = createAdminClient();
  const monitor = await readSupplierMonitor(admin);
  const entry = monitor.products[slug];
  if (!entry?.price_auto_adjust) {
    return { ok: false, message: "Produto não está monitorado." };
  }

  const { data: product, error } = await admin
    .from("products")
    .select("id,slug,price_cents,stock_status")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !product) {
    return { ok: false, message: error?.message ?? "Produto não encontrado." };
  }

  const checkedAt = new Date().toISOString();
  const next = nextSupplierProductState(
    {
      price_cents: product.price_cents,
      stock_status: product.stock_status as StockStatus,
      stock_status_before: entry.stock_status_before,
    },
    { priceCents, available },
  );

  const { error: updateError } = await admin
    .from("products")
    .update({
      price_cents: next.price_cents,
      stock_status: next.stock_status,
      last_checked_at: checkedAt,
      updated_at: checkedAt,
    })
    .eq("id", product.id);
  if (updateError) return { ok: false, message: updateError.message };

  entry.supplier_price_cents = priceCents;
  entry.supplier_available = available;
  entry.supplier_checked_at = checkedAt;
  entry.last_error = null;
  entry.stock_status_before = next.stock_status_before;

  appendHistory(entry, {
    run_id: runId,
    source: "manual",
    checked_at: checkedAt,
    status: "ok",
    supplier_price_cents: priceCents,
    supplier_available: available,
    price_before_cents: product.price_cents,
    price_after_cents: next.price_cents,
    stock_status_before: product.stock_status as StockStatus,
    stock_status_after: next.stock_status,
    message: null,
  });

  await writeSupplierMonitor(monitor, admin);
  return { ok: true, message: "Checagem registrada." };
}

export async function runSupplierChecks({
  runId = crypto.randomUUID(),
}: { runId?: string } = {}): Promise<SupplierRunResult> {
  if (!isSupplierQuoteConfigured()) {
    return {
      ok: false,
      checked: 0,
      updated: 0,
      errors: ["SUPPLIER_QUOTE_URL não configurada"],
      items: [],
    };
  }

  const admin = createAdminClient();
  const monitor = await readSupplierMonitor(admin);
  const { data: products, error } = await admin
    .from("products")
    .select("id,slug,price_cents,stock_status,active")
    .order("slug", { ascending: true });
  if (error || !products) {
    return {
      ok: false,
      checked: 0,
      updated: 0,
      errors: [error?.message ?? "Não foi possível ler os produtos"],
      items: [],
    };
  }

  const productsBySlug = new Map(products.map((product) => [product.slug, product]));
  const items: SupplierRunItem[] = [];
  const errors: string[] = [];
  let checked = 0;
  let updated = 0;
  const checkedAt = new Date().toISOString();

  for (const [slug, entry] of Object.entries(monitor.products)) {
    if (!entry.price_auto_adjust || !entry.supplier_item_id) continue;

    const product = productsBySlug.get(slug);
    if (!product || !product.active) continue;

    const current = {
      price_cents: product.price_cents,
      stock_status: product.stock_status as StockStatus,
      stock_status_before: entry.stock_status_before,
    };

    try {
      const quote = await fetchSupplierQuote(entry.supplier_item_id);
      const quoteCheckedAt = quote.checkedAt ?? checkedAt;
      const next = nextSupplierProductState(current, quote);
      const changed =
        next.price_cents !== current.price_cents || next.stock_status !== current.stock_status;

      const { error: updateError } = await admin
        .from("products")
        .update({
          price_cents: next.price_cents,
          stock_status: next.stock_status,
          last_checked_at: quoteCheckedAt,
          updated_at: quoteCheckedAt,
        })
        .eq("id", product.id);
      if (updateError) throw new Error(updateError.message);
      if (changed) updated += 1;
      checked += 1;

      entry.supplier_price_cents = quote.priceCents;
      entry.supplier_available = quote.available;
      entry.supplier_checked_at = quoteCheckedAt;
      entry.last_error = null;
      entry.stock_status_before = next.stock_status_before;

      appendHistory(entry, {
        run_id: runId,
        checked_at: quoteCheckedAt,
        status: "ok",
        supplier_price_cents: quote.priceCents,
        supplier_available: quote.available,
        price_before_cents: current.price_cents,
        price_after_cents: next.price_cents,
        stock_status_before: current.stock_status,
        stock_status_after: next.stock_status,
        message: null,
      });

      items.push({
        slug,
        status: "ok",
        priceAfterCents: next.price_cents,
        stockStatusAfter: next.stock_status,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha desconhecida";
      entry.last_error = message;
      entry.supplier_checked_at = checkedAt;

      appendHistory(entry, {
        run_id: runId,
        checked_at: checkedAt,
        status: "error",
        supplier_price_cents: null,
        supplier_available: null,
        message,
      });

      errors.push(`${slug}: ${message}`);
      items.push({ slug, status: "error", message });
    }
  }

  await writeSupplierMonitor(monitor, admin);

  return {
    ok: errors.length === 0,
    checked,
    updated,
    errors,
    items,
  };
}
