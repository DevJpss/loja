import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { settingsToNumberMap, type PaymentMethod } from "@/lib/orders";
import {
  buildOrdersCsv,
  filterOrders,
  firstParam,
  paginate,
  summarizeOrders,
  type ReportOrder,
} from "@/lib/reports";
import { createAdminClient } from "@/lib/supabase/admin";
import ExportCsvButton from "@/components/ExportCsvButton";

export const instant = false;

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

type RawCustomer = { full_name: string | null; email: string | null };
type RawPayment = { payload: unknown };
type RawOrder = {
  id: string;
  code: string;
  status: string;
  total_cents: number;
  shipping_cents: number;
  cost_cents: number | null;
  created_at: string;
  customers: RawCustomer | RawCustomer[] | null;
  payments: RawPayment | RawPayment[] | null;
};

function asArray<T>(value: T | T[] | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toReportOrder(order: RawOrder): ReportOrder {
  const customer = asArray(order.customers)[0];
  const payment = asArray(order.payments)[0];
  const payload = (payment?.payload ?? {}) as { method?: PaymentMethod };
  return {
    id: order.id,
    code: order.code,
    status: order.status,
    total_cents: order.total_cents,
    shipping_cents: order.shipping_cents,
    cost_cents: order.cost_cents,
    created_at: order.created_at,
    customer_name: customer?.full_name ?? null,
    customer_email: customer?.email ?? null,
    payment_method: payload.method ?? null,
  };
}

type Props = PageProps<"/admin/pedidos">;

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = firstParam(params.q);
  const status = firstParam(params.status);
  const from = firstParam(params.from);
  const to = firstParam(params.to);
  const pageParam = firstParam(params.page);

  const admin = createAdminClient();
  const [{ data, error }, { data: settingsData }] = await Promise.all([
    admin
      .from("orders")
      .select(
        "id,code,status,total_cents,shipping_cents,cost_cents,created_at,customers(full_name,email),payments(payload)",
      )
      .order("created_at", { ascending: false }),
    admin.from("settings").select("key,value"),
  ]);

  if (error) {
    return (
      <section>
        <h2 className="mb-6 font-display text-3xl font-bold uppercase">Pedidos</h2>
        <p role="alert" className="border border-red-500 bg-white p-6 text-sm text-red-700">
          Não foi possível carregar os pedidos. Tente novamente.
        </p>
      </section>
    );
  }

  const orders = ((data ?? []) as unknown as RawOrder[]).map(toReportOrder);
  const settings = settingsToNumberMap(settingsData ?? []);
  const filtered = filterOrders(orders, { query, status, from, to });
  const summary = summarizeOrders(filtered, settings);
  const current = paginate(filtered, pageParam);
  const csv = buildOrdersCsv(filtered, settings);

  function hrefForPage(page: number) {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (status) search.set("status", status);
    if (from) search.set("from", from);
    if (to) search.set("to", to);
    search.set("page", String(page));
    return `/admin/pedidos?${search.toString()}`;
  }

  const kpis = [
    { label: "Pedidos", value: String(summary.totalOrders), hint: `${summary.billedOrders} faturados` },
    { label: "Faturamento", value: formatPrice(summary.revenueCents), hint: `Ticket médio ${formatPrice(summary.averageTicketCents)}` },
    { label: "Margem", value: formatPrice(summary.marginCents), hint: summary.marginPercent == null ? "Sem custo informado" : `${summary.marginPercent}% do faturamento` },
    { label: "Taxa estimada", value: formatPrice(summary.feeCents), hint: `${summary.pricedOrders} com custo informado` },
  ];

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-3xl font-bold uppercase">Pedidos</h2>
        <ExportCsvButton csv={csv} filename="pedidos-evidence-reps.csv" />
      </div>

      <form method="get" className="mb-6 grid gap-3 border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Buscar
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Código, cliente ou e-mail"
            className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Status
          <select name="status" defaultValue={status} className="w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent">
            <option value="">Todos</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          De
          <input type="date" name="from" defaultValue={from} className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-accent" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Até
          <input type="date" name="to" defaultValue={to} className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-accent" />
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="min-h-10 flex-1 bg-ink px-4 font-semibold text-white">Filtrar</button>
          <Link href="/admin/pedidos" className="inline-flex min-h-10 items-center px-3 text-sm font-semibold text-accent">
            Limpar
          </Link>
        </div>
      </form>

      <dl className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="border border-line bg-white p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{kpi.label}</dt>
            <dd className="mt-1 font-display text-3xl font-bold">{kpi.value}</dd>
            <p className="mt-1 text-xs text-muted">{kpi.hint}</p>
          </div>
        ))}
      </dl>

      {current.items.length ? (
        <>
          <div className="overflow-x-auto border border-line bg-white">
            <table className="w-full min-w-[820px] text-left text-sm">
              <caption className="sr-only">
                Pedidos filtrados. Use os links da coluna Pedido para abrir a fila de cada um.
              </caption>
              <thead className="bg-panel text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="p-3">Pedido</th>
                  <th scope="col" className="p-3">Cliente</th>
                  <th scope="col" className="p-3">Status</th>
                  <th scope="col" className="p-3">Total</th>
                  <th scope="col" className="p-3">Custo</th>
                  <th scope="col" className="p-3">Margem</th>
                  <th scope="col" className="p-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {current.items.map((order) => {
                  const margin = summarizeOrders([order], settings).marginCents;
                  return (
                    <tr key={order.id}>
                      <td className="p-3 font-semibold">
                        <Link href={`/admin/pedidos/${order.id}`} className="text-accent hover:underline">
                          {order.code}
                        </Link>
                        <span className="block text-xs font-normal text-muted">Abrir fila →</span>
                      </td>
                      <td className="p-3">
                        {order.customer_name ?? "—"}
                        <span className="block text-xs text-muted">{order.customer_email ?? "—"}</span>
                      </td>
                      <td className="p-3">{statusLabels[order.status] ?? order.status}</td>
                      <td className="p-3">{formatPrice(order.total_cents)}</td>
                      <td className="p-3">{order.cost_cents == null ? "—" : formatPrice(order.cost_cents)}</td>
                      <td className="p-3">
                        {margin == null ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <span className={margin < 0 ? "text-red-600" : "text-accent"}>
                            {formatPrice(margin)}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-muted">
                        {new Date(order.created_at).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <nav aria-label="Paginação de pedidos" className="mt-4 flex items-center justify-between gap-3 text-sm">
            {current.page > 1 ? (
              <Link href={hrefForPage(current.page - 1)} className="font-semibold text-accent">← Anterior</Link>
            ) : (
              <span className="text-muted">← Anterior</span>
            )}
            <span className="text-muted">
              Página {current.page} de {current.totalPages} · {current.total} pedidos
            </span>
            {current.page < current.totalPages ? (
              <Link href={hrefForPage(current.page + 1)} className="font-semibold text-accent">Próxima →</Link>
            ) : (
              <span className="text-muted">Próxima →</span>
            )}
          </nav>
        </>
      ) : (
        <p className="border border-line bg-panel p-6 text-sm text-muted">
          Nenhum pedido encontrado com esses filtros.
        </p>
      )}
    </section>
  );
}
