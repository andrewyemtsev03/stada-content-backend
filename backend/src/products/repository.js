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
        sections: {},
        purchaseLinks: [],
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

function mapPurchaseLinkRows(rows) {
  const linksByProductId = new Map();

  for (const row of rows) {
    if (!linksByProductId.has(row.product_id)) {
      linksByProductId.set(row.product_id, []);
    }

    linksByProductId.get(row.product_id).push({
      slot: row.slot,
      label: row.label,
      url: row.url,
      logoSrc: row.logo_src || "",
      logoAlt: row.logo_alt || row.label || "",
      sortOrder: row.sort_order,
    });
  }

  return linksByProductId;
}

function mapSectionRows(rows) {
  const sectionsByProductId = new Map();

  for (const row of rows) {
    if (!sectionsByProductId.has(row.product_id)) {
      sectionsByProductId.set(row.product_id, {});
    }

    const productSections = sectionsByProductId.get(row.product_id);
    productSections[row.language] ||= {};
    productSections[row.language][row.section_type] = row.content || {};
  }

  return sectionsByProductId;
}

async function attachProductSections(products) {
  if (!products.length) return products;
  const ids = products.map(product => product.id);
  const result = await query(`
    select
      product_id,
      language,
      section_type,
      content
    from product_sections
    where product_id = any($1::text[])
    order by product_id, language, sort_order, section_type
  `, [ids]);
  const sectionsByProductId = mapSectionRows(result.rows);

  products.forEach(product => {
    product.sections = sectionsByProductId.get(product.id) || {};
  });

  return products;
}

async function attachProductPurchaseLinks(products) {
  if (!products.length) return products;
  const ids = products.map(product => product.id);
  const result = await query(`
    select
      product_id,
      slot,
      label,
      url,
      logo_src,
      logo_alt,
      sort_order
    from product_purchase_links
    where product_id = any($1::text[])
    order by product_id, sort_order, slot
  `, [ids]);
  const linksByProductId = mapPurchaseLinkRows(result.rows);

  products.forEach(product => {
    product.purchaseLinks = linksByProductId.get(product.id) || [];
  });

  return products;
}

async function attachProductDetails(products) {
  await attachProductSections(products);
  await attachProductPurchaseLinks(products);
  return products;
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

  return attachProductDetails(mapProductRows(result.rows));
}

async function listTherapeuticAreas() {
  const result = await query(`
    select
      ta.id,
      ta.sort_order,
      tat.language,
      tat.name
    from therapeutic_areas ta
    left join therapeutic_area_translations tat on tat.area_id = ta.id
    order by ta.sort_order, ta.id, tat.language
  `);
  const areasById = new Map();

  for (const row of result.rows) {
    if (!areasById.has(row.id)) {
      areasById.set(row.id, {
        id: row.id,
        sortOrder: row.sort_order,
        translations: {},
      });
    }

    if (row.language) {
      areasById.get(row.id).translations[row.language] = {
        name: row.name,
      };
    }
  }

  return [...areasById.values()];
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

  const products = await attachProductDetails(mapProductRows(result.rows));
  return products[0] || null;
}

function hasSectionContent(content) {
  if (!content || typeof content !== "object" || Array.isArray(content)) return false;
  return Object.values(content).some(value => {
    if (Array.isArray(value)) return value.some(item => String(item || "").trim());
    return String(value ?? "").trim();
  });
}

function normalizePurchaseLinks(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((link, index) => {
      if (!link || typeof link !== "object" || Array.isArray(link)) return null;
      const label = String(link.label || "").trim();
      const url = String(link.url || "").trim();
      if (!label || !url) return null;
      return {
        slot: String(link.slot || label).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `link-${index + 1}`,
        label,
        url,
        logoSrc: String(link.logoSrc || link.logo_src || "").trim(),
        logoAlt: String(link.logoAlt || link.logo_alt || label).trim(),
        sortOrder: Number.isFinite(Number(link.sortOrder)) ? Number(link.sortOrder) : index,
      };
    })
    .filter(Boolean);
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

      if (Object.prototype.hasOwnProperty.call(product, "sections")) {
        await client.query("delete from product_sections where product_id = $1", [id]);
        for (const [language, sections] of Object.entries(product.sections || {})) {
          let sortOrder = 0;
          for (const [sectionType, content] of Object.entries(sections || {})) {
            if (!hasSectionContent(content)) continue;
            await client.query(`
              insert into product_sections (
                product_id,
                language,
                section_type,
                sort_order,
                content,
                updated_at
              )
              values ($1, $2, $3, $4, $5::jsonb, now())
            `, [
              id,
              language,
              sectionType,
              sortOrder,
              JSON.stringify(content || {}),
            ]);
            sortOrder += 1;
          }
        }
      }

      if (Object.prototype.hasOwnProperty.call(product, "purchaseLinks")) {
        await client.query("delete from product_purchase_links where product_id = $1", [id]);
        for (const link of normalizePurchaseLinks(product.purchaseLinks)) {
          await client.query(`
            insert into product_purchase_links (
              product_id,
              slot,
              label,
              url,
              logo_src,
              logo_alt,
              sort_order,
              updated_at
            )
            values ($1, $2, $3, $4, $5, $6, $7, now())
            on conflict (product_id, slot) do update set
              label = excluded.label,
              url = excluded.url,
              logo_src = excluded.logo_src,
              logo_alt = excluded.logo_alt,
              sort_order = excluded.sort_order,
              updated_at = now()
          `, [
            id,
            link.slot,
            link.label,
            link.url,
            link.logoSrc || null,
            link.logoAlt || link.label,
            link.sortOrder,
          ]);
        }
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
  listTherapeuticAreas,
  listProducts,
  upsertProduct,
  upsertTherapeuticArea,
};
