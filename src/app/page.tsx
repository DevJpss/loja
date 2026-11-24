import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/catalog";

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <main>
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
            Caneleiras, anilhas de microloading de 0,25 a 1,25 kg, bands, straps e
            acessórios para progredir em passos pequenos — com critério, não com
            promessas.
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
          <div className="flex min-h-[360px] flex-1 items-end bg-line/40 p-5">
            <span className="bg-panel px-3 py-2 text-xs font-semibold uppercase tracking-widest">
              Gear with a reason
            </span>
          </div>
          <div className="grid grid-cols-3 bg-ink text-white">
            <div className="flex flex-col gap-1 p-4">
              <span className="font-display text-xl font-semibold uppercase">0,25 kg</span>
              <span className="text-xs text-line">Microloading</span>
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
        <h2 className="mb-6 font-display text-5xl font-bold uppercase">Categorias</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href="/produtos"
              className="flex flex-col gap-2 bg-panel p-6 transition-colors hover:bg-white"
            >
              <span className="font-display text-3xl font-bold uppercase">
                {category.name}
              </span>
              <span className="text-sm text-muted">{category.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-8 lg:px-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-5xl font-bold uppercase">Destaques</h2>
          <Link href="/produtos" className="text-sm font-semibold text-accent">
            Ver todos →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
