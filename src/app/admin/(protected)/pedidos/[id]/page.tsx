import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { z } from "zod";
import OrderActions from "@/components/OrderActions";
import CopySupplierLink from "@/components/CopySupplierLink";
import { formatPrice } from "@/lib/format";
import {
  buildCustomerNotification,
  estimateGatewayFeeCents,
  getWhatsappNumber,
  marginCents,
  settingsToNumberMap,
  type PaymentMethod,
} from "@/lib/orders";
import { isPublicPartnerUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";

export const instant = false;

type Props = { params: Promise<{ id: string }> };
type PaymentPayload = { method?: PaymentMethod };
type Address = Record<string, string>;

const statusLabels: Record<string, string> = {
  pending_payment: "Aguardando pagamento",
  paid: "Pago",
  purchasing: "Comprando",
  purchased: "Comprado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export default async function AdminOrderDetailPage({ params }: Props) {
  await connection();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const admin = createAdminClient();
  const [{ data: order }, { data: settingsData }] = await Promise.all([
    admin
      .from("orders")
      .select(
        "id,code,status,subtotal_cents,shipping_cents,discount_cents,total_cents,cost_cents,supplier_order_id,tracking_code,notes,paid_at,shipped_at,created_at,payment_provider,customers(full_name,email,phone,address),order_items(id,name_snapshot,source_url_snapshot,price_cents,qty),payments(provider,status,payload,provider_payment_id)",
      )
      .eq("id", id)
      .maybeSingle(),
    admin.from("settings").select("key,value"),
  ]);
  if (!order) notFound();

  const settingRows = settingsData ?? [];
  const settings = settingsToNumberMap(settingRows);
  const payment = Array.isArray(order.payments) ? order.payments[0] : null;
  const payload = (payment?.payload ?? {}) as PaymentPayload;
  const feeCents = estimateGatewayFeeCents(
    order.total_cents,
    payload.method ?? null,
    settings,
  );
  const margin = marginCents(
    order.total_cents,
    order.cost_cents,
    order.shipping_cents,
    feeCents,
  );

  const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
  const address = (customer?.address ?? {}) as Address;
  const notification = buildCustomerNotification({
    code: order.code,
    status: order.status,
    trackingCode: order.tracking_code,
    customerName: customer?.full_name ?? null,
    email: customer?.email ?? "",
    phone: customer?.phone ?? null,
    whatsappNumber: getWhatsappNumber(settingRows),
  });

  const supplierLinks = (order.order_items ?? [])
    .map((item) => item.source_url_snapshot)
    .filter((url): url is string => isPublicPartnerUrl(url));

  const info = "text-sm text-muted";
  const strong = "font-semibold text-ink";
  const panel = "border border-line bg-white p-5";

  return (
    <section className="pb-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
        <div>
          <p className={info}>
            <Link href="/admin/pedidos" className="text-accent hover:underline">
              ← Pedidos
            </Link>
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase">{order.code}</h2>
          <p className={info}>
            Criado em {new Date(order.created_at).toLocaleString("pt-BR")} ·{" "}
            <Link href={`/pedido/${order.code}`} className="text-accent hover:underline">
              ver página do cliente ↗
            </Link>
          </p>
        </div>
        <span className="border border-accent px-4 py-2 text-sm font-semibold text-accent">
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={panel}>
          <h3 className="mb-3 font-display text-lg font-bold uppercase">Cliente</h3>
          <p className="text-sm font-semibold">{customer?.full_name}</p>
          <p className={`mt-1 ${info}`}>{customer?.email}</p>
          <p className={info}>{customer?.phone}</p>
          <div className={`mt-4 border-t border-line pt-3 ${info}`}>
            <p className={strong}>Entrega</p>
            <p className="mt-1">
              {address.street}, {address.number}
              {address.complement ? ` — ${address.complement}` : ""}
            </p>
            <p>
              {address.neighborhood} — {address.city}/{address.state}
            </p>
            <p>CEP {address.cep}</p>
          </div>
        </div>

        <div className={panel}>
          <h3 className="mb-3 font-display text-lg font-bold uppercase">Pagamento</h3>
          <div className={`flex justify-between ${info}`}>
            <span>Forma</span>
            <span className={strong}>{payload.method === "card" ? "Cartão" : "Pix"}</span>
          </div>
          <div className={`flex justify-between ${info}`}>
            <span>Provider</span>
            <span className={strong}>{payment?.provider ?? order.payment_provider ?? "—"}</span>
          </div>
          <div className={`flex justify-between ${info}`}>
            <span>ID do pagamento</span>
            <span className="break-all text-right">{payment?.provider_payment_id ?? "—"}</span>
          </div>
          <div className={`flex justify-between ${info}`}>
            <span>Status</span>
            <span className={strong}>{payment?.status ?? "—"}</span>
          </div>
          <div className={`mt-4 border-t border-line pt-3 ${info}`}>
            <p>
              Pago em {order.paid_at ? new Date(order.paid_at).toLocaleString("pt-BR") : "—"}
            </p>
            <p>
              Enviado em{" "}
              {order.shipped_at ? new Date(order.shipped_at).toLocaleString("pt-BR") : "—"}
            </p>
          </div>
        </div>

        <div className={panel}>
          <h3 className="mb-3 font-display text-lg font-bold uppercase">Margem</h3>
          <div className={`flex justify-between ${info}`}>
            <span>Total recebido</span>
            <span className={strong}>{formatPrice(order.total_cents)}</span>
          </div>
          <div className={`flex justify-between ${info}`}>
            <span>Frete</span>
            <span>- {formatPrice(order.shipping_cents)}</span>
          </div>
          <div className={`flex justify-between ${info}`}>
            <span>Taxa estimada</span>
            <span>- {formatPrice(feeCents)}</span>
          </div>
          <div className={`flex justify-between ${info}`}>
            <span>Custo do fornecedor</span>
            <span>{order.cost_cents == null ? "—" : `- ${formatPrice(order.cost_cents)}`}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3 text-base font-semibold">
            <span>Margem</span>
            <span className={margin != null && margin < 0 ? "text-red-600" : "text-accent"}>
              {margin == null ? "Aguardando custo" : formatPrice(margin)}
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">
            Taxa estimada por configuração (bps + valor fixo). Confira o valor real no painel do gateway.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className={panel}>
          <h3 className="mb-3 font-display text-lg font-bold uppercase">Itens</h3>
          <div className="divide-y divide-line">
            {(order.order_items ?? []).map((item) => (
              <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-semibold">{item.qty}× {item.name_snapshot}</p>
                  {item.source_url_snapshot ? (
                    <span className="text-xs text-muted">Link do fornecedor disponível abaixo</span>
                  ) : null}
                </div>
                <span className="font-semibold">{formatPrice(item.price_cents * item.qty)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={panel}>
          <h3 className="mb-3 font-display text-lg font-bold uppercase">Compra e envio</h3>
          <div className={`space-y-2 ${info}`}>
            <p><span className={strong}>Pedido no fornecedor:</span> {order.supplier_order_id ?? "—"}</p>
            <p><span className={strong}>Rastreio:</span> {order.tracking_code ?? "—"}</p>
            {order.tracking_code ? (
              <a
                href="https://www.correios.com.br/acompanhe"
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm font-semibold text-accent hover:underline"
              >
                Rastrear nos Correios ↗
              </a>
            ) : null}
            <p className="whitespace-pre-wrap"><span className={strong}>Notas:</span> {order.notes ?? "—"}</p>
          </div>
        </div>
      </div>

      {supplierLinks.length ? (
        <div className={`${panel} mt-6 border-accent`}>
          <h3 className="mb-1 font-display text-lg font-bold uppercase">Fila de compra — uso interno</h3>
          <p className={`mb-3 ${info}`}>
            Compre no fornecedor com <strong className={strong}>recurso próprio</strong> e envie
            direto ao cliente. Nunca use CPF ou cartão do cliente neste site.
          </p>
          <div className="divide-y divide-line">
            {supplierLinks.map((url) => (
              <div key={url} className="py-2">
                <p className="break-all text-xs text-muted">{url}</p>
                <CopySupplierLink url={url} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <h3 className="mb-3 font-display text-2xl font-bold uppercase">Ações do pedido</h3>
        <OrderActions orderId={order.id} status={order.status} />
      </div>

      <div className="mt-6 border border-line bg-panel p-5">
        <h3 className="mb-3 font-display text-2xl font-bold uppercase">Notificar cliente</h3>
        <p className={`mb-3 ${info}`}>
          Os links abrem seu e-mail ou WhatsApp com a mensagem pronta — nenhum serviço pago é necessário.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={notification.mailto}
            className="inline-flex min-h-11 items-center border border-ink px-4 text-sm font-semibold hover:bg-ink hover:text-white"
          >
            Abrir e-mail ↗
          </a>
          <a
            href={notification.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center border border-ink px-4 text-sm font-semibold hover:bg-ink hover:text-white"
          >
            Abrir WhatsApp ↗
          </a>
        </div>
        <pre className="mt-4 whitespace-pre-wrap border border-line bg-white p-3 text-xs text-muted">
          {notification.body}
        </pre>
      </div>
    </section>
  );
}
