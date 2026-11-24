import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Healthcheck público e sem PII: responde 200 apenas quando o banco responde. */
export async function GET() {
  await connection();

  let database: "ok" | "unavailable" = "unavailable";
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("settings").select("key").limit(1);
    if (!error) database = "ok";
  } catch {
    // Sem detalhes de configuração na resposta.
  }

  const ok = database === "ok";
  return Response.json(
    {
      status: ok ? "ok" : "degraded",
      database,
      checked_at: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
