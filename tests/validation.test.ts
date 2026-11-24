import assert from "node:assert/strict";
import { test } from "node:test";
import { paymentWebhookSchema, productSchema } from "../src/lib/validation";

test("paymentWebhookSchema aceita notificação válida do Mercado Pago", () => {
  const result = paymentWebhookSchema.safeParse({
    type: "payment",
    data: { id: 123456 },
    action: "payment.updated",
  });

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.data?.id, 123456);
});

test("paymentWebhookSchema rejeita id ausente ou vazio", () => {
  assert.equal(paymentWebhookSchema.safeParse({ type: "payment" }).success, true);
  assert.equal(paymentWebhookSchema.safeParse({ data: { id: "" } }).success, false);
  assert.equal(paymentWebhookSchema.safeParse({ data: { id: -1 } }).success, false);
});

test("productSchema valida slug, preço e URLs", () => {
  const base = {
    name: "Munhequeira de treino",
    slug: "munhequeira-treino",
    description: "Apoio para treinos",
    category_id: null,
    price_cents: 5890,
    image_url: "https://exemplo.com/img.jpg",
    source_url: "https://exemplo.com/produto",
    stock_status: "available",
    active: true,
  };

  assert.equal(productSchema.safeParse(base).success, true);
  assert.equal(productSchema.safeParse({ ...base, slug: "Slug Inválido" }).success, false);
  assert.equal(productSchema.safeParse({ ...base, price_cents: 0 }).success, false);
  assert.equal(productSchema.safeParse({ ...base, image_url: "javascript:alert(1)" }).success, false);
});
