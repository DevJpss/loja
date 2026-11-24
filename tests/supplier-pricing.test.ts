import assert from "node:assert/strict";
import { test } from "node:test";
import {
  nextSupplierProductState,
  sellingPriceForCost,
} from "../src/lib/supplier-pricing";

test("preço automático usa margem fixa de R$ 23,58", () => {
  assert.equal(sellingPriceForCost(2632), 4990);
  assert.equal(sellingPriceForCost(3000), 5390);
});

test("preço automático arredonda para cima até terminar em ,90", () => {
  assert.equal(sellingPriceForCost(2633), 5090);
  assert.equal(sellingPriceForCost(2632 + 40), 5090);
  assert.equal(sellingPriceForCost(0), 2390);
});

test("indisponibilidade trava a venda e guarda o status anterior", () => {
  const blocked = nextSupplierProductState(
    { price_cents: 4990, stock_status: "available", stock_status_before: null },
    { priceCents: 2700, available: false },
  );

  assert.deepEqual(blocked, {
    price_cents: 5090,
    stock_status: "out_of_stock",
    stock_status_before: "available",
  });
});

test("disponibilidade restaura o status anterior", () => {
  const restored = nextSupplierProductState(
    {
      price_cents: 5090,
      stock_status: "out_of_stock",
      stock_status_before: "available",
    },
    { priceCents: 2632, available: true },
  );

  assert.deepEqual(restored, {
    price_cents: 4990,
    stock_status: "available",
    stock_status_before: null,
  });
});

test("estoque esgotado manualmente não é restaurado pelo fornecedor", () => {
  const unchanged = nextSupplierProductState(
    { price_cents: 4990, stock_status: "out_of_stock", stock_status_before: null },
    { priceCents: 2632, available: true },
  );

  assert.equal(unchanged.stock_status, "out_of_stock");
  assert.equal(unchanged.stock_status_before, null);
});
