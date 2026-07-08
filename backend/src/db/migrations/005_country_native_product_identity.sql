alter table product_translations
  add column if not exists product_country_id text;

alter table product_images
  add column if not exists product_country_id text;

alter table product_sections
  add column if not exists product_country_id text;

alter table product_purchase_links
  add column if not exists product_country_id text;

update product_translations pt
set product_country_id = p.country_id
from products p
where pt.product_country_id is null
  and pt.product_id = p.id;

update product_images pi
set product_country_id = p.country_id
from products p
where pi.product_country_id is null
  and pi.product_id = p.id;

update product_sections ps
set product_country_id = p.country_id
from products p
where ps.product_country_id is null
  and ps.product_id = p.id;

update product_purchase_links ppl
set product_country_id = p.country_id
from products p
where ppl.product_country_id is null
  and ppl.product_id = p.id;

update product_translations
set product_country_id = 'kazakhstan'
where product_country_id is null;

update product_images
set product_country_id = 'kazakhstan'
where product_country_id is null;

update product_sections
set product_country_id = 'kazakhstan'
where product_country_id is null;

update product_purchase_links
set product_country_id = 'kazakhstan'
where product_country_id is null;

alter table product_translations
  alter column product_country_id set not null;

alter table product_images
  alter column product_country_id set not null;

alter table product_sections
  alter column product_country_id set not null;

alter table product_purchase_links
  alter column product_country_id set not null;

alter table product_translations
  drop constraint if exists product_translations_product_fkey,
  drop constraint if exists product_translations_product_id_fkey,
  drop constraint if exists product_translations_pkey;

alter table product_images
  drop constraint if exists product_images_product_fkey,
  drop constraint if exists product_images_product_id_fkey,
  drop constraint if exists product_images_pkey;

alter table product_sections
  drop constraint if exists product_sections_product_fkey,
  drop constraint if exists product_sections_product_id_fkey;

alter table product_purchase_links
  drop constraint if exists product_purchase_links_product_fkey,
  drop constraint if exists product_purchase_links_product_slot_key,
  drop constraint if exists product_purchase_links_product_id_fkey,
  drop constraint if exists product_purchase_links_product_id_slot_key;

alter table products
  drop constraint if exists products_pkey;

update products
set id = substring(id from char_length(country_id) + 2)
where country_id <> 'kazakhstan'
  and id like country_id || '-%';

update products p
set slug = substring(slug from char_length(country_id) + 2)
where country_id <> 'kazakhstan'
  and slug like country_id || '-%'
  and not exists (
    select 1
    from products existing
    where existing.country_id = p.country_id
      and existing.slug = substring(p.slug from char_length(p.country_id) + 2)
      and existing.id <> p.id
  );

update product_translations
set product_id = substring(product_id from char_length(product_country_id) + 2)
where product_country_id <> 'kazakhstan'
  and product_id like product_country_id || '-%';

update product_images
set product_id = substring(product_id from char_length(product_country_id) + 2)
where product_country_id <> 'kazakhstan'
  and product_id like product_country_id || '-%';

update product_sections
set product_id = substring(product_id from char_length(product_country_id) + 2)
where product_country_id <> 'kazakhstan'
  and product_id like product_country_id || '-%';

update product_purchase_links
set product_id = substring(product_id from char_length(product_country_id) + 2)
where product_country_id <> 'kazakhstan'
  and product_id like product_country_id || '-%';

alter table products
  add constraint products_pkey primary key (country_id, id);

alter table product_translations
  add constraint product_translations_pkey primary key (product_country_id, product_id, language),
  add constraint product_translations_product_fkey
    foreign key (product_country_id, product_id)
    references products(country_id, id)
    on delete cascade;

alter table product_images
  add constraint product_images_pkey primary key (product_country_id, product_id, slot),
  add constraint product_images_product_fkey
    foreign key (product_country_id, product_id)
    references products(country_id, id)
    on delete cascade;

alter table product_sections
  add constraint product_sections_product_fkey
    foreign key (product_country_id, product_id)
    references products(country_id, id)
    on delete cascade;

alter table product_purchase_links
  add constraint product_purchase_links_product_slot_key unique (product_country_id, product_id, slot),
  add constraint product_purchase_links_product_fkey
    foreign key (product_country_id, product_id)
    references products(country_id, id)
    on delete cascade;

create index if not exists idx_product_translations_product_country_language
  on product_translations(product_country_id, product_id, language);

create index if not exists idx_product_images_product_country_slot
  on product_images(product_country_id, product_id, slot);

create index if not exists idx_product_sections_product_country_language
  on product_sections(product_country_id, product_id, language, sort_order);

create index if not exists idx_product_purchase_links_country_product_sort
  on product_purchase_links(product_country_id, product_id, sort_order, slot);
