import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "../login/actions";

// O guard de autenticação redireciona visitantes não logados durante o prefetch.
// A validação de navegação instantânea não suporta esse redirect, então o
// segmento administrativo fica explicitamente fora dessa validação.
export const instant = false;

async function AdminGuard({ children }: { children: React.ReactNode }) {
  // A leitura da sessão usa Date.now() internamente no Supabase Auth.
  // connection() marca este subtree como dependente da requisição,
  // evitando que o valor instável seja avaliado durante o prerender.
  await connection();
  const user = await requireAdmin();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-sm">
        <span className="text-muted">
          Logado como <strong className="text-ink">{user.email}</strong>
        </span>
        <form action={signOut}>
          <button type="submit" className="border border-ink px-4 py-2 font-semibold hover:bg-ink hover:text-white">
            Sair
          </button>
        </form>
      </div>
      {children}
    </>
  );
}

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Verificando acesso...</p>}>
      <AdminGuard>{children}</AdminGuard>
    </Suspense>
  );
}
