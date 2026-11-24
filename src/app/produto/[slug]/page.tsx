import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { jsonLdHtml } from "@/lib/jsonld";
import AddToCartButton from "@/components/AddToCartButton";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { SITE_NAME, absoluteUrl, isPublicPartnerUrl } from "@/lib/site";
import type { Product } from "@/lib/types";

type Props = PageProps<"/produto/[slug]">;

function imageUrl(product: Product): string {
  const value = product.image_url ?? "/products/gear.svg";
  return value.startsWith("http") ? value : absoluteUrl(value);
}

function priceCents(product: Product): number {
  const prices = product.product_variants?.map((variant) => variant.price_cents) ?? [];
  return prices.length ? Math.min(...prices) : product.price_cents;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado", robots: { index: false } };

  const title = product.name;
  const description = product.description ?? `Compre ${product.name} na ${SITE_NAME}.`;
  const image = imageUrl(product);
  const canonical = absoluteUrl(`/produto/${product.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: image, alt: product.name }],
      siteName: SITE_NAME,
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

async function ProductDetails({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: [imageUrl(product)],
    sku: product.product_variants?.[0]?.sku ?? undefined,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/produto/${product.slug}`),
      priceCurrency: "BRL",
      price: (priceCents(product) / 100).toFixed(2),
      availability:
        product.stock_status === "out_of_stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  const showPartnerLink = isPublicPartnerUrl(product.source_url);

  return (
    <div className="mt-6 grid gap-10 lg:grid-cols-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />
      <div className="relative flex min-h-[420px] items-end overflow-hidden bg-line/40 p-6">
        <Image
          src={product.image_url ?? "/products/gear.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6"
          unoptimized
        />
        {product.stock_status === "low" ? (
          <span className="relative z-10 bg-ink px-3 py-1.5 text-xs font-bold text-white">
            Últimas unidades
          </span>
        ) : null}
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
          <p className="text-3xl font-semibold">{formatPrice(priceCents(product))}</p>
          {product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents ? (
            <p className="text-sm text-muted line-through">
              {formatPrice(product.compare_at_price_cents)}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted">
            {product.product_variants?.length
              ? "Preço da menor opção. Escolha a variante abaixo."
              : "Frete calculado na finalização do pedido."}
          </p>
        </div>

        <AddToCartButton product={product} variants={product.product_variants} />

        {Object.entries(product.specs ?? {}).length ? (
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider">Especificações</h2>
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

        <p className="text-xs leading-relaxed text-muted">
          Você paga neste site com Pix ou cartão. Após a confirmação, compramos o item
          no fornecedor com recurso próprio e enviamos direto para você — seus dados
          de pagamento nunca são usados em lojas parceiras.
        </p>
        {showPartnerLink ? (
          <a
            href={product.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-muted underline-offset-4 hover:text-accent hover:underline"
          >
            Ver na loja parceira ↗
          </a>
        ) : null}
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
