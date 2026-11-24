import assert from "node:assert/strict";
import { test } from "node:test";
import {
  maskCityState,
  maskEmail,
  maskFullName,
  maskPhone,
} from "../src/lib/privacy";

test("maskFullName expõe apenas o primeiro nome", () => {
  assert.equal(maskFullName("Maria Aparecida da Silva"), "Maria");
  assert.equal(maskFullName("  João  Pereira "), "João");
  assert.equal(maskFullName(null), "Cliente");
});

test("maskEmail esconde o endereço local mas mantém o domínio", () => {
  const masked = maskEmail("maria.silva@exemplo.com.br");
  assert.equal(masked, "m•••@exemplo.com.br");
  assert.ok(!masked.includes("maria.silva"));
  assert.equal(maskEmail("sem-arroba"), "••••");
});

test("maskPhone mantém DDD e últimos quatro dígitos", () => {
  assert.equal(maskPhone("+55 (11) 99999-1234"), "(11) •••••-1234");
  assert.equal(maskPhone("1133331234"), "(11) •••••-1234");
  assert.equal(maskPhone("11999"), "••••");
});

test("maskCityState não revela rua, número, bairro nem CEP", () => {
  const address = {
    street: "Rua das Flores",
    number: "123",
    complement: "Apto 4",
    neighborhood: "Centro",
    city: "Rio de Janeiro",
    state: "RJ",
    cep: "20040-002",
  };
  const masked = maskCityState(address);

  assert.equal(masked, "Rio de Janeiro/RJ");
  assert.ok(!masked.includes("Rua das Flores"));
  assert.ok(!masked.includes("20040-002"));
  assert.equal(maskCityState({}), "Local não informado");
});
