import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { SITE_URL, absoluteUrl } from "@/lib/site";

// Data da última atualização de conteúdo. Evita `new Date()` congelado no build
// e mantém o lastmod estável até a próxima rodada de catálogo/FAQ.
const LAST_UPDATED = "2026-11-24";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  return [
    { url: `${SITE_URL}/`, lastModified: LAST_UPDATED, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE_URL}/produtos`,
      lastModified: LAST_UPDATED,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...products.map((product) => ({
      url: absoluteUrl(`/produto/${product.slug}`),
      lastModified: LAST_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
