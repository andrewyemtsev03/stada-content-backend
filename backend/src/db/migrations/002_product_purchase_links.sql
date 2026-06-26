create table if not exists product_purchase_links (
  id bigserial primary key,
  product_id text not null references products(id) on delete cascade,
  slot text not null,
  label text not null,
  url text not null,
  logo_src text,
  logo_alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, slot)
);

create index if not exists idx_product_purchase_links_product_sort
  on product_purchase_links(product_id, sort_order, slot);
