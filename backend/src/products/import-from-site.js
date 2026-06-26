const { runMigrations } = require("../db/migrate");
const fs = require("node:fs");
const path = require("node:path");
const { getPagePayload } = require("../content-loader");
const { upsertProduct, upsertTherapeuticArea } = require("./repository");

const contentRoot = path.resolve(__dirname, "..", "..", "content", "main");

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

function cloudinaryPublicIdFromUrl(value) {
  const match = String(value || "").match(/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+(?:[?#].*)?$/i);
  return match ? match[1] : null;
}

function makeTranslation(product) {
  if (!product) return null;
  return {
    name: product.name || product.id,
    shortDescription: product.shortDescription || "",
    benefits: [],
  };
}

function getAttributeValue(source, name) {
  const match = String(source || "").match(new RegExp(`\\s${name}=["']([^"']*)["']`, "i"));
  return match ? match[1].trim() : "";
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function parseProductPurchaseLinks(pagePath) {
  const normalizedPagePath = String(pagePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalizedPagePath || normalizedPagePath.endsWith("/index.html") || normalizedPagePath === "products/index.html") return [];

  const filePath = path.resolve(contentRoot, normalizedPagePath);
  const relativePath = path.relative(contentRoot, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath) || !fs.existsSync(filePath)) return [];

  const html = fs.readFileSync(filePath, "utf8");
  const links = [];
  const partnerPattern = /<a\b[^>]*class=["'][^"']*\bpartner-card\b[^"']*["'][^>]*>[\s\S]*?<\/a>/gi;
  const cards = html.match(partnerPattern) || [];

  cards.forEach((card, index) => {
    const url = getAttributeValue(card, "href");
    const imageMatch = card.match(/<img\b[^>]*>/i);
    const imageTag = imageMatch ? imageMatch[0] : "";
    const labelMatch = card.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    const label = stripTags(labelMatch ? labelMatch[1] : getAttributeValue(imageTag, "alt"));
    if (!url || !label) return;

    links.push({
      slot: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `partner-${index + 1}`,
      label,
      url,
      logoSrc: getAttributeValue(imageTag, "src").replace(/^\.\.\//, ""),
      logoAlt: getAttributeValue(imageTag, "alt") || label,
      sortOrder: index,
    });
  });

  return links;
}

async function importProductsFromSite() {
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

  ruProducts.forEach(product => {
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
          src: product.image?.url || product.image?.src || "",
          alt: product.image?.alt || product.name || product.id,
          cloudinaryPublicId: cloudinaryPublicIdFromUrl(product.image?.url || product.image?.src),
        },
      },
      purchaseLinks: parseProductPurchaseLinks(product.href || `products/${product.id}.html`),
    });
    imported += 1;
  }

  return {
    products: imported,
    areas: areas.size,
  };
}

module.exports = {
  importProductsFromSite,
};
