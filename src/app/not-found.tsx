import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "O endereço acessado não existe no catálogo da Evidence Reps.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="px-4 py-20 sm:px-8 lg:px-16">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">404</span>
      <h1 className="mt-2 font-display text-6xl font-bold uppercase sm:text-7xl">
        Página não encontrada
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Esse endereço não existe ou o produto saiu do catálogo. Você pode ver todos os
        acessórios disponíveis ou voltar para a página inicial.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/produtos" className="inline-flex min-h-12 items-center bg-ink px-7 font-semibold text-white">
          Ver produtos
        </Link>
        <Link href="/" className="inline-flex min-h-12 items-center border-2 border-ink px-7 font-semibold">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
