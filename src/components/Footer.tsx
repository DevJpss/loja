import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink px-4 py-10 text-white sm:px-8 lg:px-16">
      <div className="flex flex-wrap justify-between gap-8">
        <div>
          <p className="font-display text-3xl font-bold uppercase tracking-[0.08em]">
            Evidence Reps
          </p>
          <p className="mt-2 max-w-sm text-sm text-line">
            Equipamentos para quem treina de verdade. Cada item do catálogo é
            escolhido para apoiar sua rotina, do primeiro aquecimento à última
            série.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold uppercase tracking-wider">Navegação</p>
          <div className="flex flex-col gap-1.5 text-line">
            <Link href="/produtos" className="hover:text-white">Produtos</Link>
            <Link href="/#categorias" className="hover:text-white">Categorias</Link>
            <Link href="/admin/login" className="hover:text-white">Admin</Link>
          </div>
        </div>
      </div>
      <p className="mt-10 border-t border-white/15 pt-5 text-xs text-line">
        © 2026 Evidence Reps. Todos os direitos reservados.
      </p>
    </footer>
  );
}
