import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SHIPPING_REGIONS,
  shippingCentsForState,
  shippingRegionForState,
} from "../src/lib/shipping";

const ALL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

test("tabela cobre as 27 UFs exatamente uma vez", () => {
  const mapped = SHIPPING_REGIONS.flatMap((region) => region.states);
  assert.deepEqual([...mapped].sort(), [...ALL_STATES].sort());
  assert.equal(new Set(mapped).size, ALL_STATES.length);
});

test("frete é resolvido por UF, ignorando caixa e espaços", () => {
  assert.equal(shippingCentsForState("SP"), 990);
  assert.equal(shippingCentsForState(" sp "), 990);
  assert.equal(shippingCentsForState("RR"), 3990);
  assert.equal(shippingRegionForState("ap")?.label, "Norte — RR e AP");
});

test("UF desconhecida não recebe frete da tabela", () => {
  assert.equal(shippingCentsForState("XX"), null);
  assert.equal(shippingCentsForState(""), null);
  assert.equal(shippingRegionForState("Sao Paulo"), null);
});

test("valores cobrados cobrem o frete medido na Shopee", () => {
  assert.equal(shippingCentsForState("BA")! >= 1204, true);
  assert.equal(shippingCentsForState("PE")! >= 1448, true);
  assert.equal(shippingCentsForState("CE")! >= 1569, true);
  assert.equal(shippingCentsForState("AM")! >= 2265, true);
  assert.equal(shippingCentsForState("RR")! >= 3359, true);
  assert.equal(shippingCentsForState("AP")! >= 3966, true);
});
