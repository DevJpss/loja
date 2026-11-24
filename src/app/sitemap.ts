import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";

const base = "https://evidencereps.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/produtos`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((product) => ({
      url: `${base}/produto/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
