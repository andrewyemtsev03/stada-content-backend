const { runMigrations } = require("../src/db/migrate");
const { getPagePayload } = require("../src/content-loader");
const { upsertProduct, upsertTherapeuticArea } = require("../src/products/repository");

function normalizeAreaId(value) {
  const firstToken = String(value || "").split(/\s+/).find(Boolean) || "general";
  return firstToken
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "general";
}

function productMapById(products) {
  return new Map((products || []).map(product => [product.id, product]));
}

function makeTranslation(product) {
  if (!product) return null;
  return {
    name: product.name || product.id,
    shortDescription: "",
    benefits: [],
  };
}

async function importProducts() {
  await runMigrations();

  const ruPayload = getPagePayload({
    country: "kazakhstan",
    lang: "ru",
    page: "index.html",
    applyOverrides: false,
  });
  const kzPayload = getPagePayload({
    country: "kazakhstan",
    lang: "kz",
    page: "index.html",
    applyOverrides: false,
  });

  const ruProducts = ruPayload.content?.productCatalog || [];
  const kzById = productMapById(kzPayload.content?.productCatalog || []);
  const featuredIds = new Set(ruPayload.content?.settings?.homeProducts || []);
  const areas = new Map();

  ruProducts.forEach((product, index) => {
    const areaId = normalizeAreaId(product.category);
    const kzProduct = kzById.get(product.id);
    if (!areas.has(areaId)) {
      areas.set(areaId, {
        id: areaId,
        sortOrder: areas.size + 1,
        translations: {
          ru: { name: product.therapeuticArea || areaId },
          kz: { name: kzProduct?.therapeuticArea || product.therapeuticArea || areaId },
        },
      });
    }
  });

  for (const area of areas.values()) {
    await upsertTherapeuticArea(area);
  }

  let imported = 0;
  for (const [index, product] of ruProducts.entries()) {
    const kzProduct = kzById.get(product.id);
    const areaId = normalizeAreaId(product.category);
    await upsertProduct({
      id: product.id,
      slug: product.id,
      pagePath: product.href || `products/${product.id}.html`,
      status: "published",
      sortOrder: index + 1,
      therapeuticAreaId: areaId,
      accentColor: product.accent || null,
      isFeatured: featuredIds.has(product.id),
      translations: {
        ru: makeTranslation(product),
        kz: makeTranslation(kzProduct || product),
      },
      images: {
        card: {
          src: product.image?.src || product.image?.url || "",
          alt: product.image?.alt || product.name || product.id,
          cloudinaryPublicId: product.image?.id || null,
        },
      },
    });
    imported += 1;
  }

  return {
    products: imported,
    areas: areas.size,
  };
}

importProducts()
  .then(result => {
    console.log(`Imported ${result.products} products and ${result.areas} therapeutic areas.`);
    process.exit(0);
  })
  .catch(error => {
    console.error("Product import failed.");
    console.error(error);
    process.exit(1);
  });
