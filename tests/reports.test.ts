import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildOrdersCsv,
  filterOrders,
  firstParam,
  normalizeSearch,
  paginate,
  summarizeOrders,
  type ReportOrder,
} from "../src/lib/reports";
import { settingsToNumberMap } from "../src/lib/orders";

const settings = settingsToNumberMap([
  { key: "gateway_fee_pix_bps", value: 100 },
  { key: "gateway_fee_card_bps", value: 399 },
  { key: "gateway_fee_fixed_cents", value: 30 },
]);

function orders(): ReportOrder[] {
  return [
    {
      id: "1",
      code: "ER-001",
      status: "paid",
      total_cents: 10000,
      cost_cents: 4000,
      shipping_cents: 1000,
      created_at: "2026-11-20T10:00:00Z",
      customer_name: "João Silva",
      customer_email: "joao@example.com",
      payment_method: "pix",
    },
    {
      id: "2",
      code: "ER-002",
      status: "paid",
      total_cents: 20000,
      cost_cents: null,
      shipping_cents: 0,
      created_at: "2026-11-21T10:00:00Z",
      customer_name: "Maria",
      customer_email: "maria@example.com",
      payment_method: "card",
    },
    {
      id: "3",
      code: "ER-003",
      status: "cancelled",
      total_cents: 5000,
      cost_cents: 2000,
      shipping_cents: 500,
      created_at: "2026-11-22T10:00:00Z",
      customer_name: "João Cancelado",
      customer_email: "outro@example.com",
      payment_method: "pix",
    },
  ];
}

test("normalizeSearch remove acentos e caixa", () => {
  assert.equal(normalizeSearch("  Câmara de Aço  "), "camara de aco");
});

test("firstParam aceita string, array e vazio", () => {
  assert.equal(firstParam("pix"), "pix");
  assert.equal(firstParam(["paid", "cancelado"]), "paid");
  assert.equal(firstParam(undefined), "");
});

test("filterOrders cruza status, período e busca sem acentos", () => {
  assert.deepEqual(filterOrders(orders(), {}).map((order) => order.code), ["ER-001", "ER-002", "ER-003"]);
  assert.deepEqual(
    filterOrders(orders(), { query: "joao", status: "paid" }).map((order) => order.code),
    ["ER-001"],
  );
  assert.deepEqual(
    filterOrders(orders(), { from: "2026-11-21", to: "2026-11-22" }).map((order) => order.code),
    ["ER-002", "ER-003"],
  );
  assert.deepEqual(filterOrders(orders(), { query: "inexistente" }), []);
});

test("summarizeOrders ignora cancelados e calcula margem com taxa", () => {
  const summary = summarizeOrders(orders(), settings);
  assert.equal(summary.totalOrders, 3);
  assert.equal(summary.billedOrders, 2);
  assert.equal(summary.revenueCents, 30000);
  assert.equal(summary.feeCents, 958);
  assert.equal(summary.costCents, 4000);
  assert.equal(summary.shippingCents, 1000);
  assert.equal(summary.marginCents, 4870);
  assert.equal(summary.marginPercent, 16.2);
  assert.equal(summary.averageTicketCents, 15000);
  assert.equal(summary.pricedOrders, 1);
});

test("paginate limita a página e fatiamento", () => {
  const page = paginate(orders(), "2", 2);
  assert.equal(page.page, 2);
  assert.equal(page.totalPages, 2);
  assert.equal(page.total, 3);
  assert.deepEqual(page.items.map((order) => order.code), ["ER-003"]);
  assert.equal(paginate(orders(), "99", 2).page, 2);
  assert.equal(paginate(orders(), "abc", 2).page, 1);
});

test("buildOrdersCsv inclui BOM, cabeçalho e escape de aspas", () => {
  const withQuotes = orders();
  withQuotes[0].customer_name = 'Loja "X"';
  const csv = buildOrdersCsv(withQuotes.slice(0, 1), settings);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /Pedido";"Link";"Cliente/);
  assert.match(csv, /Loja ""X""/);
  assert.match(csv, /"48,70"/);
});
