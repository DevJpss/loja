import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalize seu pedido na Evidence Reps.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main className="px-4 py-12 sm:px-8 lg:px-16">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Último passo
      </span>
      <h1 className="mb-3 mt-2 font-display text-6xl font-bold uppercase sm:text-7xl">
        Checkout
      </h1>
      <p className="mb-10 max-w-2xl text-muted">
        Seus dados de pagamento ficam somente no gateway. Nós recebemos apenas a
        confirmação do pagamento.
      </p>
      <CheckoutForm />
    </main>
  );
}
