import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";

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
  const { data: orders } = await createAdminClient()
    .from("orders")
    .select("id,code,status,total_cents,created_at,customers(full_name,email)")
    .order("created_at", { ascending: false });

  return (
    <section>
      <h2 className="mb-6 font-display text-3xl font-bold uppercase">Pedidos</h2>
      {orders?.length ? (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-panel text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-3">Pedido</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total</th>
                <th className="p-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => {
                const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
                return (
                  <tr key={order.id}>
                    <td className="p-3 font-semibold">
                      <Link href={`/pedido/${order.code}`} className="text-accent hover:underline">
                        {order.code}
                      </Link>
                    </td>
                    <td className="p-3">
                      {customer?.full_name}
                      <span className="block text-xs text-muted">{customer?.email}</span>
                    </td>
                    <td className="p-3">{statusLabels[order.status] ?? order.status}</td>
                    <td className="p-3">{formatPrice(order.total_cents)}</td>
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
