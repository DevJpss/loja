import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { jsonLdHtml } from "@/lib/jsonld";
import AddToCartButton from "@/components/AddToCartButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGallery from "@/components/ProductGallery";
import ScrollReveal from "@/components/ScrollReveal";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { reviewStars } from "@/lib/review-helpers";
import { publicProduct } from "@/lib/public-product";
import { getProductGallery } from "@/lib/product-gallery";
import { getApprovedReviews } from "@/lib/reviews";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

type Props = PageProps<"/produto/[slug]">;

function absoluteImage(value: string): string {
  return value.startsWith("http") ? value : absoluteUrl(value);
}

function priceCents(product: Awaited<ReturnType<typeof getProductBySlug>>): number {
  if (!product) return 0;
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
  const image = absoluteImage(product.image_url ?? "/products/gear.svg");
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

  const gallery = getProductGallery(product);
  const reviews = await getApprovedReviews(product.id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: gallery.map(absoluteImage),
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
    ...(reviews.stats.count > 0 && reviews.stats.average !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviews.stats.average.toFixed(1),
            reviewCount: reviews.stats.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  const crumbs = [
    { label: "Início", href: "/" },
    { label: "Produtos", href: "/produtos" },
    ...(product.categories?.slug
      ? [
          {
            label: product.categories.name,
            href: `/produtos?categoria=${encodeURIComponent(product.categories.slug)}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <ScrollReveal>
        <div className="grid gap-10 lg:grid-cols-2">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
          />
          <div>
            {product.stock_status === "low" ? (
              <span className="mb-3 inline-block bg-ink px-3 py-1.5 text-xs font-bold text-white">
                Últimas unidades
              </span>
            ) : null}
            <ProductGallery images={gallery} name={product.name} />
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

            <AddToCartButton product={publicProduct(product)} variants={product.product_variants} />

            {product.specs?.Compatibilidade ? (
              <div className="border border-line bg-panel p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Compatibilidade
                </h2>
                <p className="mt-2 text-sm leading-relaxed">{product.specs.Compatibilidade}</p>
                <p className="mt-2 text-xs text-muted">
                  Confira as medidas da ficha técnica antes de comprar.
                </p>
              </div>
            ) : null}

            {Object.entries(product.specs ?? {}).length ? (
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider">Ficha técnica</h2>
                <dl className="divide-y divide-line border-y border-line text-sm">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-4">
                      <dt className="text-muted">{key}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <p className="border-l-2 border-accent bg-panel p-4 text-xs leading-relaxed text-muted">
              <strong className="text-ink">Compra sem intermediários opacos.</strong> Você paga neste
              site com Pix ou cartão. Compramos o item no fornecedor com recurso próprio e enviamos
              direto para você — seus dados de pagamento nunca são usados em lojas parceiras.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {reviews.stats.count ? (
        <ScrollReveal>
          <section className="mt-14 border-t border-line pt-10">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Avaliações verificadas
            </span>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase sm:text-5xl">
              Quem já treinou com este item
            </h2>
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-semibold">
                {reviews.stats.average?.toFixed(1).replace(".", ",")}
              </span>
              <span aria-hidden="true" className="text-xl text-accent">
                {reviewStars(Math.round(reviews.stats.average ?? 0))}
              </span>
              <span className="text-sm text-muted">
                {reviews.stats.count} avalia{reviews.stats.count === 1 ? "ção" : "ções"} aprovada
                {reviews.stats.count === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {reviews.reviews.map((review) => (
                <article key={review.id} className="border border-line bg-white p-5">
                  <p aria-label={`${review.rating} de 5 estrelas`} className="text-lg text-accent">
                    {reviewStars(review.rating)}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed">{review.body}</p>
                  <p className="mt-4 text-xs text-muted">
                    <strong className="text-ink">{review.author}</strong> · Compra verificada
                  </p>
                </article>
              ))}
            </div>
          </section>
        </ScrollReveal>
      ) : null}
    </>
  );
}

const steps = [
  {
    title: "1. Você escolhe e paga aqui",
    text: "Pix ou cartão no checkout. Seus dados bancários ficam somente no gateway.",
  },
  {
    title: "2. Compramos no fornecedor",
    text: "Usamos recurso próprio para adquirir o item exatamente como descrito na ficha técnica.",
  },
  {
    title: "3. Enviamos direto para você",
    text: "Você acompanha o status pelo código do pedido e recebe o rastreio quando disponível.",
  },
];

export default function ProductPage(props: Props) {
  return (
    <main className="px-4 py-12 sm:px-8 lg:px-16">
      <Suspense
        fallback={
          <p className="mt-8 border border-line bg-panel p-8 text-center text-muted">
            Carregando produto...
          </p>
        }
      >
        <ProductDetails {...props} />
      </Suspense>

      <ScrollReveal>
        <section className="mt-14 border-t border-line pt-10">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Como funciona
          </span>
          <h2 className="mt-2 font-display text-4xl font-bold uppercase sm:text-5xl">
            Do clique até a entrega
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="border border-line bg-panel p-5">
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
