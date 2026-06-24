create table if not exists therapeutic_areas (
  id text primary key,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists therapeutic_area_translations (
  area_id text not null references therapeutic_areas(id) on delete cascade,
  language text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (area_id, language)
);

create table if not exists products (
  id text primary key,
  slug text not null unique,
  page_path text not null,
  status text not null default 'draft',
  sort_order integer not null default 0,
  therapeutic_area_id text references therapeutic_areas(id) on delete set null,
  accent_color text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists product_translations (
  product_id text not null references products(id) on delete cascade,
  language text not null,
  name text not null,
  short_description text,
  full_description text,
  composition text,
  usage_text text,
  benefits jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, language)
);

create table if not exists product_images (
  product_id text not null references products(id) on delete cascade,
  slot text not null,
  src text not null,
  cloudinary_public_id text,
  alt text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, slot)
);

create table if not exists product_sections (
  id bigserial primary key,
  product_id text not null references products(id) on delete cascade,
  language text not null,
  section_type text not null,
  sort_order integer not null default 0,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_status_sort on products(status, sort_order, slug);
create index if not exists idx_product_translations_language on product_translations(language);
create index if not exists idx_product_sections_product_language on product_sections(product_id, language, sort_order);
