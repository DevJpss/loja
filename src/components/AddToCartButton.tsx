"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import type { Product, ProductVariant } from "@/lib/types";

type Props = {
  product: Pick<
    Product,
    "id" | "slug" | "name" | "image_url" | "price_cents" | "stock_status"
  >;
  variants?: ProductVariant[];
  compact?: boolean;
};

export default function AddToCartButton({ product, variants = [], compact }: Props) {
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [added, setAdded] = useState(false);

  const selected = variants.find((variant) => variant.id === variantId);
  const available = variants.length
    ? selected?.stock_status !== "out_of_stock"
    : product.stock_status !== "out_of_stock";

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [added]);

  function handleClick() {
    if (!available) return;
    addItem({
      product_id: product.id,
      variant_id: selected?.id ?? null,
      slug: product.slug,
      name: product.name,
      image_url: product.image_url,
      unit_price_cents: selected?.price_cents ?? product.price_cents,
      variant_name: selected?.name ?? null,
      qty: 1,
    });
    setAdded(true);
  }

  const sizeClass = compact ? "px-4 text-sm" : "px-7";

  return (
    <div className={compact ? "mt-auto" : ""}>
      {variants.length ? (
        <label className="mb-2 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
            Opção
          </span>
          <select
            value={variantId}
            onChange={(event) => setVariantId(event.target.value)}
            aria-label={`Opção de ${product.name}`}
            className="w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {variants.map((variant) => (
              <option
                key={variant.id}
                value={variant.id}
                disabled={variant.stock_status === "out_of_stock"}
              >
                {variant.name} · R$ {(variant.price_cents / 100).toFixed(2).replace(".", ",")}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={!available}
        aria-label={`Adicionar ${product.name} ao carrinho`}
        className={`pressable inline-flex min-h-11 w-full items-center justify-center font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${
          added ? "bg-emerald-700" : compact ? "bg-ink" : "bg-accent"
        }`}
      >
        <span key={added ? "added" : "idle"} className={added ? "er-fade-up" : ""}>
          {!available
            ? "Esgotado"
            : added
              ? "Adicionado ✓"
              : compact
                ? "Adicionar"
                : "Adicionar ao carrinho"}
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {added ? `${product.name} adicionado ao carrinho.` : ""}
      </span>
    </div>
  );
}
