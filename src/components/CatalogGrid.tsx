"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

export default function CatalogGrid({ products }: { products: Product[] }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const names = new Set(
      products.map((product) => product.categories?.slug ?? "outros"),
    );
    return ["all", ...Array.from(names)];
  }, [products]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const inCategory =
        category === "all" || (product.categories?.slug ?? "outros") === category;
      const inSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.description ?? "").toLowerCase().includes(term);
      return inCategory && inSearch;
    });
  }, [products, category, query]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => setCategory(slug)}
              className={`border px-4 py-2 text-sm font-medium transition-colors ${
                category === slug
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-panel text-ink hover:border-accent"
              }`}
            >
              {slug === "all" ? "Todos" : slug.replace(/-/g, " ")}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar produto..."
          aria-label="Buscar produto"
          className="ml-auto w-full border border-line bg-white px-4 py-2 text-sm outline-none focus:border-accent sm:w-64"
        />
      </div>

      <p className="mb-4 text-sm text-muted">
        {visible.length} {visible.length === 1 ? "produto" : "produtos"}
      </p>

      {visible.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="border border-line bg-panel p-8 text-center text-muted">
          Nenhum produto encontrado. Tente outra busca.
        </p>
      )}
    </div>
  );
}
