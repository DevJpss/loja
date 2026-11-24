"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import { normalizeSearch } from "@/lib/reports";
import type { Category, Product } from "@/lib/types";

type Props = {
  products: Product[];
  categories: Category[];
};

type CategoryOption = { slug: string; label: string; count: number };

export default function CatalogGrid({ products, categories }: Props) {
  const searchParams = useSearchParams();

  const options = useMemo<CategoryOption[]>(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const slug = product.categories?.slug ?? "outros";
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }

    const known = categories
      .filter((category) => counts.has(category.slug))
      .map((category) => ({
        slug: category.slug,
        label: category.name,
        count: counts.get(category.slug) ?? 0,
      }));
    const extras = Array.from(counts.entries())
      .filter(([slug]) => !categories.some((category) => category.slug === slug))
      .map(([slug, count]) => ({
        slug,
        label: slug.replace(/-/g, " "),
        count,
      }));

    return [...known, ...extras];
  }, [products, categories]);

  const [category, setCategory] = useState(() => {
    const initial = searchParams.get("categoria") ?? "all";
    return options.some((option) => option.slug === initial) ? initial : "all";
  });
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = normalizeSearch(query);
    return products.filter((product) => {
      const slug = product.categories?.slug ?? "outros";
      const inCategory = category === "all" || slug === category;
      if (!inCategory) return false;
      if (!term) return true;
      const haystack = [
        product.name,
        product.description ?? "",
        product.categories?.name ?? "",
        ...Object.values(product.specs ?? {}),
      ].join(" ");
      return normalizeSearch(haystack).includes(term);
    });
  }, [products, category, query]);

  const filtered = category !== "all" || query.trim().length > 0;

  function selectCategory(slug: string) {
    setCategory(slug);
    const url = new URL(window.location.href);
    if (slug === "all") url.searchParams.delete("categoria");
    else url.searchParams.set("categoria", slug);
    window.history.replaceState(null, "", url);
  }

  function clearFilters() {
    setCategory("all");
    setQuery("");
    const url = new URL(window.location.href);
    url.searchParams.delete("categoria");
    window.history.replaceState(null, "", url);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-1 flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => selectCategory("all")}
            className={`border px-4 py-2 text-sm font-medium transition-colors ${
              category === "all"
                ? "border-ink bg-ink text-white"
                : "border-line bg-panel text-ink hover:border-accent"
            }`}
          >
            Todos <span className="opacity-70">({products.length})</span>
          </button>
          {options.map((option) => (
            <button
              key={option.slug}
              type="button"
              aria-pressed={category === option.slug}
              onClick={() => selectCategory(option.slug)}
              className={`border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                category === option.slug
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-panel text-ink hover:border-accent"
              }`}
            >
              {option.label} <span className="opacity-70">({option.count})</span>
            </button>
          ))}
        </div>
        <label className="flex w-full flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-muted sm:w-64">
          Buscar no catálogo
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome, categoria ou especificação"
            className="w-full border border-line bg-white px-4 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm text-muted">
          {visible.length} {visible.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
        {filtered ? (
          <button type="button" onClick={clearFilters} className="text-sm font-semibold text-accent hover:underline">
            Limpar filtros
          </button>
        ) : null}
      </div>

      {visible.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="border border-line bg-panel p-8 text-center">
          <p className="text-muted">Nenhum produto encontrado com esses filtros.</p>
          <button type="button" onClick={clearFilters} className="mt-3 font-semibold text-accent hover:underline">
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
