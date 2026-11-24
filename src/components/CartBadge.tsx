"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";

export default function CartBadge({
  id = "carrinho-menu",
  compact = false,
}: {
  id?: string;
  compact?: boolean;
}) {
  const { items, count, subtotal_cents, setQty, removeItem } = useCart();
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const previousCount = useRef(count);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (count > previousCount.current) {
      setBump(true);
      const timer = window.setTimeout(() => setBump(false), 450);
      previousCount.current = count;
      return () => window.clearTimeout(timer);
    }
    previousCount.current = count;
  }, [count]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`}
        onClick={() => setOpen((value) => !value)}
        className={
          compact
            ? "pressable relative inline-flex min-h-11 min-w-11 items-center justify-center border border-line hover:border-ink"
            : "nav-link pressable inline-flex items-center gap-1.5 py-1 text-sm font-medium"
        }
      >
        {compact ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path
              d="M4 7h16l-1.3 12H5.3L4 7Zm4 0V5a4 4 0 0 1 8 0v2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          "Carrinho"
        )}
        <span
          className={
            compact
              ? `absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center bg-accent px-1 py-0.5 text-[11px] font-semibold text-white ${bump ? "er-badge-pop" : ""}`
              : `inline-flex min-w-5 items-center justify-center bg-accent px-1.5 py-0.5 text-xs font-semibold text-white ${bump ? "er-badge-pop" : ""}`
          }
        >
          {count}
        </span>
        {compact ? null : (
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {open ? (
        <div
          id={id}
          aria-label="Itens do carrinho"
          className="er-drop-in absolute right-0 top-full z-50 mt-3 max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] overflow-auto border border-line bg-white p-4 shadow-[0_18px_50px_-24px_rgba(18,20,24,0.55)]"
        >
          <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
            <p className="font-display text-xl font-bold uppercase">Seu carrinho</p>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              {count} {count === 1 ? "item" : "itens"}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted">Nada por aqui ainda.</p>
              <Link
                href="/produtos"
                onClick={() => setOpen(false)}
                className="pressable mt-3 inline-flex min-h-10 items-center bg-ink px-4 text-sm font-semibold text-white"
              >
                Ver produtos
              </Link>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {items.slice(0, 4).map((item) => {
                  const key = `${item.product_id}:${item.variant_id ?? ""}`;
                  return (
                    <li key={key} className="flex gap-3 py-3">
                      <div className="h-14 w-16 shrink-0 bg-line/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url ?? "/products/gear.svg"}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/produto/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="line-clamp-1 text-sm font-semibold hover:text-accent"
                        >
                          {item.name}
                        </Link>
                        {item.variant_name ? (
                          <p className="text-xs text-muted">{item.variant_name}</p>
                        ) : null}
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="inline-flex border border-line">
                            <button
                              type="button"
                              onClick={() => setQty(item.product_id, item.variant_id, item.qty - 1)}
                              className="pressable h-7 w-7 text-sm hover:bg-panel"
                              aria-label={`Diminuir quantidade de ${item.name}`}
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-xs font-semibold">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty(item.product_id, item.variant_id, item.qty + 1)}
                              className="pressable h-7 w-7 text-sm hover:bg-panel"
                              aria-label={`Aumentar quantidade de ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product_id, item.variant_id)}
                            className="text-xs font-semibold text-red-700 hover:underline"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                      <p className="whitespace-nowrap text-sm font-semibold">
                        {formatPrice(item.unit_price_cents * item.qty)}
                      </p>
                    </li>
                  );
                })}
              </ul>
              {items.length > 4 ? (
                <p className="mt-2 text-xs text-muted">
                  + {items.length - 4} {items.length - 4 === 1 ? "item" : "itens"} no carrinho.
                </p>
              ) : null}
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-sm text-muted">Subtotal</span>
                <strong className="text-base">{formatPrice(subtotal_cents)}</strong>
              </div>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="pressable inline-flex min-h-11 items-center justify-center bg-accent px-4 text-sm font-semibold text-white"
                >
                  Ir para o checkout
                </Link>
                <Link
                  href="/carrinho"
                  onClick={() => setOpen(false)}
                  className="pressable inline-flex min-h-10 items-center justify-center border border-line text-sm font-semibold hover:border-ink"
                >
                  Ver carrinho completo
                </Link>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
