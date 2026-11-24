"use client";

import { useActionState } from "react";
import { submitReview } from "@/app/pedido/[code]/actions";
import type { ActionState } from "@/lib/types";

const field =
  "w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent";

export default function ReviewForm({
  code,
  orderItemId,
  productName,
  defaultName,
}: {
  code: string;
  orderItemId: string;
  productName: string;
  defaultName: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submitReview,
    { ok: false, message: "" },
  );

  if (state.ok) {
    return (
      <div className="border border-accent bg-white p-4 text-sm">
        <p className="font-semibold text-accent">✓ {state.message}</p>
        <p className="mt-1 text-muted">Obrigado por avaliar {productName}.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 border border-line bg-white p-4">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="order_item_id" value={orderItemId} />
      <p className="font-semibold">{productName}</p>

      <fieldset className="flex flex-wrap items-center gap-1">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
          Sua nota
        </legend>
        {[1, 2, 3, 4, 5].map((rating) => (
          <label key={rating} className="cursor-pointer px-1 text-2xl leading-none text-accent">
            <input
              type="radio"
              name="rating"
              value={rating}
              required
              className="peer sr-only"
              aria-label={`${rating} estrela${rating > 1 ? "s" : ""}`}
            />
            <span
              aria-hidden="true"
              className="inline-block opacity-50 peer-checked:scale-110 peer-checked:opacity-100"
            >
              ★
            </span>
          </label>
        ))}
      </fieldset>

      <label className="flex flex-col gap-1.5 text-xs font-medium">
        Nome que aparecerá na avaliação
        <input
          name="author_name"
          defaultValue={defaultName}
          maxLength={80}
          required
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-medium">
        Sua avaliação
        <textarea
          name="body"
          rows={3}
          minLength={10}
          maxLength={1000}
          required
          placeholder="Conte como o produto performou no seu treino."
          className={`${field} resize-y`}
        />
      </label>

      {state.message ? (
        <p role="alert" className="text-xs font-semibold text-accent">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center bg-ink px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Enviando..." : "Enviar avaliação"}
      </button>
      <p className="text-[11px] text-muted">
        Só aparece na loja depois que a gente aprovar.
      </p>
    </form>
  );
}
