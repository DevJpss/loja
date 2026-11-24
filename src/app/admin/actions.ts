"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseProductForm } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos";
}

export async function createProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  const { error } = await createAdminClient().from("products").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    category_id: parsed.data.category_id,
    price_cents: parsed.data.price_cents,
    compare_at_price_cents: parsed.data.compare_at_price_cents,
    image_url: parsed.data.image_url,
    source_url: parsed.data.source_url,
    stock_status: parsed.data.stock_status,
    active: parsed.data.active,
    specs: {},
  });

  if (error) return { ok: false, message: error.message };

  updateTag("products");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos?saved=1");
}

export async function updateProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, message: "ID inválido" };
  }

  const parsed = parseProductForm(formData);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  const { error } = await createAdminClient()
    .from("products")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      category_id: parsed.data.category_id,
      price_cents: parsed.data.price_cents,
      compare_at_price_cents: parsed.data.compare_at_price_cents,
      image_url: parsed.data.image_url,
      source_url: parsed.data.source_url,
      stock_status: parsed.data.stock_status,
      active: parsed.data.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };

  updateTag("products");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos?saved=1");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) return;

  await createAdminClient().from("products").delete().eq("id", id);

  updateTag("products");
  revalidatePath("/admin/produtos");
}
