import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

const stockLabels = {
  low: "Últimas unidades",
  out_of_stock: "Esgotado",
  available: null,
} as const;

export default function ProductCard({ product }: { product: Product }) {
  const compare = product.compare_at_price_cents;
  const discount = compare && compare > product.price_cents
    ? Math.round(((compare - product.price_cents) / compare) * 100)
    : 0;
  const stockLabel = stockLabels[product.stock_status];

  return (
    <article className="group flex flex-col border border-line/60 bg-panel transition-colors hover:border-accent">
      <div className="relative aspect-[4/3] overflow-hidden bg-line/30">
        <Link
          href={`/produto/${product.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="block h-full w-full"
        >
          <Image
            src={product.image_url ?? "/products/gear.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </Link>
        {discount || stockLabel ? (
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            {discount ? (
              <span className="bg-accent px-2 py-1 text-xs font-bold text-white">-{discount}%</span>
            ) : null}
            {stockLabel ? (
              <span className="bg-ink px-2 py-1 text-xs font-bold text-white">{stockLabel}</span>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-accent">
          {product.categories?.name ?? "Acessórios"}
        </span>
        <Link href={`/produto/${product.slug}`} className="hover:text-accent">
          <h3 className="font-display text-2xl font-bold uppercase leading-tight">
            {product.name}
          </h3>
          <span className="mt-1 inline-block text-xs font-semibold text-accent">Ver detalhes →</span>
        </Link>
        <p className="line-clamp-2 text-sm text-muted">{product.description}</p>
        <div className="flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-lg font-semibold">{formatPrice(product.price_cents)}</p>
            {compare && compare > product.price_cents ? (
              <p className="text-xs text-muted line-through">{formatPrice(compare)}</p>
            ) : null}
          </div>
        </div>
        <AddToCartButton product={product} compact />
      </div>
    </article>
  );
}
