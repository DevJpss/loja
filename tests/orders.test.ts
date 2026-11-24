import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildCustomerNotification,
  estimateGatewayFeeCents,
  getWhatsappNumber,
  marginCents,
  parseMoneyToCents,
  settingsToNumberMap,
} from "../src/lib/orders";
import { SITE_URL } from "../src/lib/site";

const settings = settingsToNumberMap([
  { key: "gateway_fee_pix_bps", value: 100 },
  { key: "gateway_fee_card_bps", value: 399 },
  { key: "gateway_fee_fixed_cents", value: 30 },
]);

test("settingsToNumberMap ignora valores não numéricos", () => {
  assert.deepEqual(
    [...settingsToNumberMap([
      { key: "a", value: 10 },
      { key: "b", value: "10" },
    ])],
    [["a", 10]],
  );
});

test("estimateGatewayFeeCents usa bps e valor fixo por método", () => {
  assert.equal(estimateGatewayFeeCents(10000, "pix", settings), 130);
  assert.equal(estimateGatewayFeeCents(10000, "card", settings), 429);
  assert.equal(estimateGatewayFeeCents(10000, null, settings), 130);
});

test("marginCents retorna null sem custo informado", () => {
  assert.equal(marginCents(10000, 4000, 1000, 130), 4870);
  assert.equal(marginCents(10000, null, 1000, 130), null);
  assert.equal(marginCents(1000, 1200, 0, 40), -240);
});

test("parseMoneyToCents aceita vírgula e ponto como separador decimal", () => {
  assert.equal(parseMoneyToCents("1.234,56"), 123456);
  assert.equal(parseMoneyToCents("1234.56"), 123456);
  assert.equal(parseMoneyToCents(""), null);
  assert.equal(parseMoneyToCents("abc"), null);
});

test("getWhatsappNumber normaliza DDI e telefone", () => {
  assert.equal(getWhatsappNumber([{ key: "whatsapp_number", value: "11999998888" }]), "5511999998888");
  assert.equal(getWhatsappNumber([{ key: "whatsapp_number", value: 5511999998888 }]), "");
});

test("buildCustomerNotification monta links com a URL do site", () => {
  const notification = buildCustomerNotification({
    code: "ER-123",
    status: "shipped",
    trackingCode: "ABC123",
    customerName: "Ana",
    email: "ana@example.com",
    phone: "11999998888",
  });
  assert.match(notification.subject, /foi enviado/);
  assert.match(notification.body, /ABC123/);
  assert.ok(notification.body.includes(`${SITE_URL}/pedido/ER-123`));
  assert.ok(notification.whatsapp.startsWith("https://wa.me/5511999998888?"));
  assert.ok(notification.mailto.startsWith("mailto:ana@example.com?"));
});
