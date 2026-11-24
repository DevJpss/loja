"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/format";
import { checkout } from "@/app/checkout/actions";
import type { ActionState } from "@/lib/types";

type ViaCep = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

const field = "w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent";
const label = "flex flex-col gap-1.5 text-sm font-medium";

export default function CheckoutForm() {
  const { items, subtotal_cents } = useCart();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(checkout, {
    ok: false,
    message: "",
  });
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState({
    address: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [method, setMethod] = useState<"pix" | "card">("pix");

  async function lookupCep() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await response.json()) as ViaCep;
      if (data.erro) return;
      setAddress({
        address: data.logradouro ?? "",
        neighborhood: data.bairro ?? "",
        city: data.localidade ?? "",
        state: data.uf ?? "",
      });
    } catch {
      // ViaCEP indisponível: o cliente preenche manualmente.
    }
  }

  const payload = JSON.stringify(
    items.map((item) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      qty: item.qty,
    })),
  );

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <input type="hidden" name="items" value={payload} />

      <div className="grid gap-6">
        <section className="grid gap-4 border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-bold uppercase">Seus dados</h2>
          <label className={label}>
            Nome completo
            <input name="full_name" required minLength={3} className={field} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              E-mail
              <input name="email" type="email" required className={field} />
            </label>
            <label className={label}>
              WhatsApp
              <input name="phone" type="tel" required placeholder="11999999999" className={field} />
            </label>
          </div>
        </section>

        <section className="grid gap-4 border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-bold uppercase">Entrega</h2>
          <div className="flex gap-2">
            <label className={`${label} flex-1`}>
              CEP
              <input
                name="cep"
                value={cep}
                onChange={(event) => setCep(event.target.value)}
                onBlur={lookupCep}
                required
                minLength={8}
                placeholder="00000-000"
                className={field}
              />
            </label>
            <button
              type="button"
              onClick={lookupCep}
              className="mt-auto min-h-10 border border-ink px-4 text-sm font-semibold hover:bg-ink hover:text-white"
            >
              Buscar
            </button>
          </div>
          <label className={label}>
            Endereço
            <input name="address" required value={address.address} onChange={(event) => setAddress({ ...address, address: event.target.value })} className={field} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className={label}>
              Número
              <input name="number" required className={field} />
            </label>
            <label className={label}>
              Complemento
              <input name="complement" className={field} />
            </label>
            <label className={label}>
              Bairro
              <input name="neighborhood" required value={address.neighborhood} onChange={(event) => setAddress({ ...address, neighborhood: event.target.value })} className={field} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              Cidade
              <input name="city" required value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} className={field} />
            </label>
            <label className={label}>
              UF
              <input name="state" required minLength={2} maxLength={2} value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value.toUpperCase() })} className={field} />
            </label>
          </div>
        </section>

        <fieldset className="grid gap-3 border border-line bg-white p-6">
          <legend className="font-display text-2xl font-bold uppercase">Forma de pagamento</legend>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="radio"
              name="payment_method"
              value="pix"
              checked={method === "pix"}
              onChange={() => setMethod("pix")}
              aria-describedby="pix-help"
            />
            Pix
          </label>
          <p id="pix-help" className="pl-6 text-xs text-muted">
            QR Code gerado após criar o pedido.
          </p>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="radio"
              name="payment_method"
              value="card"
              checked={method === "card"}
              onChange={() => setMethod("card")}
              aria-describedby="card-help"
            />
            Cartão de crédito
          </label>
          <p id="card-help" className="pl-6 text-xs text-muted">
            Você é direcionado ao checkout seguro do Mercado Pago.
          </p>
        </fieldset>

        {state.message ? (
          <p role="alert" className="border border-red-500 bg-white p-3 text-sm text-red-700">
            {state.message}
          </p>
        ) : null}
      </div>

      <aside className="h-fit border border-line bg-white p-6">
        <h2 className="mb-4 font-display text-2xl font-bold uppercase">Resumo</h2>
        {items.map((item) => (
          <div key={`${item.product_id}:${item.variant_id ?? ""}`} className="flex justify-between gap-3 border-b border-line py-2 text-sm">
            <span className="text-muted">{item.qty}× {item.name}</span>
            <span>{formatPrice(item.unit_price_cents * item.qty)}</span>
          </div>
        ))}
        <div className="mt-4 flex justify-between font-semibold">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal_cents)}</span>
        </div>
        <p className="mt-2 text-xs text-muted">Frete calculado ao criar o pedido.</p>
        <button
          type="submit"
          disabled={pending || items.length === 0}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-accent px-6 font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Criando pedido..." : "Finalizar pedido"}
        </button>
        {items.length === 0 ? (
          <Link href="/carrinho" className="mt-3 block text-center text-sm font-semibold text-accent">
            Voltar ao carrinho
          </Link>
        ) : null}
      </aside>
    </form>
  );
}
