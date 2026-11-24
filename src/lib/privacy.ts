type AddressLike = Record<string, string | null | undefined> | null | undefined;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Mostra apenas o primeiro nome: suficiente para reconhecer o pedido sem expor o sobrenome. */
export function maskFullName(value: string | null | undefined): string {
  const parts = clean(value).split(/\s+/).filter(Boolean);
  return parts[0] ?? "Cliente";
}

/** Preserva o domínio para contextualizar o contato, mas esconde quase todo o endereço local. */
export function maskEmail(value: string | null | undefined): string {
  const email = clean(value);
  const at = email.lastIndexOf("@");
  if (at <= 0) return "••••";

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const visible = local.slice(0, 1);
  return `${visible}•••@${domain}`;
}

/** Mantém DDD e últimos 4 dígitos para conferência pelo telefone, sem revelar o número. */
export function maskPhone(value: string | null | undefined): string {
  const digits = clean(value).replace(/\D/g, "");
  if (digits.length < 10) return "••••";

  const local = digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
  if (local.length < 10) return "••••";

  return `(${local.slice(0, 2)}) •••••-${local.slice(-4)}`;
}

/** Nunca devolve rua, número, complemento, bairro ou CEP — apenas cidade e UF. */
export function maskCityState(address: AddressLike): string {
  const city = clean(address?.city);
  const state = clean(address?.state).toUpperCase();

  if (city && state) return `${city}/${state}`;
  return city || state || "Local não informado";
}
