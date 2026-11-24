import type { Product } from "./types";

/** Fotos locais adicionais, quando o produto tem mais de uma imagem de referência. */
const galleries: Record<string, string[]> = {
  "polia-baixa-tornozeleira-cross-over": [
    "/products/polia-baixa-tornozeleira-1.jpg",
    "/products/polia-baixa-tornozeleira-2.jpg",
    "/products/polia-baixa-tornozeleira-3.jpg",
    "/products/polia-baixa-tornozeleira-4.jpg",
    "/products/polia-baixa-tornozeleira-5.jpg",
  ],
};

export function getProductGallery(product: Product): string[] {
  return galleries[product.slug] ?? [product.image_url ?? "/products/gear.svg"];
}
