"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal_cents, setQty, removeItem } = useCart();

  return (
    <main className="px-4 py-12 sm:px-8 lg:px-16">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Seu pedido
      </span>
      <h1 className="mb-8 mt-2 font-display text-6xl font-bold uppercase sm:text-7xl">
        Carrinho
      </h1>

      {items.length === 0 ? (
        <div className="border border-line bg-panel p-8 text-center">
          <p className="mb-4 text-muted">Seu carrinho está vazio.</p>
          <Link href="/produtos" className="inline-flex min-h-11 items-center bg-ink px-6 font-semibold text-white">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="divide-y divide-line border-y border-line">
            {items.map((item) => {
              const key = `${item.product_id}:${item.variant_id ?? ""}`;
              return (
                <div key={key} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="h-20 w-24 shrink-0 bg-line/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url ?? "/products/gear.svg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-40 flex-1">
                    <Link href={`/produto/${item.slug}`} className="font-display text-xl font-bold uppercase hover:text-accent">
                      {item.name}
                    </Link>
                    {item.variant_name ? (
                      <p className="text-sm text-muted">{item.variant_name}</p>
                    ) : null}
                    <p className="text-sm font-semibold">{formatPrice(item.unit_price_cents)}</p>
                  </div>
                  <div className="flex items-center border border-line">
                    <button
                      type="button"
                      onClick={() => setQty(item.product_id, item.variant_id, item.qty - 1)}
                      className="h-9 w-9 text-lg hover:bg-panel"
                      aria-label="Diminuir quantidade"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(item.product_id, item.variant_id, item.qty + 1)}
                      className="h-9 w-9 text-lg hover:bg-panel"
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-24 text-right font-semibold">
                    {formatPrice(item.unit_price_cents * item.qty)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product_id, item.variant_id)}
                    className="text-sm font-semibold text-red-700 hover:underline"
                  >
                    Remover
                  </button>
                </div>
              );
            })}
          </div>

          <aside className="h-fit border border-line bg-white p-6">
            <h2 className="mb-4 font-display text-2xl font-bold uppercase">Resumo</h2>
            <div className="flex justify-between border-b border-line pb-3 text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal_cents)}</span>
            </div>
            <p className="mt-3 text-xs text-muted">
              O frete é calculado no checkout. Frete grátis acima de R$ 299.
            </p>
            <Link
              href="/checkout"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-accent px-6 font-semibold text-white hover:opacity-90"
            >
              Ir para o checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
