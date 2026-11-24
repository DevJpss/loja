"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const SLUG = /^[a-z0-9-]+$/;

export async function moderateReview(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (
    !z.string().uuid().safeParse(id).success ||
    (decision !== "approved" && decision !== "rejected")
  ) {
    redirect("/admin/avaliacoes?erro=1");
  }

  const { error } = await createAdminClient()
    .from("reviews")
    .update({
      status: decision,
      approved_at: decision === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) redirect("/admin/avaliacoes?erro=1");

  updateTag("reviews");
  revalidatePath("/admin/avaliacoes");
  if (SLUG.test(slug)) revalidatePath(`/produto/${slug}`);
  redirect("/admin/avaliacoes?saved=1");
}
