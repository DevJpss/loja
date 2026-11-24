import { cacheLife, cacheTag } from "next/cache";
import { demoCategories, demoProducts } from "./demo-products";
import { hasPublicConfig } from "./supabase/client";
import { createAdminClient } from "./supabase/admin";
import { priceFromMonitor, readSupplierMonitor } from "./supplier-monitor";
import type { Category, Product } from "./types";

const PRODUCT_FIELDS =
  "id,category_id,name,slug,description,specs,image_url,price_cents,compare_at_price_cents,source_url,stock_status,active,categories(name,slug),product_variants(id,name,price_cents,sku,stock_status)";

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  if (!hasPublicConfig()) return demoProducts;

  try {
    const admin = createAdminClient();
    const [{ data, error }, monitor] = await Promise.all([
      admin
        .from("products")
        .select(PRODUCT_FIELDS)
        .eq("active", true)
        .order("name", { ascending: true }),
      readSupplierMonitor(admin),
    ]);
    if (error || !data) return demoProducts;
    return (data as unknown as Product[]).map((product) => ({
      ...product,
      price_cents: priceFromMonitor(product, monitor),
    }));
  } catch {
    return demoProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");

  if (!hasPublicConfig()) {
    return demoProducts.find((product) => product.slug === slug) ?? null;
  }

  try {
    const admin = createAdminClient();
    const [{ data, error }, monitor] = await Promise.all([
      admin
        .from("products")
        .select(PRODUCT_FIELDS)
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle(),
      readSupplierMonitor(admin),
    ]);
    if (error || !data) return null;
    const product = data as unknown as Product;
    return { ...product, price_cents: priceFromMonitor(product, monitor) };
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag("categories");
  cacheLife("hours");

  if (!hasPublicConfig()) return demoCategories;

  try {
    const { data, error } = await createAdminClient()
      .from("categories")
      .select("id,name,slug,description")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error || !data) return demoCategories;
    return data as Category[];
  } catch {
    return demoCategories;
  }
}

export async function getAdminProducts(): Promise<Product[]> {
  if (!hasPublicConfig()) return demoProducts;

  try {
    const { data, error } = await createAdminClient()
      .from("products")
      .select("id,category_id,name,slug,description,image_url,price_cents,compare_at_price_cents,source_url,stock_status,active,categories(name,slug)")
      .order("name", { ascending: true });
    if (error || !data) return [];
    return data as unknown as Product[];
  } catch {
    return [];
  }
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  if (!hasPublicConfig()) return demoProducts.find((p) => p.id === id) ?? null;

  try {
    const { data, error } = await createAdminClient()
      .from("products")
      .select("id,category_id,name,slug,description,image_url,price_cents,compare_at_price_cents,source_url,stock_status,active,specs")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as unknown as Product;
  } catch {
    return null;
  }
}
