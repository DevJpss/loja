"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/types";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

export default function LoginForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    ok: false,
    message: "",
  });

  return (
    <form action={formAction} className="grid max-w-sm gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        E-mail
        <input name="email" type="email" required className="border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Senha
        <input name="password" type="password" required className="border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent" />
      </label>
      {state.message ? (
        <p className="border border-red-500 p-3 text-sm text-red-700">{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center bg-ink px-6 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
