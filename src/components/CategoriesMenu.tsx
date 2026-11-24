"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CategoryLink = { slug: string; name: string };

export default function CategoriesMenu({ categories }: { categories: CategoryLink[] }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

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
        aria-controls={open ? "categorias-menu" : undefined}
        onClick={() => setOpen((value) => !value)}
        className="nav-link pressable inline-flex items-center gap-1.5 py-1 text-sm font-medium"
      >
        Categorias
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
      </button>

      {open ? (
        <div
          id="categorias-menu"
          className="er-drop-in absolute left-0 top-full z-50 mt-3 max-h-[70vh] w-72 overflow-auto border border-line bg-white p-2 shadow-[0_18px_50px_-24px_rgba(18,20,24,0.55)]"
        >
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Comprar por categoria
          </p>
          <Link
            href="/produtos"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm font-semibold hover:bg-panel hover:text-accent"
          >
            Todos os produtos
          </Link>
          <div className="my-1 border-t border-line" />
          {categories.length ? (
            categories.map((category) => (
              <Link
                key={category.slug}
                href={`/produtos?categoria=${encodeURIComponent(category.slug)}`}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm hover:bg-panel hover:text-accent"
              >
                {category.name}
              </Link>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-muted">Nenhuma categoria ativa.</p>
          )}
          <div className="my-1 border-t border-line" />
          <Link
            href="/#categorias"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-muted hover:bg-panel hover:text-accent"
          >
            Ver destaques na home →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
