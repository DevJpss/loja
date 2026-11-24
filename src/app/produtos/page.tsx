import type { Metadata } from "next";
import { Suspense } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import CatalogGrid from "@/components/CatalogGrid";
import { getCategories, getProducts } from "@/lib/catalog";
import { publicProduct } from "@/lib/public-product";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Catálogo de acessórios de treino",
  description:
    "Caneleiras, anilhas e carga, bands, straps e acessórios de treino no catálogo da Evidence Reps. Filtre por categoria e compre com Pix ou cartão.",
  alternates: { canonical: "/produtos" },
  openGraph: {
    title: `Catálogo | ${SITE_NAME}`,
    description:
      "Caneleiras, anilhas, cinturões e equipamentos para treinar em casa ou na academia.",
    url: "/produtos",
    type: "website",
  },
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <main className="px-4 py-12 sm:px-8 lg:px-16">
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Produtos" }]} />
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Catálogo
      </span>
      <h1 className="mb-3 mt-2 font-display text-6xl font-bold uppercase sm:text-7xl">
        Produtos
      </h1>
      <p className="mb-10 max-w-2xl text-muted">
        Filtre por categoria ou busque pelo nome. Aqui você encontra acessórios e
        equipamentos de treino — nada de suplementos. O pagamento é processado
        pelo gateway: recebemos apenas os dados de entrega.
      </p>
      <Suspense
        fallback={
          <p className="border border-line bg-panel p-8 text-center text-muted">
            Carregando catálogo...
          </p>
        }
      >
        <CatalogGrid products={products.map(publicProduct)} categories={categories} />
      </Suspense>
    </main>
  );
}
