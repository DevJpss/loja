import { formatPrice } from "@/lib/format";
import { getAdminProducts } from "@/lib/catalog";
import { readSupplierMonitor } from "@/lib/supplier-monitor";
import { sellingPriceForCost } from "@/lib/supplier-pricing";
import { updateSupplierMonitorEntry } from "../../actions";

export const instant = false;

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

type Props = {
  searchParams: Promise<{ check?: string }>;
};

export default async function AdminSupplierPage({ searchParams }: Props) {
  const [query, monitor, products] = await Promise.all([
    searchParams,
    readSupplierMonitor(),
    getAdminProducts(),
  ]);
  const names = new Map(products.map((product) => [product.slug, product.name]));
  const entries = Object.entries(monitor.products);

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-display text-3xl font-bold uppercase">Fornecedor</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Abra o anúncio uma vez por dia, informe o custo e a disponibilidade abaixo. O site
          recalcula o preço e trava a venda automaticamente.
        </p>
      </div>

      {query.check ? (
        <p
          className={`mb-6 border p-3 text-sm ${
            query.check === "ok" ? "border-accent" : "border-red-500 text-red-700"
          }`}
        >
          {query.check === "ok"
            ? "Checagem registrada. Preço e disponibilidade já foram aplicados."
            : "Não foi possível registrar a checagem. Confira os dados e tente novamente."}
        </p>
      ) : null}

      {entries.length ? (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <caption className="sr-only">Produtos monitorados no fornecedor.</caption>
            <thead className="bg-panel text-xs uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="p-3">Produto</th>
                <th scope="col" className="p-3">Custo</th>
                <th scope="col" className="p-3">Preço no site</th>
                <th scope="col" className="p-3">Disponibilidade</th>
                <th scope="col" className="p-3">Última checagem</th>
                <th scope="col" className="p-3">Histórico</th>
                <th scope="col" className="p-3">Registrar hoje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entries.map(([slug, entry]) => {
                const product = products.find((item) => item.slug === slug);
                const sitePrice =
                  product && entry.price_auto_adjust && entry.supplier_price_cents != null
                    ? sellingPriceForCost(entry.supplier_price_cents)
                    : product?.price_cents;

                return (
                  <tr key={slug}>
                    <td className="p-3">
                      <p className="font-semibold">{names.get(slug) ?? slug}</p>
                      <p className="text-xs text-muted">/{slug}</p>
                    </td>
                    <td className="p-3">
                      {entry.supplier_price_cents == null
                        ? "—"
                        : formatPrice(entry.supplier_price_cents)}
                    </td>
                    <td className="p-3">{sitePrice == null ? "—" : formatPrice(sitePrice)}</td>
                    <td className="p-3">
                      {entry.supplier_available === false ? (
                        <span className="font-semibold text-red-700">Indisponível</span>
                      ) : entry.supplier_available === true ? (
                        <span className="font-semibold text-accent">Disponível</span>
                      ) : (
                        <span className="text-muted">Sem checagem</span>
                      )}
                      {entry.last_error ? (
                        <p className="mt-1 text-xs text-red-700">{entry.last_error}</p>
                      ) : null}
                    </td>
                    <td className="p-3">{formatDate(entry.supplier_checked_at)}</td>
                    <td className="p-3">
                      {entry.history.length ? (
                        <details>
                          <summary className="cursor-pointer font-semibold text-accent">
                            {entry.history.length} registro(s)
                          </summary>
                          <ul className="mt-2 space-y-1 text-xs text-muted">
                            {entry.history.slice().reverse().map((record, index) => (
                              <li key={`${record.checked_at}-${index}`}>
                                {formatDate(record.checked_at)} — {record.source ?? "cron"} ·{" "}
                                {record.status === "ok" ? "ok" : "erro"}
                                {record.supplier_price_cents != null
                                  ? ` · ${formatPrice(record.supplier_price_cents)}`
                                  : ""}
                                {record.message ? ` · ${record.message}` : ""}
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <form action={updateSupplierMonitorEntry} className="grid gap-2">
                        <input type="hidden" name="slug" value={slug} />
                        <label className="sr-only" htmlFor={`custo-${slug}`}>
                          Custo no fornecedor em reais
                        </label>
                        <input
                          id={`custo-${slug}`}
                          name="supplier_price"
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          defaultValue={
                            entry.supplier_price_cents == null
                              ? ""
                              : (entry.supplier_price_cents / 100).toFixed(2)
                          }
                          className="w-28 border border-line bg-white px-2 py-1.5 text-sm outline-none focus:border-accent"
                        />
                        <label className="sr-only" htmlFor={`disp-${slug}`}>
                          Disponibilidade no fornecedor
                        </label>
                        <select
                          id={`disp-${slug}`}
                          name="availability"
                          defaultValue={entry.supplier_available === false ? "unavailable" : "available"}
                          className="w-36 border border-line bg-white px-2 py-1.5 text-sm outline-none focus:border-accent"
                        >
                          <option value="available">Disponível</option>
                          <option value="unavailable">Indisponível</option>
                        </select>
                        <button
                          type="submit"
                          className="inline-flex min-h-9 items-center justify-center bg-ink px-3 text-xs font-semibold text-white"
                        >
                          Salvar checagem
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="border border-line bg-panel p-6 text-sm text-muted">
          Nenhum produto monitorado. Rode o seed para cadastrar a polia baixa.
        </p>
      )}

      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted">
        Regra aplicada: custo + R$ 23,58, arredondado para cima até terminar em ,90. Se você
        marcar <strong className="text-ink">Indisponível</strong>, o produto fica esgotado no
        site e o checkout bloqueia a compra. Ao marcar <strong className="text-ink">Disponível</strong>{" "}
        novamente, o status anterior é restaurado. Quando existir uma fonte autorizada, o job
        diário pode assumir esta rotina sem alterar as regras.
      </p>
    </section>
  );
}
