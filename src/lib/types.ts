export type StockStatus = "available" | "low" | "out_of_stock";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type ProductVariant = {
  id: string;
  name: string;
  price_cents: number;
  sku: string | null;
  stock_status: StockStatus;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  specs: Record<string, string>;
  image_url: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  source_url: string;
  stock_status: StockStatus;
  active: boolean;
  categories?: Pick<Category, "name" | "slug"> | null;
  product_variants?: ProductVariant[];
};

export type ProductInput = {
  name: string;
  slug: string;
  description: string;
  category_id: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  image_url: string;
  source_url: string;
  stock_status: StockStatus;
  active: boolean;
  specs: Record<string, string>;
};

export type ActionState = {
  ok: boolean;
  message: string;
};

export type CartItem = {
  product_id: string;
  variant_id: string | null;
  slug: string;
  name: string;
  image_url: string | null;
  unit_price_cents: number;
  variant_name: string | null;
  qty: number;
};

export type CheckoutInput = {
  items: CartItem[];
  full_name: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  payment_method: "pix" | "card";
};
