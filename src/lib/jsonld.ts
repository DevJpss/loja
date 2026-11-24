/** Serializa JSON-LD escapando `<`, conforme a recomendação dos docs do Next.js. */
export function jsonLdHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
