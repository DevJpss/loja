"use client";

import { useState } from "react";

export default function CopySupplierLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-10 items-center bg-ink px-4 text-sm font-semibold text-white hover:opacity-90"
      >
        Abrir anúncio ↗
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-10 items-center border border-ink px-4 text-sm font-semibold hover:bg-ink hover:text-white"
      >
        Copiar link
      </button>
      <span role="status" aria-live="polite" className="text-xs text-muted">
        {copied ? "Link copiado." : ""}
      </span>
    </div>
  );
}
