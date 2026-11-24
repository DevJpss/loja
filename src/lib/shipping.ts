/**
 * Frete cobrado no checkout, por região de entrega.
 *
 * Medição feita em 24/11/2026 no checkout logado da Shopee, anúncio da polia
 * baixa (itemid 23832623167), enviado de Salvador/BA, entrega padrão:
 *
 *   Salvador/BA    R$ 12,04    São Paulo/SP    R$ 8,39
 *   Rio/RJ         R$ 9,62     Belo Horizonte  R$ 8,39
 *   Recife/PE      R$ 14,48    Fortaleza/CE    R$ 15,69
 *   Manaus/AM      R$ 22,65    Porto Alegre/RS R$ 10,29
 *   Brasília/DF    R$ 10,83    Cuiabá/MT       R$ 13,25
 *   Boa Vista/RR   R$ 33,59    Macapá/AP       R$ 39,66
 *
 * Cobramos o maior valor medido de cada região, arredondado para cima, para
 * que o custo do fornecedor não corrija a margem do pedido. Roraima e Amapá
 * ficam separados porque o frete da Shopee é bem maior que no resto do Norte.
 */

export type ShippingRegion = {
  label: string;
  states: string[];
  priceCents: number;
};

export const SHIPPING_REGIONS: ShippingRegion[] = [
  { label: "Sudeste", states: ["SP", "RJ", "MG", "ES"], priceCents: 990 },
  { label: "Sul", states: ["PR", "SC", "RS"], priceCents: 1090 },
  { label: "Centro-Oeste", states: ["GO", "DF", "MS", "MT"], priceCents: 1390 },
  {
    label: "Nordeste",
    states: ["BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA"],
    priceCents: 1590,
  },
  { label: "Norte", states: ["AC", "RO", "AM", "PA", "TO"], priceCents: 2490 },
  { label: "Norte — RR e AP", states: ["RR", "AP"], priceCents: 3990 },
];

export function shippingRegionForState(state: string): ShippingRegion | null {
  const uf = state.trim().toUpperCase();
  return SHIPPING_REGIONS.find((region) => region.states.includes(uf)) ?? null;
}

export function shippingCentsForState(state: string): number | null {
  return shippingRegionForState(state)?.priceCents ?? null;
}
