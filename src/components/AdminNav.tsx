"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/avaliacoes", label: "Avaliações" },
  { href: "/admin/fornecedor", label: "Fornecedor" },
  { href: "/", label: "Ver loja" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação administrativa" className="flex flex-wrap gap-4 text-sm font-medium">
      {links.map((link) => {
        const active = link.href === "/" ? false : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={active ? "text-accent underline underline-offset-4" : "hover:text-accent"}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
