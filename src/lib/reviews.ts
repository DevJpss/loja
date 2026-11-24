import { cacheLife, cacheTag } from "next/cache";
import {
  reviewAuthorLabel,
  reviewStats,
  type ReviewStats,
} from "./review-helpers";
import { createAdminClient } from "./supabase/admin";
import { hasPublicConfig } from "./supabase/client";

export type PublicReview = {
  id: string;
  author: string;
  rating: number;
  body: string;
  created_at: string;
};

export type PublicReviews = {
  reviews: PublicReview[];
  stats: ReviewStats;
};

const EMPTY: PublicReviews = { reviews: [], stats: reviewStats([]) };

type RawApprovedReview = {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
};

/** Avaliações aprovadas, exibidas no PDP. Falha silenciosa se a tabela não existir. */
export async function getApprovedReviews(productId: string): Promise<PublicReviews> {
  "use cache";
  cacheTag("reviews");
  cacheLife("hours");

  if (!hasPublicConfig()) return EMPTY;

  try {
    const { data, error } = await createAdminClient()
      .from("reviews")
      .select("id,author_name,rating,body,created_at")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error || !data) return EMPTY;

    const reviews = (data as RawApprovedReview[]).map((row) => ({
      id: row.id,
      author: reviewAuthorLabel(row.author_name),
      rating: row.rating,
      body: row.body,
      created_at: row.created_at,
    }));
    return { reviews, stats: reviewStats(reviews) };
  } catch {
    return EMPTY;
  }
}

/** Estado das avaliações feitas para este pedido (usado no rastreio). */
export async function getOrderReviewStatuses(
  orderId: string,
  productIds: string[],
): Promise<Record<string, string>> {
  if (!hasPublicConfig() || productIds.length === 0) return {};

  try {
    const { data, error } = await createAdminClient()
      .from("reviews")
      .select("product_id,status")
      .eq("order_id", orderId)
      .in("product_id", productIds);
    if (error || !data) return {};
    return Object.fromEntries(
      (data as Array<{ product_id: string; status: string }>).map((row) => [
        row.product_id,
        row.status,
      ]),
    );
  } catch {
    return {};
  }
}

export type AdminReview = {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  product_name: string;
  product_slug: string | null;
  order_code: string;
};

type RawAdminReview = {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  products: { name: string; slug: string } | { name: string; slug: string }[] | null;
  orders: { code: string } | { code: string }[] | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export async function getAdminReviews(status?: string): Promise<AdminReview[]> {
  if (!hasPublicConfig()) return [];

  try {
    let query = createAdminClient()
      .from("reviews")
      .select("id,author_name,rating,body,status,created_at,approved_at,products(name,slug),orders(code)")
      .order("created_at", { ascending: false });
    if (status === "pending" || status === "approved" || status === "rejected") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return (data as RawAdminReview[]).map((row) => {
      const product = first(row.products);
      const order = first(row.orders);
      return {
        id: row.id,
        author_name: row.author_name,
        rating: row.rating,
        body: row.body,
        status: row.status,
        created_at: row.created_at,
        approved_at: row.approved_at,
        product_name: product?.name ?? "Produto removido",
        product_slug: product?.slug ?? null,
        order_code: order?.code ?? "—",
      };
    });
  } catch {
    return [];
  }
}
