create table if not exists content_overrides (
  country_id text not null,
  language text not null,
  page_path text not null,
  text jsonb not null default '{}'::jsonb,
  dom_text jsonb not null default '{}'::jsonb,
  dom_images jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (country_id, language, page_path),
  constraint content_overrides_text_object check (jsonb_typeof(text) = 'object'),
  constraint content_overrides_dom_text_object check (jsonb_typeof(dom_text) = 'object'),
  constraint content_overrides_dom_images_object check (jsonb_typeof(dom_images) = 'object'),
  constraint content_overrides_settings_object check (jsonb_typeof(settings) = 'object')
);

create index if not exists idx_content_overrides_country_page
  on content_overrides(country_id, page_path, language);

create table if not exists content_override_imports (
  source text primary key,
  imported_rows integer not null default 0,
  imported_at timestamptz not null default now()
);
