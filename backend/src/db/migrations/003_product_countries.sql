alter table products
  add column if not exists country_id text not null default 'kazakhstan';

alter table products
  drop constraint if exists products_slug_key;

create unique index if not exists idx_products_country_slug
  on products(country_id, slug);

create index if not exists idx_products_country_status_sort
  on products(country_id, status, sort_order, slug);
