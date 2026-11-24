export const SITE_NAME = "Evidence Reps";
export const SITE_TAGLINE = "Every rep backed by evidence.";
export const SITE_DESCRIPTION =
  "Acessórios de treino baseados em evidências: caneleiras, anilhas, bands, straps e equipamentos para progredir em passos pequenos. Sem suplementos, sem promessas.";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://evidence-reps-lojha.vercel.app"
).replace(/\/+$/, "");

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
}

/** Valida links de fornecedor antes de exibi-los apenas no painel administrativo. */
export function isPublicPartnerUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return !/(^|\.)example\.(com|org|net)$/.test(url.hostname);
  } catch {
    return false;
  }
}
