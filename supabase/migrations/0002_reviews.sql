-- Evidence Reps — avaliações verificadas (onda 2)
-- Aplicar em: Supabase > SQL Editor > New query
-- Sem policies públicas: leitura/escrita apenas por service_role no servidor.

create table if not exists reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products(id) on delete cascade,
  order_id     uuid not null references orders(id) on delete cascade,
  customer_id  uuid references customers(id) on delete set null,
  author_name  text not null,
  rating       integer not null check (rating between 1 and 5),
  body         text not null check (char_length(trim(body)) between 10 and 1000),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz not null default now(),
  approved_at  timestamptz,
  unique (order_id, product_id)
);

create index if not exists reviews_product_status_idx
  on reviews (product_id, status, created_at desc);

alter table reviews enable row level security;
