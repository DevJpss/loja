"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartBadge() {
  const { count } = useCart();

  return (
    <Link href="/carrinho" className="relative hover:text-accent">
      Carrinho
      {count > 0 ? (
        <span className="ml-1.5 inline-flex min-w-5 items-center justify-center bg-accent px-1.5 py-0.5 text-xs font-semibold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
