import Link from "next/link";
import { connection } from "next/server";
import { reviewStars, reviewStatusLabel } from "@/lib/review-helpers";
import { getAdminReviews } from "@/lib/reviews";
import { moderateReview } from "./actions";

export const instant = false;

type Props = { searchParams: Promise<{ status?: string; saved?: string; erro?: string }> };

const filters = [
  { value: "", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovadas" },
  { value: "rejected", label: "Rejeitadas" },
];

export default async function AdminReviewsPage({ searchParams }: Props) {
  await connection();
  const query = await searchParams;
  const active = query.status ?? "";
  const reviews = await getAdminReviews(active);

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-display text-3xl font-bold uppercase">Avaliações</h2>
        <p className="mt-1 text-sm text-muted">
          Avaliações só aparecem na loja depois de aprovadas aqui.
        </p>
      </div>

      {query.saved ? (
        <p className="mb-4 border border-accent bg-white p-3 text-sm text-accent">
          Avaliação atualizada.
        </p>
      ) : null}
      {query.erro ? (
        <p role="alert" className="mb-4 border border-accent bg-white p-3 text-sm text-accent">
          Não foi possível atualizar. Tente novamente.
        </p>
      ) : null}

      <nav aria-label="Filtrar avaliações" className="mb-6 flex flex-wrap gap-2 text-sm">
        {filters.map((filter) => (
          <Link
            key={filter.value || "all"}
            href={filter.value ? `/admin/avaliacoes?status=${filter.value}` : "/admin/avaliacoes"}
            aria-current={active === filter.value ? "page" : undefined}
            className={
              active === filter.value
                ? "border border-ink bg-ink px-4 py-2 font-semibold text-white"
                : "border border-line px-4 py-2 font-semibold hover:border-ink"
            }
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      {reviews.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {review.product_slug ? (
                      <Link href={`/produto/${review.product_slug}`} className="hover:text-accent">
                        {review.product_name}
                      </Link>
                    ) : (
                      review.product_name
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Pedido {review.order_code} · {new Date(review.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span className="border border-line bg-panel px-2 py-1 text-xs font-semibold text-muted">
                  {reviewStatusLabel(review.status)}
                </span>
              </div>
              <p aria-label={`${review.rating} de 5 estrelas`} className="mt-3 text-lg text-accent">
                {reviewStars(review.rating)}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{review.body}</p>
              <p className="mt-3 text-xs text-muted">Por {review.author_name}</p>

              {review.status === "pending" ? (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  <form action={moderateReview}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="decision" value="approved" />
                    <input type="hidden" name="slug" value={review.product_slug ?? ""} />
                    <button
                      type="submit"
                      className="inline-flex min-h-10 items-center bg-accent px-4 text-sm font-semibold text-white"
                    >
                      Aprovar
                    </button>
                  </form>
                  <form action={moderateReview}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <input type="hidden" name="slug" value={review.product_slug ?? ""} />
                    <button
                      type="submit"
                      className="inline-flex min-h-10 items-center border border-line px-4 text-sm font-semibold hover:border-ink"
                    >
                      Rejeitar
                    </button>
                  </form>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="border border-line bg-panel p-8 text-center text-sm text-muted">
          Nenhuma avaliação neste filtro.
        </p>
      )}
    </section>
  );
}
