import type { Product } from "./types";

/**
 * Remove dados de bastidor antes de enviar o produto para componentes cliente.
 * O link do fornecedor é usado apenas pelo operador no painel admin.
 */
export function publicProduct(product: Product): Product {
  return { ...product, source_url: "" };
}
