const { query, withClient } = require("../db/client");

function mapProductRows(rows) {
  const productsById = new Map();

  for (const row of rows) {
    if (!productsById.has(row.id)) {
      productsById.set(row.id, {
        id: row.id,
        slug: row.slug,
        pagePath: row.page_path,
        status: row.status,
        sortOrder: row.sort_order,
        therapeuticAreaId: row.therapeutic_area_id,
        accentColor: row.accent_color,
        isFeatured: row.is_featured,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        translations: {},
        images: {},
      });
    }

    const product = productsById.get(row.id);

    if (row.translation_language) {
      product.translations[row.translation_language] = {
        name: row.translation_name,
        shortDescription: row.short_description,
        fullDescription: row.full_description,
        composition: row.composition,
        usageText: row.usage_text,
        benefits: row.benefits || [],
      };
    }

    if (row.image_slot) {
      product.images[row.image_slot] = {
        src: row.image_src,
        cloudinaryPublicId: row.cloudinary_public_id,
        alt: row.image_alt || "",
      };
    }
  }

  return [...productsById.values()];
}

async function listProducts() {
  const result = await query(`
    select
      p.*,
      pt.language as translation_language,
      pt.name as translation_name,
      pt.short_description,
      pt.full_description,
      pt.composition,
      pt.usage_text,
      pt.benefits,
      pi.slot as image_slot,
      pi.src as image_src,
      pi.cloudinary_public_id,
      pi.alt as image_alt
    from products p
    left join product_translations pt on pt.product_id = p.id
    left join product_images pi on pi.product_id = p.id
    order by p.sort_order, p.slug, pt.language, pi.slot
  `);

  return mapProductRows(result.rows);
}

async function getProduct(slugOrId) {
  const result = await query(`
    select
      p.*,
      pt.language as translation_language,
      pt.name as translation_name,
      pt.short_description,
      pt.full_description,
      pt.composition,
      pt.usage_text,
      pt.benefits,
      pi.slot as image_slot,
      pi.src as image_src,
      pi.cloudinary_public_id,
      pi.alt as image_alt
    from products p
    left join product_translations pt on pt.product_id = p.id
    left join product_images pi on pi.product_id = p.id
    where p.id = $1 or p.slug = $1
    order by pt.language, pi.slot
  `, [slugOrId]);

  return mapProductRows(result.rows)[0] || null;
}

async function upsertProduct(product) {
  const id = await withClient(async client => {
    await client.query("begin");
    try {
      const id = product.id || product.slug;
      const slug = product.slug || id;

      await client.query(`
        insert into products (
          id,
          slug,
          page_path,
          status,
          sort_order,
          therapeutic_area_id,
          accent_color,
          is_featured,
          updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, now())
        on conflict (id) do update set
          slug = excluded.slug,
          page_path = excluded.page_path,
          status = excluded.status,
          sort_order = excluded.sort_order,
          therapeutic_area_id = excluded.therapeutic_area_id,
          accent_color = excluded.accent_color,
          is_featured = excluded.is_featured,
          updated_at = now()
      `, [
        id,
        slug,
        product.pagePath || `products/${slug}.html`,
        product.status || "draft",
        Number(product.sortOrder || 0),
        product.therapeuticAreaId || null,
        product.accentColor || null,
        Boolean(product.isFeatured),
      ]);

      for (const [language, translation] of Object.entries(product.translations || {})) {
        await client.query(`
          insert into product_translations (
            product_id,
            language,
            name,
            short_description,
            full_description,
            composition,
            usage_text,
            benefits,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, now())
          on conflict (product_id, language) do update set
            name = excluded.name,
            short_description = excluded.short_description,
            full_description = excluded.full_description,
            composition = excluded.composition,
            usage_text = excluded.usage_text,
            benefits = excluded.benefits,
            updated_at = now()
        `, [
          id,
          language,
          translation.name || slug,
          translation.shortDescription || null,
          translation.fullDescription || null,
          translation.composition || null,
          translation.usageText || null,
          JSON.stringify(translation.benefits || []),
        ]);
      }

      for (const [slot, image] of Object.entries(product.images || {})) {
        await client.query(`
          insert into product_images (
            product_id,
            slot,
            src,
            cloudinary_public_id,
            alt,
            updated_at
          )
          values ($1, $2, $3, $4, $5, now())
          on conflict (product_id, slot) do update set
            src = excluded.src,
            cloudinary_public_id = excluded.cloudinary_public_id,
            alt = excluded.alt,
            updated_at = now()
        `, [
          id,
          slot,
          image.src || "",
          image.cloudinaryPublicId || null,
          image.alt || "",
        ]);
      }

      await client.query("commit");
      return id;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });

  return getProduct(id);
}

async function deleteProduct(slugOrId) {
  const result = await query(`
    delete from products
    where id = $1 or slug = $1
    returning id
  `, [slugOrId]);

  return result.rowCount > 0;
}

async function upsertTherapeuticArea(area) {
  const id = area.id;
  if (!id) return null;

  return withClient(async client => {
    await client.query("begin");
    try {
      await client.query(`
        insert into therapeutic_areas (id, sort_order, updated_at)
        values ($1, $2, now())
        on conflict (id) do update set
          sort_order = excluded.sort_order,
          updated_at = now()
      `, [id, Number(area.sortOrder || 0)]);

      for (const [language, translation] of Object.entries(area.translations || {})) {
        await client.query(`
          insert into therapeutic_area_translations (area_id, language, name, updated_at)
          values ($1, $2, $3, now())
          on conflict (area_id, language) do update set
            name = excluded.name,
            updated_at = now()
        `, [id, language, translation.name || id]);
      }

      await client.query("commit");
      return { id };
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}

module.exports = {
  deleteProduct,
  getProduct,
  listProducts,
  upsertProduct,
  upsertTherapeuticArea,
};
