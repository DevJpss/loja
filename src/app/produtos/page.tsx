import type { Metadata } from "next";
import CatalogGrid from "@/components/CatalogGrid";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Catálogo de acessórios de treino Evidence Reps.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="px-4 py-12 sm:px-8 lg:px-16">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Catálogo
      </span>
      <h1 className="mb-3 mt-2 font-display text-6xl font-bold uppercase sm:text-7xl">
        Produtos
      </h1>
      <p className="mb-10 max-w-2xl text-muted">
        Filtre por categoria ou busque pelo nome. Adicione itens ao carrinho e
        finalize com Pix ou cartão. Seus dados de pagamento ficam no gateway;
        recebemos apenas as informações de entrega.
      </p>
      <CatalogGrid products={products} />
    </main>
  );
}
