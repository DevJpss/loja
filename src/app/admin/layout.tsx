import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[70vh] px-4 py-12 sm:px-8 lg:px-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Evidence Reps
          </span>
          <h1 className="font-display text-4xl font-bold uppercase">Admin</h1>
        </div>
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/admin/produtos" className="hover:text-accent">Produtos</Link>
          <Link href="/admin/pedidos" className="hover:text-accent">Pedidos</Link>
          <Link href="/" className="hover:text-accent">Ver loja</Link>
        </nav>
      </div>
      {children}
    </main>
  );
}
