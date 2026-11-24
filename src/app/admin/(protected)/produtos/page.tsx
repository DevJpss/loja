import Link from "next/link";
import { deleteProduct } from "../../actions";
import { getAdminProducts, getCategories } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const instant = false;

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getCategories(),
  ]);

  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl font-bold uppercase">Produtos</h2>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex min-h-11 items-center bg-accent px-5 font-semibold text-white"
        >
          Novo produto
        </Link>
      </div>

      {products.length ? (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Produtos cadastrados no catálogo.</caption>
            <thead className="bg-panel text-xs uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="p-3">Produto</th>
                <th scope="col" className="p-3">Categoria</th>
                <th scope="col" className="p-3">Preço</th>
                <th scope="col" className="p-3">Status</th>
                <th scope="col" className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="p-3">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-muted">/{product.slug}</p>
                  </td>
                  <td className="p-3">
                    {product.category_id ? categoryNames.get(product.category_id) ?? "—" : "—"}
                  </td>
                  <td className="p-3">{formatPrice(product.price_cents)}</td>
                  <td className="p-3">
                    <span className={product.active ? "text-accent" : "text-muted"}>
                      {product.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/produtos/${product.id}`} className="font-semibold text-accent">
                        Editar
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button type="submit" className="font-semibold text-red-700">
                          Excluir
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="border border-line bg-panel p-6 text-sm text-muted">
          Nenhum produto cadastrado no Supabase ainda.
        </p>
      )}
    </section>
  );
}
