-- Evidence Reps — schema inicial (Fase 1)
-- Aplicar em: Supabase > SQL Editor > New query

create extension if not exists "pgcrypto";

create type order_status as enum (
  'pending_payment', 'paid', 'purchasing', 'purchased',
  'shipped', 'delivered', 'cancelled', 'refunded'
);

create type stock_status as enum ('available', 'low', 'out_of_stock');

create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text,
  sort_order  int default 0,
  active      boolean default true,
  created_at  timestamptz default now()
);

create table suppliers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  website_url     text,
  affiliate_param text,
  contact         text,
  active          boolean default true,
  created_at      timestamptz default now()
);

create table products (
  id                     uuid primary key default gen_random_uuid(),
  supplier_id            uuid references suppliers(id) on delete set null,
  category_id            uuid references categories(id) on delete set null,
  name                   text not null,
  slug                   text unique not null,
  description            text,
  specs                  jsonb default '{}'::jsonb,
  image_url              text,
  gallery                jsonb default '[]'::jsonb,
  price_cents            integer not null check (price_cents >= 0),
  compare_at_price_cents integer,
  source_url             text not null default 'https://example.com',
  sku                    text,
  stock_status           stock_status default 'available',
  last_checked_at        timestamptz,
  active                 boolean default true,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create table product_variants (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products(id) on delete cascade,
  name         text not null,
  price_cents  integer not null check (price_cents >= 0),
  sku          text,
  source_url   text,
  stock_status stock_status default 'available',
  position     int default 0
);

create table admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table customers (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  email      text not null,
  phone      text not null,
  address    jsonb not null,
  created_at timestamptz default now()
);

create table orders (
  id                uuid primary key default gen_random_uuid(),
  code              text unique not null,
  customer_id       uuid references customers(id) on delete restrict,
  status            order_status default 'pending_payment',
  subtotal_cents    integer not null,
  shipping_cents    integer not null default 0,
  discount_cents    integer not null default 0,
  total_cents       integer not null,
  payment_provider  text,
  payment_id        text,
  supplier_order_id text,
  tracking_code     text,
  cost_cents        integer,
  notes             text,
  paid_at           timestamptz,
  shipped_at        timestamptz,
  created_at        timestamptz default now()
);

create table order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete cascade,
  product_id          uuid references products(id) on delete set null,
  variant_id          uuid references product_variants(id) on delete set null,
  name_snapshot       text not null,
  image_snapshot      text,
  source_url_snapshot text,
  price_cents         integer not null,
  supplier_cost_cents integer,
  qty                 integer not null check (qty > 0)
);

create table payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid references orders(id) on delete cascade,
  provider            text not null,
  provider_payment_id text unique,
  status              text not null,
  amount_cents        integer not null,
  payload             jsonb,
  created_at          timestamptz default now()
);

create table webhook_events (
  id           uuid primary key default gen_random_uuid(),
  provider     text not null,
  event_id     text not null,
  payload      jsonb,
  processed_at timestamptz,
  unique (provider, event_id)
);

create table settings (
  key   text primary key,
  value jsonb not null
);

insert into settings (key, value) values
  ('free_shipping_threshold_cents', '29900'::jsonb),
  ('flat_shipping_cents', '1990'::jsonb),
  ('max_installments', '6'::jsonb),
  ('store_name', '"Evidence Reps"'::jsonb),
  ('announcement_banner', '"Every rep backed by evidence. Frete grátis acima de R$ 299."'::jsonb)
on conflict (key) do nothing;

-- Row Level Security -------------------------------------------------------
alter table categories       enable row level security;
alter table products         enable row level security;
alter table product_variants enable row level security;
alter table admins           enable row level security;
alter table customers   enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;
alter table payments    enable row level security;
alter table settings    enable row level security;
alter table suppliers   enable row level security;

create policy "categorias publicas" on categories for select using (active = true);
create policy "produtos publicos" on products for select using (active = true);
create policy "variantes publicas" on product_variants for select using (
  exists (
    select 1 from products p
    where p.id = product_id and p.active = true
  )
);

-- Demais tabelas: sem policy publica. Acesso somente via service_role no servidor.

-- Storage ------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "imagens publicas" on storage.objects for select
using (bucket_id = 'product-images');
