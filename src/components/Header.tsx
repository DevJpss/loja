import Link from "next/link";
import { getCategories } from "@/lib/catalog";
import CartBadge from "./CartBadge";
import CategoriesMenu from "./CategoriesMenu";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const categories = (await getCategories()).map(({ name, slug }) => ({ name, slug }));

  return (
    <>
      <div className="bg-ink px-4 py-2.5 text-center text-xs tracking-[0.04em] text-white">
        EVERY REP BACKED BY EVIDENCE &nbsp;·&nbsp; Frete grátis acima de R$ 299
      </div>
      <header
        style={{ viewTransitionName: "er-header" }}
        className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-line/70 bg-canvas/95 px-4 py-4 backdrop-blur sm:px-8 lg:px-16"
      >
        <Link
          href="/"
          className="font-display text-3xl font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:text-accent sm:text-4xl"
        >
          Evidence Reps
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-6 text-sm font-medium lg:flex"
        >
          <Link href="/produtos" className="nav-link py-1">
            Produtos
          </Link>
          <CategoriesMenu categories={categories} />
          <Link href="/#sobre" className="nav-link py-1">
            Sobre
          </Link>
          <Link href="/faq" className="nav-link py-1">
            FAQ
          </Link>
          <CartBadge id="carrinho-desktop" />
          <Link
            href="/admin/login"
            className="pressable rounded-sm bg-accent px-4 py-2.5 font-semibold text-white hover:opacity-90"
          >
            Área admin
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <CartBadge id="carrinho-mobile" compact />
          <MobileMenu categories={categories} />
        </div>
      </header>
    </>
  );
}
