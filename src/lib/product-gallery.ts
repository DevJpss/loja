import type { Product } from "./types";

/** Fotos locais adicionais, quando o produto tem mais de uma imagem de referência. */
const galleries: Record<string, string[]> = {
  "polia-baixa-tornozeleira-cross-over": [
    "/products/polia-baixa-tornozeleira-1.jpg",
    "/products/polia-baixa-tornozeleira-2.jpg",
    "/products/polia-baixa-tornozeleira-3.jpg",
    "/products/polia-baixa-tornozeleira-4.jpg",
    "/products/polia-baixa-tornozeleira-5.jpg",
  ],
  "caneleira-peso-1kg-par": [
    "/products/caneleira-peso-1kg-par-1.jpg",
    "/products/caneleira-peso-1kg-par-2.jpg",
    "/products/caneleira-peso-1kg-par-3.jpg",
  ],
  "caneleira-peso-2kg-par": [
    "/products/caneleira-peso-2kg-par-1.jpg",
    "/products/caneleira-peso-2kg-par-2.jpg",
    "/products/caneleira-peso-2kg-par-3.jpg",
  ],
  "anilha-1kg-ferro-fundido": [
    "/products/anilha-1kg-ferro-fundido-1.jpg",
  ],
  "par-anilhas-pintadas-1a5kg": [
    "/products/par-anilhas-pintadas-1a5kg-1.jpg",
    "/products/par-anilhas-pintadas-1a5kg-2.jpg",
    "/products/par-anilhas-pintadas-1a5kg-3.jpg",
  ],
  "anilha-125kg-justgofit": [
    "/products/anilha-125kg-justgofit-1.jpg",
    "/products/anilha-125kg-justgofit-2.jpg",
    "/products/anilha-125kg-justgofit-3.jpg",
  ],
  "kit-5-mini-band": [
    "/products/kit-5-mini-band-1.jpg",
    "/products/kit-5-mini-band-2.jpg",
    "/products/kit-5-mini-band-3.jpg",
  ],
  "faixa-elastica-theraband-2m": [
    "/products/faixa-elastica-theraband-2m-1.jpg",
    "/products/faixa-elastica-theraband-2m-2.jpg",
    "/products/faixa-elastica-theraband-2m-3.jpg",
  ],
  "par-straps-algodao": [
    "/products/par-straps-algodao-1.jpg",
    "/products/par-straps-algodao-2.jpg",
    "/products/par-straps-algodao-3.jpg",
  ],
  "tala-strap-8": [
    "/products/tala-strap-8-1.jpg",
    "/products/tala-strap-8-2.jpg",
    "/products/tala-strap-8-3.jpg",
  ],
  "mordedor-jawzrsize": [
    "/products/mordedor-jawzrsize-1.jpg",
    "/products/mordedor-jawzrsize-2.jpg",
    "/products/mordedor-jawzrsize-3.jpg",
  ],
  "mascara-3d-bloqueio-luz": [
    "/products/mascara-3d-bloqueio-luz-1.jpg",
    "/products/mascara-3d-bloqueio-luz-2.jpg",
    "/products/mascara-3d-bloqueio-luz-3.jpg",
  ],
  "shaker-700ml-mola-peneira": [
    "/products/shaker-700ml-mola-peneira-1.jpg",
    "/products/shaker-700ml-mola-peneira-2.jpg",
    "/products/shaker-700ml-mola-peneira-3.jpg",
  ],
  "cinturao-musculacao-xd-fitness": [
    "/products/cinturao-musculacao-xd-fitness-1.jpg",
    "/products/cinturao-musculacao-xd-fitness-2.jpg",
    "/products/cinturao-musculacao-xd-fitness-3.jpg",
  ],
  "par-wrist-wraps-nog": [
    "/products/par-wrist-wraps-nog-1.jpg",
    "/products/par-wrist-wraps-nog-2.jpg",
    "/products/par-wrist-wraps-nog-3.jpg",
  ],
  "faixa-joelho-compressao": [
    "/products/faixa-joelho-compressao-1.jpg",
    "/products/faixa-joelho-compressao-2.jpg",
    "/products/faixa-joelho-compressao-3.jpg",
  ],
  "presilhas-olimpicas-lock-jaw": [
    "/products/presilhas-olimpicas-lock-jaw-1.jpg",
    "/products/presilhas-olimpicas-lock-jaw-2.jpg",
    "/products/presilhas-olimpicas-lock-jaw-3.jpg",
  ],
  "almofada-barra-hip-thrust": [
    "/products/almofada-barra-hip-thrust-1.jpg",
    "/products/almofada-barra-hip-thrust-2.jpg",
    "/products/almofada-barra-hip-thrust-3.jpg",
  ],
  "step-40x30x10": [
    "/products/step-40x30x10-1.jpg",
    "/products/step-40x30x10-2.jpg",
    "/products/step-40x30x10-3.jpg",
  ],
  "barra-body-pump-120cm": [
    "/products/barra-body-pump-120cm-1.jpg",
    "/products/barra-body-pump-120cm-2.jpg",
    "/products/barra-body-pump-120cm-3.jpg",
  ],
  "colete-carga-10kg": [
    "/products/colete-carga-10kg-1.jpg",
    "/products/colete-carga-10kg-2.jpg",
    "/products/colete-carga-10kg-3.jpg",
  ],
  "kit-halteres-ajustaveis-20kg": [
    "/products/kit-halteres-ajustaveis-20kg-1.jpg",
    "/products/kit-halteres-ajustaveis-20kg-2.jpg",
    "/products/kit-halteres-ajustaveis-20kg-3.jpg",
  ],
};

export function getProductGallery(product: Product): string[] {
  return galleries[product.slug] ?? [product.image_url ?? "/products/gear.svg"];
}
