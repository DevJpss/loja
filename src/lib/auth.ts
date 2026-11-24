import { redirect } from "next/navigation";
import { hasPublicConfig } from "./supabase/client";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

export async function getSessionUser() {
  if (!hasPublicConfig()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || !(await isAdmin(user.id))) {
    redirect("/admin/login");
  }
  return user;
}
