import { absoluteUrl } from "./site";
import {
  estimateGatewayFeeCents,
  marginCents,
  type PaymentMethod,
} from "./orders";

export type ReportOrder = {
  id: string;
  code: string;
  status: string;
  total_cents: number;
  cost_cents: number | null;
  shipping_cents: number;
  created_at: string;
  customer_name?: string | null;
  customer_email?: string | null;
  payment_method?: PaymentMethod;
};

export type OrderFilters = {
  query?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: string;
};

const NO_REVENUE = new Set(["pending_payment", "cancelled", "refunded"]);

export function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filterOrders(orders: ReportOrder[], filters: OrderFilters): ReportOrder[] {
  const term = normalizeSearch(filters.query ?? "");
  const from = filters.from?.trim() ?? "";
  const to = filters.to?.trim() ?? "";

  return orders.filter((order) => {
    if (filters.status && order.status !== filters.status) return false;
    const day = order.created_at.slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    if (!term) return true;
    return normalizeSearch(
      [order.code, order.customer_name ?? "", order.customer_email ?? ""].join(" "),
    ).includes(term);
  });
}

export type OrderSummary = {
  totalOrders: number;
  billedOrders: number;
  revenueCents: number;
  costCents: number;
  feeCents: number;
  shippingCents: number;
  marginCents: number;
  marginPercent: number | null;
  averageTicketCents: number;
  pricedOrders: number;
};

export function summarizeOrders(orders: ReportOrder[], settings: Map<string, number>): OrderSummary {
  const billed = orders.filter((order) => !NO_REVENUE.has(order.status));
  const revenueCents = billed.reduce((sum, order) => sum + order.total_cents, 0);
  const shippingCents = billed.reduce((sum, order) => sum + order.shipping_cents, 0);
  let costCents = 0;
  let feeCents = 0;
  let marginCentsTotal = 0;
  let pricedOrders = 0;

  for (const order of billed) {
    const fee = estimateGatewayFeeCents(order.total_cents, order.payment_method ?? null, settings);
    const margin = marginCents(order.total_cents, order.cost_cents, order.shipping_cents, fee);
    feeCents += fee;
    if (margin == null) continue;
    costCents += order.cost_cents ?? 0;
    marginCentsTotal += margin;
    pricedOrders += 1;
  }

  return {
    totalOrders: orders.length,
    billedOrders: billed.length,
    revenueCents,
    costCents,
    feeCents,
    shippingCents,
    marginCents: marginCentsTotal,
    marginPercent: revenueCents > 0 ? Math.round((marginCentsTotal / revenueCents) * 1000) / 10 : null,
    averageTicketCents: billed.length ? Math.round(revenueCents / billed.length) : 0,
    pricedOrders,
  };
}

export type Page<T> = {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
};

export function paginate<T>(items: T[], page: string | number | undefined, perPage = 15): Page<T> {
  const requested = typeof page === "number" ? page : Number.parseInt(page ?? "", 10);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Number.isFinite(requested) && requested > 0 ? Math.min(requested, totalPages) : 1;
  const start = (current - 1) * perPage;
  return { items: items.slice(start, start + perPage), page: current, totalPages, total: items.length };
}

function csvCell(value: string | number | null | undefined): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function buildOrdersCsv(orders: ReportOrder[], settings: Map<string, number>): string {
  const header = [
    "Pedido",
    "Link",
    "Cliente",
    "E-mail",
    "Status",
    "Data",
    "Total (R$)",
    "Custo (R$)",
    "Frete (R$)",
    "Taxa estimada (R$)",
    "Margem (R$)",
  ];
  const money = (cents: number | null) => (cents == null ? "" : (cents / 100).toFixed(2).replace(".", ","));
  const rows = orders.map((order) => {
    const fee = estimateGatewayFeeCents(order.total_cents, order.payment_method ?? null, settings);
    const margin = marginCents(order.total_cents, order.cost_cents, order.shipping_cents, fee);
    return [
      csvCell(order.code),
      csvCell(absoluteUrl(`/admin/pedidos/${encodeURIComponent(order.id)}`)),
      csvCell(order.customer_name),
      csvCell(order.customer_email),
      csvCell(order.status),
      csvCell(order.created_at),
      csvCell(money(order.total_cents)),
      csvCell(money(order.cost_cents)),
      csvCell(money(order.shipping_cents)),
      csvCell(money(fee)),
      csvCell(money(margin)),
    ].join(";");
  });
  return `\uFEFF${header.map(csvCell).join(";")}\r\n${rows.join("\r\n")}`;
}
