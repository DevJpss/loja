import Link from "next/link";
import { formatPrice } from "@/lib/format";
import {
  estimateGatewayFeeCents,
  marginCents,
  settingsToNumberMap,
  type PaymentMethod,
} from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";

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

export default async function AdminOrdersPage() {
  const admin = createAdminClient();
  const [{ data: orders }, { data: settingsData }] = await Promise.all([
    admin
      .from("orders")
      .select(
        "id,code,status,total_cents,shipping_cents,cost_cents,created_at,customers(full_name,email),payments(payload)",
      )
      .order("created_at", { ascending: false }),
    admin.from("settings").select("key,value"),
  ]);
  const settings = settingsToNumberMap(settingsData ?? []);

  return (
    <section>
      <h2 className="mb-6 font-display text-3xl font-bold uppercase">Pedidos</h2>
      {orders?.length ? (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-panel text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-3">Pedido</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total</th>
                <th className="p-3">Custo</th>
                <th className="p-3">Margem</th>
                <th className="p-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => {
                const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
                const payment = Array.isArray(order.payments) ? order.payments[0] : null;
                const payload = (payment?.payload ?? {}) as { method?: PaymentMethod };
                const feeCents = estimateGatewayFeeCents(order.total_cents, payload.method ?? null, settings);
                const margin = marginCents(
                  order.total_cents,
                  order.cost_cents,
                  order.shipping_cents,
                  feeCents,
                );
                return (
                  <tr key={order.id}>
                    <td className="p-3 font-semibold">
                      <Link href={`/admin/pedidos/${order.id}`} className="text-accent hover:underline">
                        {order.code}
                      </Link>
                      <span className="block text-xs font-normal text-muted">Abrir fila →</span>
                    </td>
                    <td className="p-3">
                      {customer?.full_name}
                      <span className="block text-xs text-muted">{customer?.email}</span>
                    </td>
                    <td className="p-3">{statusLabels[order.status] ?? order.status}</td>
                    <td className="p-3">{formatPrice(order.total_cents)}</td>
                    <td className="p-3">
                      {order.cost_cents == null ? "—" : formatPrice(order.cost_cents)}
                    </td>
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
      ) : (
        <p className="border border-line bg-panel p-6 text-sm text-muted">
          Nenhum pedido criado ainda.
        </p>
      )}
    </section>
  );
}
