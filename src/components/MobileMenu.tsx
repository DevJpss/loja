"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CategoryLink = { slug: string; name: string };

export default function MobileMenu({ categories }: { categories: CategoryLink[] }) {
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

  function close() {
    setOpen(false);
  }

  return (
    <div ref={root} className="relative lg:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={open ? "menu-mobile" : undefined}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        onClick={() => setOpen((value) => !value)}
        className="pressable inline-flex min-h-11 items-center gap-2 border border-line px-3 text-sm font-semibold hover:border-ink"
      >
        <span aria-hidden="true" className="flex h-4 w-4 flex-col justify-center gap-1">
          <span
            className={`block h-0.5 w-full bg-current transition-transform duration-200 ${open ? "translate-y-[3px] rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-full bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-full bg-current transition-transform duration-200 ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
          />
        </span>
        Menu
      </button>

      {open ? (
        <div
          id="menu-mobile"
          aria-label="Navegação principal"
          className="er-drop-in absolute right-0 top-full z-50 mt-3 max-h-[70vh] w-[min(20rem,calc(100vw-2rem))] overflow-auto border border-line bg-white p-2 shadow-[0_18px_50px_-24px_rgba(18,20,24,0.55)]"
        >
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Navegação
          </p>
          <Link
            href="/produtos"
            onClick={close}
            className="block px-3 py-2.5 text-sm font-semibold hover:bg-panel hover:text-accent"
          >
            Produtos
          </Link>
          <Link
            href="/#sobre"
            onClick={close}
            className="block px-3 py-2.5 text-sm hover:bg-panel hover:text-accent"
          >
            Sobre
          </Link>
          <Link
            href="/faq"
            onClick={close}
            className="block px-3 py-2.5 text-sm hover:bg-panel hover:text-accent"
          >
            FAQ
          </Link>

          <p className="mt-2 border-t border-line px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Categorias
          </p>
          <Link
            href="/produtos"
            onClick={close}
            className="block px-3 py-2 text-sm hover:bg-panel hover:text-accent"
          >
            Todos os produtos
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/produtos?categoria=${encodeURIComponent(category.slug)}`}
              onClick={close}
              className="block px-3 py-2 text-sm hover:bg-panel hover:text-accent"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/#categorias"
            onClick={close}
            className="block px-3 py-2 text-sm text-muted hover:bg-panel hover:text-accent"
          >
            Ver destaques na home →
          </Link>

          <Link
            href="/admin/login"
            onClick={close}
            className="pressable mt-3 block px-3 py-2.5 text-center text-sm font-semibold bg-accent text-white"
          >
            Área admin
          </Link>
        </div>
      ) : null}
    </div>
  );
}
