import { revalidatePath, revalidateTag } from "next/cache";
import { runSupplierChecks } from "@/lib/supplier-monitor";

async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "CRON_SECRET não configurado" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const runId = request.headers.get("ce-id") ?? crypto.randomUUID();
  const result = await runSupplierChecks({ runId });

  if (!result.ok && result.errors[0]?.includes("SUPPLIER_QUOTE_URL")) {
    return Response.json(result, { status: 503 });
  }

  revalidateTag("products", { expire: 0 });
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/fornecedor");

  return Response.json(result, { status: result.ok ? 200 : 207 });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
