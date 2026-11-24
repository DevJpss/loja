"use server";

import { redirect } from "next/navigation";
import { hasPublicConfig } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!hasPublicConfig()) {
    return {
      ok: false,
      message: "Configure o Supabase no .env.local antes de entrar.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { ok: false, message: "Informe e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };

  redirect("/admin/produtos");
}

export async function signOut(): Promise<void> {
  if (!hasPublicConfig()) redirect("/admin/login");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
