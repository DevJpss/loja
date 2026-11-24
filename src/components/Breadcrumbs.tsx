import Link from "next/link";
import { jsonLdHtml } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";

export type Crumb = { label: string; href?: string };

/** Trilha acessível com JSON-LD; o último item é a página atual. */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length < 2) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <nav aria-label="Trilha de navegação" className="mb-6 text-sm">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {current ? (
                <span aria-current="page" className="font-semibold text-ink">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link href={item.href ?? "/"} className="hover:text-accent">
                    {item.label}
                  </Link>
                  <span aria-hidden="true" className="text-line">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
