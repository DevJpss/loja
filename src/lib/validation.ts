import { z } from "zod";

const httpUrl = z.string().trim().refine((value) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}, "Informe uma URL válida");

export const productSchema = z.object({
  name: z.string().trim().min(3, "Nome muito curto").max(120),
  slug: z.string().trim().min(3, "Slug muito curto").max(140).regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  description: z.string().trim().max(1000),
  category_id: z.string().uuid().nullable(),
  price_cents: z.coerce.number().int().min(1, "Preço deve ser maior que zero"),
  compare_at_price_cents: z.coerce.number().int().min(0).nullable().optional(),
  image_url: httpUrl,
  source_url: httpUrl,
  stock_status: z.enum(["available", "low", "out_of_stock"]),
  active: z.boolean(),
});

export type ParsedProduct = z.infer<typeof productSchema>;

/** Payload mínimo das notificações de pagamento; campos extras são ignorados. */
export const paymentWebhookSchema = z.object({
  type: z.string().optional(),
  data: z
    .object({
      id: z.union([z.string().min(1), z.number().int().positive()]).optional(),
    })
    .optional(),
});

export function parseProductForm(formData: FormData) {
  const price = Number(formData.get("price"));
  const compareRaw = String(formData.get("compare_at_price") ?? "").trim();

  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    category_id: formData.get("category_id") || null,
    price_cents: Number.isFinite(price) ? Math.round(price * 100) : 0,
    compare_at_price_cents: compareRaw
      ? Math.round(Number(compareRaw) * 100)
      : null,
    image_url: formData.get("image_url"),
    source_url: formData.get("source_url"),
    stock_status: formData.get("stock_status"),
    active: formData.get("active") === "on",
  });
}
