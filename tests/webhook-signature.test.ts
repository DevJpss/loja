import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { after, test } from "node:test";
import { verifyWebhookSignature } from "../src/lib/payments/mercadopago";

const SECRET = "webhook-secret-de-teste";
const originalSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

after(() => {
  if (originalSecret === undefined) {
    delete process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  } else {
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = originalSecret;
  }
});

function signature(ts: string, requestId: string, dataId: string, secret = SECRET) {
  const manifest = `id:[${dataId}];request-id:[${requestId}];ts:[${ts}];`;
  return { ts, v1: createHmac("sha256", secret).update(manifest).digest("hex") };
}

function header(sig: { ts: string; v1: string }): string {
  return `ts=${sig.ts},v1=${sig.v1}`;
}

test("verifyWebhookSignature aceita assinatura válida", () => {
  process.env.MERCADO_PAGO_WEBHOOK_SECRET = SECRET;
  const sig = signature("1700000000", "req-1", "12345");

  assert.equal(
    verifyWebhookSignature({
      signatureHeader: header(sig),
      requestId: "req-1",
      dataId: "12345",
    }),
    true,
  );
});

test("verifyWebhookSignature rejeita segredo, dados e cabeçalhos divergentes", () => {
  process.env.MERCADO_PAGO_WEBHOOK_SECRET = SECRET;
  const sig = signature("1700000000", "req-1", "12345");
  const input = {
    signatureHeader: header(sig),
    requestId: "req-1",
    dataId: "12345",
  };

  assert.equal(
    verifyWebhookSignature({ ...input, dataId: "99999" }),
    false,
    "data id alterado invalida o HMAC",
  );
  assert.equal(
    verifyWebhookSignature({ ...input, requestId: "req-2" }),
    false,
    "request id alterado invalida o HMAC",
  );
  assert.equal(
    verifyWebhookSignature({
      ...input,
      signatureHeader: header({
        ts: sig.ts,
        v1: signature("1700000001", "req-1", "12345").v1,
      }),
    }),
    false,
    "timestamp do cabeçalho divergente do HMAC é rejeitado",
  );
  assert.equal(
    verifyWebhookSignature({ ...input, signatureHeader: "ts=1700000000,v1=zz" }),
    false,
    "hash malformado é rejeitado",
  );
  assert.equal(verifyWebhookSignature({ ...input, signatureHeader: null }), false);
});

test("verifyWebhookSignature exige segredo configurado", () => {
  delete process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const sig = signature("1700000000", "req-1", "12345");

  assert.equal(
    verifyWebhookSignature({
      signatureHeader: header(sig),
      requestId: "req-1",
      dataId: "12345",
    }),
    false,
  );
});
