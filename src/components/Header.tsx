import Link from "next/link";
import CartBadge from "./CartBadge";

export default function Header() {
  return (
    <>
      <div className="bg-ink px-4 py-2.5 text-center text-xs tracking-[0.04em] text-white">
        EVERY REP BACKED BY EVIDENCE &nbsp;·&nbsp; Frete grátis acima de R$ 299
      </div>
      <header className="flex flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8 lg:px-16">
        <Link
          href="/"
          className="font-display text-4xl font-bold uppercase tracking-[0.08em] text-ink"
        >
          Evidence Reps
        </Link>
        <nav className="flex flex-wrap items-center gap-6 text-sm font-medium">
          <Link href="/produtos" className="hover:text-accent">
            Produtos
          </Link>
          <CartBadge />
          <Link href="/#categorias" className="hover:text-accent">
            Categorias
          </Link>
          <Link href="/#sobre" className="hover:text-accent">
            Sobre
          </Link>
          <Link
            href="/admin/login"
            className="rounded-sm bg-accent px-4 py-2.5 font-semibold text-white hover:opacity-90"
          >
            Área admin
          </Link>
        </nav>
      </header>
    </>
  );
}
