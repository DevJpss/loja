import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ClearCart from "@/components/ClearCart";
import ReviewForm from "@/components/ReviewForm";
import { formatPrice } from "@/lib/format";
import { maskCityState, maskEmail, maskFullName, maskPhone } from "@/lib/privacy";
import { reviewStatusLabel } from "@/lib/review-helpers";
import { getOrderReviewStatuses } from "@/lib/reviews";
import { createAdminClient } from "@/lib/supabase/admin";
import { simulatePayment } from "./actions";

export const instant = false;

export const metadata: Metadata = {
  title: "Pedido",
  description: "Acompanhe o status do seu pedido Evidence Reps.",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ code: string }> };

type PaymentPayload = {
  method?: "pix" | "card";
  mode?: "demo" | "live";
  qr_code?: string;
  qr_code_base64?: string;
  init_point?: string;
};

const statusLabels: Record<string, string> = {
  pending_payment: "Aguardando pagamento",
  paid: "Pagamento confirmado",
  purchasing: "Comprando com o fornecedor",
  purchased: "Comprado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

async function OrderDetails({ params }: Props) {
  await connection();
  const { code } = await params;
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select(
      "id,code,status,subtotal_cents,shipping_cents,total_cents,created_at,paid_at,payment_provider,tracking_code,customers(full_name,email,phone,address),order_items(id,product_id,name_snapshot,image_snapshot,price_cents,qty),payments(id,provider,status,payload)",
    )
    .eq("code", code)
    .maybeSingle();

  if (!order) notFound();

  const payment = Array.isArray(order.payments) ? order.payments[0] : null;
  const payload = (payment?.payload ?? {}) as PaymentPayload;
  const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
  const address = (customer?.address ?? {}) as Record<string, string>;
  const paid = order.status !== "pending_payment";
  const demo = order.payment_provider === "demo";

  const reviewableItems = (order.order_items ?? []).filter((item) => item.product_id);
  const reviewStatuses =
    order.status === "delivered"
      ? await getOrderReviewStatuses(
          order.id,
          reviewableItems.map((item) => item.product_id!).filter(Boolean),
        )
      : {};

  return (
    <>
      <ClearCart />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Pedido</p>
          <p className="font-display text-3xl font-bold uppercase">{order.code}</p>
        </div>
        <span className={`border px-4 py-2 text-sm font-semibold ${paid ? "border-accent text-accent" : "border-line bg-panel text-muted"}`}>
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>

      {order.status === "shipped" || order.status === "delivered" ? (
        <div className="mb-8 border border-accent bg-white p-6">
          <h2 className="font-display text-2xl font-bold uppercase">
            {order.status === "delivered" ? "Pedido entregue ✓" : "Seu pedido foi enviado ✓"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {order.status === "delivered"
              ? "Esperamos que você goste! Em caso de dúvidas, fale com a gente pelos canais de atendimento do site."
              : "Seu pedido está a caminho. Acompanhe pelo código abaixo."}
          </p>
          {order.tracking_code ? (
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Código de rastreio
              </p>
              <p className="mt-1 break-all font-mono text-lg font-semibold">
                {order.tracking_code}
              </p>
              <a
                href="https://www.correios.com.br/acompanhe"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-accent hover:underline"
              >
                Rastrear nos Correios ↗
              </a>
            </div>
          ) : null}
        </div>
      ) : paid ? (
        <div className="mb-8 border border-accent bg-white p-6">
          <h2 className="font-display text-2xl font-bold uppercase">Pagamento confirmado ✓</h2>
          <p className="mt-2 text-sm text-muted">
            Recebemos seu pedido. Volte a esta página para acompanhar as próximas atualizações.
          </p>
        </div>
      ) : (
        <div className="mb-8 grid gap-6 border border-line bg-white p-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase">Como pagar</h2>
            {payload.method === "pix" && payload.qr_code_base64 ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${payload.qr_code_base64}`}
                  alt="QR Code Pix"
                  className="mt-4 h-48 w-48 object-contain"
                />
                <p className="mt-3 break-all rounded bg-panel p-3 text-xs text-muted">
                  {payload.qr_code}
                </p>
              </>
            ) : null}
            {payload.method === "card" && payload.init_point ? (
              <a
                href={payload.init_point}
                className="mt-4 inline-flex min-h-12 items-center bg-accent px-6 font-semibold text-white"
              >
                Pagar com cartão ↗
              </a>
            ) : null}
            {demo ? (
              <form action={simulatePayment} className="mt-5 border-t border-line pt-5">
                <input type="hidden" name="code" value={order.code} />
                <p className="mb-3 text-xs text-muted">
                  Modo demo: nenhuma cobrança foi feita. Simule a aprovação para testar o fluxo.
                </p>
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center bg-ink px-5 font-semibold text-white"
                >
                  Simular pagamento aprovado
                </button>
              </form>
            ) : null}
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold uppercase tracking-wider text-muted">Resumo</p>
            <div className="flex justify-between border-b border-line py-2">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal_cents)}</span>
            </div>
            <div className="flex justify-between border-b border-line py-2">
              <span>Frete</span>
              <span>{order.shipping_cents ? formatPrice(order.shipping_cents) : "Grátis"}</span>
            </div>
            <div className="mt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total_cents)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-2xl font-bold uppercase">Itens</h2>
          <div className="divide-y divide-line border-y border-line">
            {(order.order_items ?? []).map((item) => (
              <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <span>{item.qty}× {item.name_snapshot}</span>
                <span className="font-semibold">{formatPrice(item.price_cents * item.qty)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="text-sm">
          <h2 className="mb-3 font-display text-2xl font-bold uppercase">Entrega</h2>
          <div className="border border-line bg-white p-4 leading-relaxed">
            <p className="font-semibold">{maskFullName(customer?.full_name)}</p>
            <p>Entrega em {maskCityState(address)}</p>
            <p className="mt-2 text-muted">
              {maskEmail(customer?.email)} · {maskPhone(customer?.phone)}
            </p>
            <p className="mt-3 text-xs text-muted">
              Por segurança, os dados completos de entrega não são exibidos nesta página.
            </p>
          </div>
        </section>
      </div>

      {order.status === "delivered" && reviewableItems.length ? (
        <section className="mt-10 border-t border-line pt-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Avaliações
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase">
            Avalie seus produtos
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Sua avaliação ajuda quem está escolhendo. Ela só aparece na loja depois de aprovada —
            e nunca mostra seu e-mail, telefone ou endereço.
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {reviewableItems.map((item) => {
              const status = reviewStatuses[item.product_id!];
              if (status) {
                return (
                  <div key={item.id} className="border border-line bg-panel p-4 text-sm">
                    <p className="font-semibold">{item.name_snapshot}</p>
                    <p className="mt-2 text-muted">{reviewStatusLabel(status)}</p>
                  </div>
                );
              }
              return (
                <ReviewForm
                  key={item.id}
                  code={order.code}
                  orderItemId={item.id}
                  productName={item.name_snapshot}
                  defaultName={maskFullName(customer?.full_name)}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      <Link href="/produtos" className="mt-8 inline-block text-sm font-semibold text-accent">
        Continuar comprando →
      </Link>
    </>
  );
}

export default function OrderPage(props: Props) {
  return (
    <main className="px-4 py-12 sm:px-8 lg:px-16">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Acompanhamento
      </span>
      <h1 className="mb-8 mt-2 font-display text-6xl font-bold uppercase sm:text-7xl">
        Seu pedido
      </h1>
      <Suspense
        fallback={<p className="border border-line bg-panel p-8 text-center text-muted">Carregando pedido...</p>}
      >
        <OrderDetails {...props} />
      </Suspense>
    </main>
  );
}
