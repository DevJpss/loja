import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasPublicConfig(): boolean {
  return Boolean(url && anonKey);
}

export function hasAdminConfig(): boolean {
  return Boolean(url && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createClient() {
  if (!url || !anonKey) {
    throw new Error("Supabase não configurado. Copie .env.example para .env.local e preencha as chaves.");
  }
  return createBrowserClient(url, anonKey);
}
