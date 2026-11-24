import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  return [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/produtos`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((product) => ({
      url: absoluteUrl(`/produto/${product.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
