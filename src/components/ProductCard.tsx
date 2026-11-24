import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col border border-line/60 bg-panel transition-colors hover:border-accent">
      <Link href={`/produto/${product.slug}`} className="block aspect-[4/3] overflow-hidden bg-line/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url ?? "/products/gear.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-accent">
          {product.categories?.name ?? "Acessórios"}
        </span>
        <Link href={`/produto/${product.slug}`}>
          <h3 className="font-display text-2xl font-bold uppercase leading-tight hover:text-accent">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-2 text-sm text-muted">{product.description}</p>
        <div className="flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-lg font-semibold">{formatPrice(product.price_cents)}</p>
            {product.compare_at_price_cents ? (
              <p className="text-xs text-muted line-through">
                {formatPrice(product.compare_at_price_cents)}
              </p>
            ) : null}
          </div>
          <Link href={`/produto/${product.slug}`} className="text-sm font-semibold text-accent">
            Ver →
          </Link>
        </div>
        <AddToCartButton product={product} compact />
      </div>
    </article>
  );
}
