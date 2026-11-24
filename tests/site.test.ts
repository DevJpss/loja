import assert from "node:assert/strict";
import { test } from "node:test";
import { jsonLdHtml } from "../src/lib/jsonld";
import { SITE_URL, absoluteUrl, isPublicPartnerUrl } from "../src/lib/site";

test("absoluteUrl monta URLs canônicas sem duplicar barras", () => {
  assert.equal(absoluteUrl(), `${SITE_URL}/`);
  assert.equal(absoluteUrl("/produtos"), `${SITE_URL}/produtos`);
  assert.equal(absoluteUrl("produto/anilha"), `${SITE_URL}/produto/anilha`);
});

test("isPublicPartnerUrl esconde placeholders example.com", () => {
  assert.equal(isPublicPartnerUrl("https://example.com/produto"), false);
  assert.equal(isPublicPartnerUrl("https://www.example.org/x"), false);
  assert.equal(isPublicPartnerUrl("https://loja-parceira.com.br/x"), true);
  assert.equal(isPublicPartnerUrl("javascript:alert(1)"), false);
  assert.equal(isPublicPartnerUrl(null), false);
});

test("jsonLdHtml escapa < para evitar injeção em script", () => {
  const html = jsonLdHtml({ name: "<script>oi</script>" });
  assert.ok(html.includes("\\u003cscript>"));
  assert.ok(!html.includes("<script>"));
});
