/** Helpers puros das avaliações — sem dependência de Next.js ou Supabase. */

export type ReviewLike = { rating: number };

export type ReviewStats = {
  count: number;
  average: number | null;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

const statusLabels: Record<string, string> = {
  pending: "Aguardando aprovação",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

/** Ignora notas fora da faixa e arredonda a média a uma casa decimal. */
export function reviewStats(reviews: readonly ReviewLike[]): ReviewStats {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let total = 0;

  for (const review of reviews) {
    const rating = Math.round(review.rating);
    if (rating < 1 || rating > 5) continue;
    distribution[rating as 1 | 2 | 3 | 4 | 5] += 1;
    total += rating;
  }

  const count = distribution[1] + distribution[2] + distribution[3] + distribution[4] + distribution[5];
  return {
    count,
    average: count ? Math.round((total / count) * 10) / 10 : null,
    distribution,
  };
}

/** Mostra no máximo nome e inicial do sobrenome na vitrine pública. */
export function reviewAuthorLabel(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Cliente verificado";
  if (parts.length === 1) return parts[0].slice(0, 40);
  return `${parts[0].slice(0, 40)} ${parts[1][0]}.`;
}

export function reviewStatusLabel(status: string): string {
  return statusLabels[status] ?? status;
}

export function reviewStars(rating: number): string {
  const value = Math.min(5, Math.max(0, Math.round(rating)));
  return "★".repeat(value) + "☆".repeat(5 - value);
}
