import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";
import { getProductBySlug, getProducts } from "@/lib/catalog";

type Props = PageProps<"/produto/[slug]">;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? "Produto",
    description: product?.description ?? undefined,
  };
}

async function ProductDetails({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mt-6 grid gap-10 lg:grid-cols-2">
      <div className="flex min-h-[420px] items-end bg-line/40 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url ?? "/products/gear.svg"}
          alt={product.name}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex flex-col gap-6">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          {product.categories?.name ?? "Acessórios"}
        </span>
        <h1 className="font-display text-5xl font-bold uppercase leading-none sm:text-6xl">
          {product.name}
        </h1>
        <p className="max-w-xl leading-relaxed text-muted">{product.description}</p>

        <div className="border-y border-line py-4">
          <p className="text-3xl font-semibold">{formatPrice(product.price_cents)}</p>
          {product.compare_at_price_cents ? (
            <p className="text-sm text-muted line-through">
              {formatPrice(product.compare_at_price_cents)}
            </p>
          ) : null}
        </div>

        {product.product_variants?.length ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider">Opções</p>
            <div className="flex flex-wrap gap-2">
              {product.product_variants.map((variant) => (
                <span
                  key={variant.id}
                  className="border border-line bg-panel px-4 py-2 text-sm"
                >
                  {variant.name} · {formatPrice(variant.price_cents)}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {Object.entries(product.specs ?? {}).length ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider">Especificações</p>
            <dl className="divide-y divide-line border-y border-line text-sm">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-muted">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <AddToCartButton product={product} variants={product.product_variants} />
        <a
          href={product.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-muted underline-offset-4 hover:text-accent hover:underline"
        >
          Ver na loja parceira ↗
        </a>
      </div>
    </div>
  );
}

export default function ProductPage(props: Props) {
  return (
    <main className="px-4 py-12 sm:px-8 lg:px-16">
      <Link href="/produtos" className="text-sm font-semibold text-accent">
        ← Voltar para produtos
      </Link>
      <Suspense
        fallback={
          <p className="mt-8 border border-line bg-panel p-8 text-center text-muted">
            Carregando produto...
          </p>
        }
      >
        <ProductDetails {...props} />
      </Suspense>
    </main>
  );
}
