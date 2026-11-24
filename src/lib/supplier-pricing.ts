import type { StockStatus } from "./types";

/**
 * Margem usada no reajuste automático: custo do fornecedor + R$ 23,58.
 * O resultado é sempre arredondado para cima até terminar em ,90 para não
 * corroer a margem quando o custo sobe alguns centavos.
 */
export const SUPPLIER_MARGIN_CENTS = 2358;

export function sellingPriceForCost(costCents: number): number {
  if (!Number.isFinite(costCents) || costCents < 0) {
    throw new Error("Custo do fornecedor inválido");
  }

  const raw = Math.round(costCents) + SUPPLIER_MARGIN_CENTS;
  const remainder = raw % 100;
  return remainder <= 90 ? raw - remainder + 90 : raw + (100 - remainder) + 90;
}

type CurrentSupplierState = {
  price_cents: number;
  stock_status: StockStatus;
  stock_status_before?: StockStatus | null;
};

type QuoteState = {
  priceCents?: number | null;
  available: boolean;
};

export type NextSupplierState = {
  price_cents: number;
  stock_status: StockStatus;
  stock_status_before: StockStatus | null;
};

/**
 * Aplica o resultado da checagem ao estado vendável do produto.
 * Quando o fornecedor volta a ficar disponível, o status anterior é
 * restaurado — salvo se a indisponibilidade tiver sido manual.
 */
export function nextSupplierProductState(
  current: CurrentSupplierState,
  quote: QuoteState,
): NextSupplierState {
  const priceCents =
    quote.priceCents == null ? current.price_cents : sellingPriceForCost(quote.priceCents);

  let stockStatus: StockStatus = current.stock_status;
  let stockStatusBefore: StockStatus | null = current.stock_status_before ?? null;

  if (!quote.available) {
    if (stockStatus !== "out_of_stock") stockStatusBefore = current.stock_status;
    stockStatus = "out_of_stock";
  } else if (stockStatusBefore) {
    stockStatus = stockStatusBefore;
    stockStatusBefore = null;
  }

  return {
    price_cents: priceCents,
    stock_status: stockStatus,
    stock_status_before: stockStatusBefore,
  };
}
