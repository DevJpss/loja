"use client";

import { useState } from "react";
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
  const available = variants.length ? selected?.stock_status !== "out_of_stock" : product.stock_status !== "out_of_stock";

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
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className={compact ? "mt-auto" : ""}>
      {variants.length ? (
        <select
          value={variantId}
          onChange={(event) => setVariantId(event.target.value)}
          aria-label={`Opção de ${product.name}`}
          className="mb-2 w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        >
          {variants.map((variant) => (
            <option
              key={variant.id}
              value={variant.id}
              disabled={variant.stock_status === "out_of_stock"}
            >
              {variant.name}
            </option>
          ))}
        </select>
      ) : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={!available}
        className={`inline-flex min-h-11 w-full items-center justify-center font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${compact ? "bg-ink px-4 text-sm" : "bg-accent px-7"}`}
      >
        {!available
          ? "Esgotado"
          : added
            ? "Adicionado ✓"
            : compact
              ? "Adicionar"
              : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}
