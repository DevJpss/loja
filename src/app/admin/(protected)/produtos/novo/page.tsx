import ProductForm from "@/components/ProductForm";
import { getCategories } from "@/lib/catalog";
import { createProduct } from "../../../actions";

export const instant = false;

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <section>
      <h2 className="mb-6 font-display text-3xl font-bold uppercase">Novo produto</h2>
      <ProductForm action={createProduct} categories={categories} />
    </section>
  );
}
