import type { Metadata } from "next";
import AdminNav from "@/components/AdminNav";

export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[70vh] px-4 py-12 sm:px-8 lg:px-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Evidence Reps
          </span>
          <h1 className="font-display text-4xl font-bold uppercase">Admin</h1>
        </div>
        <AdminNav />
      </div>
      {children}
    </main>
  );
}
