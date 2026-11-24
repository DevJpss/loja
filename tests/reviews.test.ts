import assert from "node:assert/strict";
import { test } from "node:test";
import {
  reviewAuthorLabel,
  reviewStars,
  reviewStats,
  reviewStatusLabel,
} from "../src/lib/review-helpers";
import { reviewSchema } from "../src/lib/validation";

test("reviewSchema aceita nota vinda de FormData como string", () => {
  const parsed = reviewSchema.safeParse({
    author_name: " Maria ",
    rating: "5",
    body: "  Ótimo acessório, chegou rápido.  ",
  });
  assert.equal(parsed.success, true);
  if (!parsed.success) return;
  assert.equal(parsed.data.author_name, "Maria");
  assert.equal(parsed.data.rating, 5);
  assert.equal(parsed.data.body, "Ótimo acessório, chegou rápido.");
});

test("reviewSchema rejeita nota fora de 1 a 5 e texto curto", () => {
  const rating = reviewSchema.safeParse({
    author_name: "Maria",
    rating: "6",
    body: "Texto longo o suficiente para passar",
  });
  assert.equal(rating.success, false);

  const body = reviewSchema.safeParse({
    author_name: "Maria",
    rating: "4",
    body: "curto",
  });
  assert.equal(body.success, false);
});

test("reviewStats calcula média, contagem e distribuição", () => {
  const stats = reviewStats([{ rating: 5 }, { rating: 4 }, { rating: 4 }]);
  assert.equal(stats.count, 3);
  assert.equal(stats.average, 4.3);
  assert.deepEqual(stats.distribution, { 1: 0, 2: 0, 3: 0, 4: 2, 5: 1 });
});

test("reviewStats ignora notas inválidas e lida com lista vazia", () => {
  const empty = reviewStats([]);
  assert.equal(empty.count, 0);
  assert.equal(empty.average, null);

  const stats = reviewStats([{ rating: 0 }, { rating: 9 }, { rating: 1 }]);
  assert.equal(stats.count, 1);
  assert.equal(stats.average, 1);
});

test("reviewAuthorLabel não expõe o nome completo", () => {
  assert.equal(reviewAuthorLabel("Maria Aparecida da Silva"), "Maria A.");
  assert.equal(reviewAuthorLabel("João"), "João");
  assert.equal(reviewAuthorLabel("  "), "Cliente verificado");
});

test("reviewStars e reviewStatusLabel produzem texto estável", () => {
  assert.equal(reviewStars(4), "★★★★☆");
  assert.equal(reviewStars(0), "☆☆☆☆☆");
  assert.equal(reviewStatusLabel("pending"), "Aguardando aprovação");
  assert.equal(reviewStatusLabel("outro"), "outro");
});
