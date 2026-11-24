"use client";

import Link from "next/link";

type Props = {
  error: unknown;
  retry: () => void;
};

export default function Error({ retry }: Props) {
  return (
    <main className="px-4 py-20 sm:px-8 lg:px-16">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Ops
      </span>
      <h1 className="mt-2 font-display text-5xl font-bold uppercase sm:text-6xl">
        Algo deu errado
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Não conseguimos carregar esta página agora. Tente novamente; se o problema
        continuar, volte ao início e escolha outro caminho.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={retry}
          className="inline-flex min-h-12 items-center bg-ink px-7 font-semibold text-white"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center border-2 border-ink px-7 font-semibold"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
