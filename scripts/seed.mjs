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

  console.log(`Seed concluído: ${demoCategories.length} categorias, ${demoProducts.length} produtos.`);
}

run().catch((error) => {
  console.error("Seed falhou:", error.message);
  process.exit(1);
});
