"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import {
  cancelOrder,
  expireOrder,
  markDelivered,
  markShipped,
  refundOrder,
  registerPurchase,
  startPurchase,
} from "@/app/admin/(protected)/pedidos/actions";
import type { ActionState } from "@/lib/types";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const field =
  "w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent";
const label = "mb-3 flex flex-col gap-1.5 text-sm font-medium";
const button =
  "inline-flex min-h-11 items-center bg-ink px-4 text-sm font-semibold text-white disabled:opacity-50";

function ActionForm({
  action,
  title,
  orderId,
  children,
}: {
  action: Action;
  title: string;
  orderId: string;
  children?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {
    ok: false,
    message: "",
  });

  return (
    <form action={formAction} className="border border-line bg-white p-4">
      <input type="hidden" name="id" value={orderId} readOnly />
      <h3 className="mb-3 font-display text-lg font-bold uppercase">{title}</h3>
      {children}
      <button type="submit" disabled={pending} className={button}>
        {pending ? "Salvando..." : title}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`mt-2 text-xs ${state.ok ? "text-accent" : "text-red-600"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export default function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {status === "pending_payment" ? (
        <ActionForm orderId={orderId} action={expireOrder} title="Expirar pagamento" />
      ) : null}

      {status === "paid" ? (
        <ActionForm orderId={orderId} action={startPurchase} title="Iniciar compra" />
      ) : null}

      {status === "paid" || status === "purchasing" ? (
        <ActionForm orderId={orderId} action={registerPurchase} title="Registrar compra">
          <label className={label}>
            Custo do produto (R$)
            <input name="cost" type="number" step="0.01" min="0" required placeholder="0.00" className={field} />
          </label>
          <label className={label}>
            ID do pedido no fornecedor
            <input name="supplier_order_id" maxLength={120} className={field} />
          </label>
          <label className={label}>
            Observações
            <textarea name="notes" rows={2} maxLength={1000} className={field} />
          </label>
        </ActionForm>
      ) : null}

      {status === "purchased" ? (
        <ActionForm orderId={orderId} action={markShipped} title="Registrar envio">
          <label className={label}>
            Código de rastreio
            <input name="tracking_code" required maxLength={120} className={field} />
          </label>
          <label className={label}>
            Observações
            <textarea name="notes" rows={2} maxLength={1000} className={field} />
          </label>
        </ActionForm>
      ) : null}

      {status === "shipped" ? (
        <ActionForm orderId={orderId} action={markDelivered} title="Marcar entregue" />
      ) : null}

      {["paid", "purchasing", "purchased", "shipped"].includes(status) ? (
        <ActionForm orderId={orderId} action={cancelOrder} title="Cancelar pedido" />
      ) : null}

      {["paid", "purchasing", "purchased", "shipped", "delivered"].includes(status) ? (
        <ActionForm orderId={orderId} action={refundOrder} title="Registrar reembolso" />
      ) : null}
    </div>
  );
}
