import { createClient } from "@supabase/supabase-js";
import { demoCategories, demoProducts } from "../src/lib/demo-products.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Configure .env.local antes de rodar o seed.");
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Custo real negociado em cada anúncio, em centavos. A venda é calculada pela regra
// custo + R$ 23,58, arredondada para cima até terminar em ,90 (ver supplier-pricing).
const supplierItems = {
  "polia-baixa-tornozeleira-cross-over": { id: "23832623167", cost: 2632 },
  "caneleira-peso-1kg-par": { id: "21699207485", cost: 2700 },
  "caneleira-peso-2kg-par": { id: "19399261630", cost: 2902 },
  "anilha-1kg-ferro-fundido": { id: "20697078496", cost: 3590 },
  "par-anilhas-pintadas-1a5kg": { id: "58213241406", cost: 2999 },
  "anilha-125kg-justgofit": { id: "23794014733", cost: 2175 },
  "kit-5-mini-band": { id: "10742618126", cost: 2061 },
  "faixa-elastica-theraband-2m": { id: "18773158690", cost: 2490 },
  "par-straps-algodao": { id: "23895903148", cost: 1590 },
  "tala-strap-8": { id: "22294281995", cost: 1590 },
  "mordedor-jawzrsize": { id: "23298899051", cost: 1375 },
  "mascara-3d-bloqueio-luz": { id: "20997987038", cost: 2191 },
  "shaker-700ml-mola-peneira": { id: "20333223521", cost: 2149 },
};

// Slugs da vitrine antiga, substituídos pelos anúncios reais. Pedidos históricos
// guardam snapshots em order_items, então a remoção não afeta pedidos já feitos.
const legacyProductSlugs = [
  "polia-baixa-tornozeleira",
  "caneleira-punho-carga",
  "caneleira-tornozelo-polia",
  "anilha-micro-025-par",
  "anilha-micro-050-par",
  "anilha-micro-125-par",
  "mini-band-latex",
  "band-longa-tecido",
  "strap-reto-algodao",
  "strap-em-8",
  "mordedor-treino",
  "venda-olhos",
  "shaker-700ml",
];

async function run() {
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .upsert(
      demoCategories.map((category, index) => ({
        name: category.name,
        slug: category.slug,
        description: category.description,
        sort_order: index,
        active: true,
      })),
      { onConflict: "slug" },
    )
    .select("id,slug");

  if (catError) throw catError;

  const categoryIds = new Map(categories.map((category) => [category.slug, category.id]));

  const { error: productsError } = await supabase.from("products").upsert(
    demoProducts.map((product) => ({
      category_id: product.categories ? categoryIds.get(product.categories.slug) ?? null : null,
      name: product.name,
      slug: product.slug,
      description: product.description,
      specs: product.specs,
      image_url: product.image_url,
      price_cents: product.price_cents,
      compare_at_price_cents: product.compare_at_price_cents,
      source_url: product.source_url,
      stock_status: product.stock_status,
      active: true,
    })),
    { onConflict: "slug" },
  );

  if (productsError) throw productsError;

  const { error: cleanupError } = await supabase
    .from("products")
    .delete()
    .in("slug", legacyProductSlugs);
  if (cleanupError) throw cleanupError;

  const { data: monitorData, error: monitorReadError } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "supplier_monitor")
    .maybeSingle();
  if (monitorReadError) throw monitorReadError;

  const existingMonitor =
    monitorData?.value && typeof monitorData.value === "object" && monitorData.value.products
      ? monitorData.value
      : { products: {} };

  // Reconstrói o mapa só com os slugs atuais: remove monitores órfãos e preserva
  // histórico e checagens manuais já feitas nos itens que continuam no catálogo.
  const monitorProducts = {};
  for (const [slug, item] of Object.entries(supplierItems)) {
    monitorProducts[slug] = {
      ...(existingMonitor.products[slug] ?? {}),
      supplier_item_id: item.id,
      price_auto_adjust: true,
      supplier_price_cents: item.cost,
      supplier_available: true,
      last_error: null,
    };
  }

  const { error: monitorError } = await supabase
    .from("settings")
    .upsert(
      { key: "supplier_monitor", value: { products: monitorProducts } },
      { onConflict: "key" },
    );
  if (monitorError) throw monitorError;

  const { data: storedProducts, error: selectError } = await supabase
    .from("products")
    .select("id,slug");
  if (selectError) throw selectError;

  const productIds = new Map(storedProducts.map((product) => [product.slug, product.id]));

  for (const product of demoProducts) {
    if (!product.product_variants?.length) continue;
    const productId = productIds.get(product.slug);
    if (!productId) continue;

    const { error: deleteError } = await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", productId);
    if (deleteError) throw deleteError;

    const { error: variantError } = await supabase.from("product_variants").insert(
      product.product_variants.map((variant, index) => ({
        product_id: productId,
        name: variant.name,
        price_cents: variant.price_cents,
        sku: variant.sku,
        stock_status: variant.stock_status,
        position: index,
      })),
    );
    if (variantError) throw variantError;
  }

  console.log(`Seed concluído: ${demoCategories.length} categorias, ${demoProducts.length} produtos, ${Object.keys(monitorProducts).length} itens monitorados.`);
}

run().catch((error) => {
  console.error("Seed falhou:", error.message);
  process.exit(1);
});
