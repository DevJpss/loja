import LoginForm from "@/components/LoginForm";
import { hasPublicConfig } from "@/lib/supabase/client";
import { signIn } from "./actions";

export default function LoginPage() {
  const configured = hasPublicConfig();

  return (
    <section className="max-w-3xl">
      <h2 className="mb-2 font-display text-3xl font-bold uppercase">Entrar</h2>
      <p className="mb-6 text-sm text-muted">
        Acesso restrito a usuários cadastrados na tabela <code>admins</code> do Supabase.
      </p>

      {configured ? (
        <LoginForm action={signIn} />
      ) : (
        <div className="border border-accent bg-panel p-5 text-sm leading-relaxed">
          <p className="font-semibold">Supabase não configurado.</p>
          <p className="mt-2">
            Copie <code>.env.example</code> para <code>.env.local</code>, preencha as
            chaves do seu projeto e aplique <code>supabase/migrations/0001_init.sql</code>.
            O catálogo público funciona com dados de demonstração enquanto isso.
          </p>
        </div>
      )}
    </section>
  );
}
