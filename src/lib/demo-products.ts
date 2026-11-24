import type { Category, Product } from "./types";

export const demoCategories: Category[] = [
  { id: "c1", name: "Caneleiras", slug: "caneleiras", description: "De tornozelo e de punho, para polia ou com carga." },
  { id: "c2", name: "Microloading", slug: "microloading", description: "Anilhas de 0,25 a 1,25 kg para progredir em passos pequenos." },
  { id: "c3", name: "Bands", slug: "bands", description: "Minis e longas, de tecido ou látex." },
  { id: "c4", name: "Straps", slug: "straps", description: "Retos e em 8, para segurar a barra." },
  { id: "c5", name: "Acessórios", slug: "acessorios", description: "Mordedor, venda, shaker e toalha." },
  { id: "c6", name: "Polia e Cross Over", slug: "polia-cross-over", description: "Tornozeleiras e acessórios para polia baixa e cross over." },
];

const image = (name: string) => `/products/${name}.svg`;

export const demoProducts: Product[] = [
  {
    id: "d0", category_id: "c6", name: "Par Polia Baixa para Tornozeleira — Cross Over", slug: "polia-baixa-tornozeleira-cross-over",
    description: "Par de tornozeleiras de polia baixa para cross over, com argola de aço cromado para engate na polia. Estrutura em nylon resistente, EVA de 6 mm revestido em courino de 2,4 mm com reforço interno, acolchoamento confortável no calcanhar e costuras reforçadas. Cada unidade mede cerca de 6 × 15 cm e pesa aproximadamente 60 g. Vendido em par (2 unidades), na cor preta. Indicado para cross over, polia baixa, treino funcional, estúdios e clínicas de fisioterapia. Limpe com pano seco e proteja do sol. Garantia de 3 meses contra defeitos de fabricação.",
    specs: {
      Marca: "Fronture Fitness",
      Conteúdo: "Par com 2 unidades",
      Material: "EVA de 6 mm revestido em courino de 2,4 mm com reforço interno",
      Argola: "Aço cromado",
      Medidas: "6 cm × 15 cm (C × L), aproximadamente",
      Peso: "Aproximadamente 60 g por unidade",
      Cor: "Preto",
      Uso: "Cross over, polia baixa, treino funcional e fisioterapia",
      Cuidados: "Limpar com pano seco e proteger do sol",
      Garantia: "3 meses contra defeitos de fabricação",
    },
    image_url: "/products/polia-baixa-tornozeleira-1.jpg",
    price_cents: 4990, compare_at_price_cents: null,
    source_url: "https://shopee.com.br/PAR-Polia-Baixa-Tornozeleira-Cross-Over-Puxador-Gl%C3%BAteo-Academia-Muscula%C3%A7%C3%A3o-Funcional-Fitness-Puxador-Coice-i.329230503.23832623167",
    stock_status: "available", active: true, categories: { name: "Polia e Cross Over", slug: "polia-cross-over" },
  },
  {
    id: "d1", category_id: "c1", name: "Caneleira de tornozelo com polia", slug: "caneleira-tornozelo-polia",
    description: "Caneleira ajustável com polia para treino de pernas. Fixação firme e acolchoamento confortável.",
    specs: { Material: "Nylon e velcro", Medidas: "Ajustável" }, image_url: image("gear"),
    price_cents: 8900, compare_at_price_cents: 10900, source_url: "https://example.com/caneleira-tornozelo",
    stock_status: "available", active: true, categories: { name: "Caneleiras", slug: "caneleiras" },
  },
  {
    id: "d2", category_id: "c1", name: "Caneleira de punho com carga", slug: "caneleira-punho-carga",
    description: "Caneleira de punho para adicionar carga ao treino de braços e ombros.",
    specs: { Material: "Neoprene", Medidas: "Ajustável" }, image_url: image("gear"),
    price_cents: 7200, compare_at_price_cents: null, source_url: "https://example.com/caneleira-punho",
    stock_status: "available", active: true, categories: { name: "Caneleiras", slug: "caneleiras" },
  },
  {
    id: "d3", category_id: "c2", name: "Anilha de microloading 0,25 kg (par)", slug: "anilha-micro-025-par",
    description: "Anilhas magnéticas de 0,25 kg para progressão de carga em passos pequenos. Vendidas em par.",
    specs: { Material: "Aço com ímã", Peso: "0,25 kg cada" }, image_url: image("plate"),
    price_cents: 5900, compare_at_price_cents: null, source_url: "https://example.com/anilha-025",
    stock_status: "available", active: true, categories: { name: "Microloading", slug: "microloading" },
    product_variants: [
      { id: "v1", name: "0,25 kg", price_cents: 5900, sku: "ML-025", stock_status: "available" },
      { id: "v2", name: "0,5 kg", price_cents: 6900, sku: "ML-050", stock_status: "available" },
      { id: "v3", name: "1 kg", price_cents: 8900, sku: "ML-100", stock_status: "low" },
    ],
  },
  {
    id: "d4", category_id: "c2", name: "Anilha de microloading 0,5 kg (par)", slug: "anilha-micro-050-par",
    description: "Par de anilhas de 0,5 kg para ajustes finos de carga na barra.",
    specs: { Material: "Aço com ímã", Peso: "0,5 kg cada" }, image_url: image("plate"),
    price_cents: 6900, compare_at_price_cents: 7900, source_url: "https://example.com/anilha-050",
    stock_status: "available", active: true, categories: { name: "Microloading", slug: "microloading" },
  },
  {
    id: "d5", category_id: "c2", name: "Anilha de microloading 1,25 kg (par)", slug: "anilha-micro-125-par",
    description: "Par de anilhas de 1,25 kg para progressão controlada de carga.",
    specs: { Material: "Aço com ímã", Peso: "1,25 kg cada" }, image_url: image("plate"),
    price_cents: 9900, compare_at_price_cents: null, source_url: "https://example.com/anilha-125",
    stock_status: "low", active: true, categories: { name: "Microloading", slug: "microloading" },
  },
  {
    id: "d6", category_id: "c3", name: "Mini band de látex", slug: "mini-band-latex",
    description: "Mini band de látex para ativação e trabalho de glúteos. Resistência leve a média.",
    specs: { Material: "Látex", Resistência: "Leve / média" }, image_url: image("band"),
    price_cents: 4900, compare_at_price_cents: null, source_url: "https://example.com/mini-band",
    stock_status: "available", active: true, categories: { name: "Bands", slug: "bands" },
  },
  {
    id: "d7", category_id: "c3", name: "Band longa de tecido", slug: "band-longa-tecido",
    description: "Band longa de tecido para mobilidade, assistência e treino funcional.",
    specs: { Material: "Tecido elástico", Medidas: "2 m" }, image_url: image("band"),
    price_cents: 9900, compare_at_price_cents: 11900, source_url: "https://example.com/band-longa",
    stock_status: "available", active: true, categories: { name: "Bands", slug: "bands" },
  },
  {
    id: "d8", category_id: "c4", name: "Strap reto de algodão", slug: "strap-reto-algodao",
    description: "Strap reto para segurar a barra quando o antebraço limita o treino.",
    specs: { Material: "Algodão", Medidas: "60 cm" }, image_url: image("strap"),
    price_cents: 3900, compare_at_price_cents: null, source_url: "https://example.com/strap-reto",
    stock_status: "available", active: true, categories: { name: "Straps", slug: "straps" },
  },
  {
    id: "d9", category_id: "c4", name: "Strap em 8", slug: "strap-em-8",
    description: "Strap em 8 para pegada firme e distribuição uniforme da pressão.",
    specs: { Material: "Algodão reforçado", Medidas: "Ajustável" }, image_url: image("strap"),
    price_cents: 5900, compare_at_price_cents: null, source_url: "https://example.com/strap-8",
    stock_status: "available", active: true, categories: { name: "Straps", slug: "straps" },
  },
  {
    id: "d10", category_id: "c5", name: "Mordedor de treino", slug: "mordedor-treino",
    description: "Mordedor de silicone para uso durante treinos intensos.",
    specs: { Material: "Silicone", Medidas: "Único" }, image_url: image("gear"),
    price_cents: 2900, compare_at_price_cents: null, source_url: "https://example.com/mordedor",
    stock_status: "available", active: true, categories: { name: "Acessórios", slug: "acessorios" },
  },
  {
    id: "d11", category_id: "c5", name: "Venda para os olhos", slug: "venda-olhos",
    description: "Venda macia para treinos de propriocepção e foco.",
    specs: { Material: "Seda", Medidas: "Ajustável" }, image_url: image("gear"),
    price_cents: 2900, compare_at_price_cents: null, source_url: "https://example.com/venda",
    stock_status: "available", active: true, categories: { name: "Acessórios", slug: "acessorios" },
  },
  {
    id: "d12", category_id: "c5", name: "Shaker 700 ml", slug: "shaker-700ml",
    description: "Shaker com mixer interno e tampa à prova de vazamento.",
    specs: { Material: "Plástico BPA free", Medidas: "700 ml" }, image_url: image("gear"),
    price_cents: 6900, compare_at_price_cents: 7900, source_url: "https://example.com/shaker",
    stock_status: "available", active: true, categories: { name: "Acessórios", slug: "acessorios" },
  },
];
