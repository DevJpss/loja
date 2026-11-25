import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";
import SnapSections from "@/components/SnapSections";
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
      <SnapSections>
        <section
          data-snap-section
          className="px-4 py-14 sm:px-8 lg:px-16 lg:py-24"
        >
          <div className="er-snap-visual flex w-full flex-wrap gap-10">
            <ScrollReveal
              className="flex flex-1 flex-col justify-center gap-7 lg:basis-[52%]"
              depth={1.15}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Acessórios para treino
              </span>
              <h1 className="font-display text-[clamp(3.5rem,9vw,8rem)] font-bold uppercase leading-[0.9] tracking-tight">
                Every rep
                <br />
                backed by
                <br />
                evidence.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted">
                Caneleiras, anilhas, bands, straps e equipamentos para treinar em casa
                ou na academia. Do aquecimento à última série, o que você precisa para
                seguir sua rotina.
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
            </ScrollReveal>
            <ScrollReveal
              className="flex flex-1 flex-col lg:basis-[42%]"
              depth={0.85}
              delay={90}
            >
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
                  <span className="font-display text-xl font-semibold uppercase">Sem suplementos</span>
                  <span className="text-xs text-line">Só equipamento</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section
          id="categorias"
          data-snap-section
          className="px-4 py-12 sm:px-8 lg:px-16"
        >
          <div className="er-snap-visual w-full">
            <ScrollReveal depth={1}>
              <h2 className="mb-2 font-display text-5xl font-bold uppercase">Categorias</h2>
              <p className="mb-6 max-w-2xl text-muted">
                Cada linha resolve uma necessidade do treino. Escolha o que combina com a
                sua rotina.
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
            </ScrollReveal>
          </div>
        </section>

        <section data-snap-section className="px-4 py-12 sm:px-8 lg:px-16">
          <div className="er-snap-visual w-full">
            <ScrollReveal depth={0.75}>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-5xl font-bold uppercase">Destaques</h2>
                  <p className="mt-2 text-sm text-muted">
                    Itens para montar ou ampliar sua rotina de treino.
                  </p>
                </div>
                <Link href="/produtos" className="shrink-0 text-sm font-semibold text-accent">
                  Ver todos →
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {highlights.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section
          id="sobre"
          data-snap-section
          className="border-t border-line px-4 py-14 sm:px-8 lg:px-16"
        >
          <div className="er-snap-visual w-full">
            <ScrollReveal depth={1}>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Sobre a loja
              </span>
              <h2 className="mt-2 font-display text-4xl font-bold uppercase sm:text-5xl">
                Equipamento para treinar no seu ritmo
              </h2>
              <div className="mt-6 grid gap-6 text-sm leading-relaxed text-muted sm:grid-cols-3">
                <p>
                  <strong className="text-ink">Passos pequenos.</strong> Anilhas de 1 kg e
                  1,25 kg permitem ajustar a carga sem trocar toda a configuração da barra.
                </p>
                <p>
                  <strong className="text-ink">Função antes de aparência.</strong> Straps,
                  caneleiras, cinturões e bands ajudam com pegada, estabilidade e apoio nos
                  movimentos.
                </p>
                <p>
                  <strong className="text-ink">Sem suplementos.</strong> Aqui você encontra
                  equipamento para treinar — do aquecimento ao último movimento da série.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </SnapSections>
    </main>
  );
}
