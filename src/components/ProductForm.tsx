"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionState, Category, Product } from "@/lib/types";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  categories: Category[];
  product?: Product | null;
};

const field = "w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent";
const label = "flex flex-col gap-1.5 text-sm font-medium";

export default function ProductForm({ action, categories, product }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    ok: false,
    message: "",
  });

  return (
    <form action={formAction} className="grid max-w-3xl gap-5">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <label className={label}>
        Nome
        <input name="name" defaultValue={product?.name} required className={field} />
      </label>

      <label className={label}>
        Slug
        <input
          name="slug"
          defaultValue={product?.slug}
          required
          pattern="[a-z0-9-]+"
          className={field}
        />
        <span className="text-xs font-normal text-muted">Somente letras minúsculas, números e hífen.</span>
      </label>

      <label className={label}>
        Descrição
        <textarea name="description" rows={4} defaultValue={product?.description ?? ""} className={field} />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={label}>
          Categoria
          <select name="category_id" defaultValue={product?.category_id ?? ""} className={field}>
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>

        <label className={label}>
          Estoque
          <select name="stock_status" defaultValue={product?.stock_status ?? "available"} className={field}>
            <option value="available">Disponível</option>
            <option value="low">Poucas unidades</option>
            <option value="out_of_stock">Esgotado</option>
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={label}>
          Preço (R$)
          <input
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={product ? (product.price_cents / 100).toFixed(2) : ""}
            className={field}
          />
        </label>

        <label className={label}>
          Preço anterior (R$) — opcional
          <input
            name="compare_at_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.compare_at_price_cents ? (product.compare_at_price_cents / 100).toFixed(2) : ""}
            className={field}
          />
        </label>
      </div>

      <label className={label}>
        URL da imagem
        <input
          name="image_url"
          type="url"
          required
          defaultValue={product?.image_url ?? "/products/gear.svg"}
          className={field}
        />
      </label>

      <label className={label}>
        Link na loja parceira
        <input name="source_url" type="url" required defaultValue={product?.source_url ?? "https://"} className={field} />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input name="active" type="checkbox" defaultChecked={product?.active ?? true} />
        Produto ativo no catálogo
      </label>

      {state.message ? (
        <p className={`border p-3 text-sm ${state.ok ? "border-accent" : "border-red-500 text-red-700"}`}>
          {state.message}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center bg-accent px-6 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <Link href="/admin/produtos" className="inline-flex min-h-11 items-center border border-ink px-6 font-semibold">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
