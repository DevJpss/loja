import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { getAdminProduct, getCategories } from "@/lib/catalog";
import { updateProduct } from "../../../actions";

export const instant = false;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <section>
      <h2 className="mb-6 font-display text-3xl font-bold uppercase">Editar produto</h2>
      <ProductForm action={updateProduct} categories={categories} product={product} />
    </section>
  );
}
