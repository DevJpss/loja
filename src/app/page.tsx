import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/catalog";
import { jsonLdHtml } from "@/lib/jsonld";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const highlights = products.slice(0, 6);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Destaques Evidence Reps",
    itemListElement: highlights.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteUrl(`/produto/${product.slug}`),
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(itemList) }}
      />
      <section className="flex flex-wrap gap-10 px-4 py-14 sm:px-8 lg:px-16 lg:py-24">
        <div className="flex flex-1 flex-col justify-center gap-7 lg:basis-[52%]">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Treino baseado em evidências
          </span>
          <h1 className="font-display text-[clamp(3.5rem,9vw,8rem)] font-bold uppercase leading-[0.9] tracking-tight">
            Every rep
            <br />
            backed by
            <br />
            evidence.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            Caneleiras, anilhas, bands, straps e acessórios de treino escolhidos
            pela função — para progredir com critério, não com promessas.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/produtos"
              className="inline-flex min-h-12 items-center bg-ink px-7 font-semibold text-white hover:opacity-90"
            >
              Ver produtos
            </Link>
            <Link
              href="#categorias"
              className="inline-flex min-h-12 items-center border-2 border-ink px-7 font-semibold hover:border-accent hover:text-accent"
            >
              Ver categorias
            </Link>
          </div>
        </div>
        <div className="flex flex-1 flex-col lg:basis-[42%]">
          <Link
            href="/produto/polia-baixa-tornozeleira-cross-over"
            className="relative flex min-h-[360px] flex-1 items-end overflow-hidden bg-line/40 p-5"
          >
            <Image
              src="/products/polia-baixa-tornozeleira-1.jpg"
              alt="Par de tornozeleiras de polia baixa para cross over"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-contain p-8 transition-transform duration-300 hover:scale-105"
              unoptimized
              priority
            />
            <span className="relative bg-panel px-3 py-2 text-xs font-semibold uppercase tracking-widest">
              Polia baixa · par →
            </span>
          </Link>
          <div className="grid grid-cols-3 bg-ink text-white">
            <div className="flex flex-col gap-1 p-4">
              <span className="font-display text-xl font-semibold uppercase">1 kg</span>
              <span className="text-xs text-line">Anilhas e carga</span>
            </div>
            <div className="flex flex-col gap-1 border-l border-white/20 p-4">
              <span className="font-display text-xl font-semibold uppercase">Passo a passo</span>
              <span className="text-xs text-line">Progressão de carga</span>
            </div>
            <div className="flex flex-col gap-1 border-l border-white/20 p-4">
              <span className="font-display text-xl font-semibold uppercase">Sem hype</span>
              <span className="text-xs text-line">Só o que funciona</span>
            </div>
          </div>
        </div>
      </section>

      <section id="categorias" className="px-4 py-12 sm:px-8 lg:px-16">
        <h2 className="mb-2 font-display text-5xl font-bold uppercase">Categorias</h2>
        <p className="mb-6 max-w-2xl text-muted">
          Cada linha resolve um problema específico de treino. Escolha pela função, não
          pelo hype.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const count = products.filter(
              (product) => (product.categories?.slug ?? "outros") === category.slug,
            ).length;
            return (
              <Link
                key={category.id}
                href={`/produtos?categoria=${encodeURIComponent(category.slug)}`}
                className="flex flex-col gap-2 bg-panel p-6 transition-colors hover:bg-white"
              >
                <span className="font-display text-3xl font-bold uppercase">
                  {category.name}
                </span>
                <span className="text-sm text-muted">{category.description}</span>
                <span className="mt-auto pt-3 text-xs font-semibold uppercase tracking-wider text-accent">
                  {count} {count === 1 ? "produto" : "produtos"} →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-8 lg:px-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-5xl font-bold uppercase">Destaques</h2>
            <p className="mt-2 text-sm text-muted">
              Itens selecionados para progressão de carga e treino consistente.
            </p>
          </div>
          <Link href="/produtos" className="shrink-0 text-sm font-semibold text-accent">
            Ver todos →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="sobre" className="border-t border-line px-4 py-14 sm:px-8 lg:px-16">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Como pensamos
        </span>
        <h2 className="mt-2 font-display text-4xl font-bold uppercase sm:text-5xl">
          Progresso é repetição com critério
        </h2>
        <div className="mt-6 grid gap-6 text-sm leading-relaxed text-muted sm:grid-cols-3">
          <p>
            <strong className="text-ink">Passos pequenos.</strong> Anilhas de 1 kg e
            1,25 kg permitem ajustar a carga sem trocar toda a configuração da barra,
            apoiando a progressão gradual sem mudar a técnica.
          </p>
          <p>
            <strong className="text-ink">Função antes de aparência.</strong> Straps,
            caneleiras e bands são escolhidos pelo problema que resolvem — pegada,
            estabilidade ou assistência no movimento.
          </p>
          <p>
            <strong className="text-ink">Sem atalhos.</strong> Não vendemos suplementos
            nem prometemos resultados terapêuticos. O equipamento é ferramenta, não
            substituto de treino consistente.
          </p>
        </div>
      </section>
    </main>
  );
}
