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

function normalizeProductImageSrc(value) {
  return String(value || "").trim().replace(/\\/g, "/").replace(/^(\.\/|\.\.\/)+/, "");
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

function getPayloadText(payload, key) {
  return payload?.content?.text?.[key] || "";
}

function getPayloadDomText(payload, id) {
  return (payload?.content?.dom?.text || []).find(item => item.id === id)?.value || "";
}

function getSnippetText(snippet, payload) {
  const i18nKey = getAttributeValue(snippet, "data-i18n-key");
  if (i18nKey) return getPayloadText(payload, i18nKey);

  const backendTextId = getAttributeValue(snippet, "data-backend-text-id");
  if (backendTextId) return getPayloadDomText(payload, backendTextId) || stripTags(snippet);

  return stripTags(snippet);
}

function findFirstTag(source, tagName) {
  return String(source || "").match(new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, "i"))?.[0] || "";
}

function findTaggedBlocksByClass(source, tagName, className) {
  const escapedClass = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<${tagName}\\b(?=[^>]*class=["'][^"']*\\b${escapedClass}\\b)[^>]*>[\\s\\S]*?<\\/${tagName}>`, "gi");
  return String(source || "").match(pattern) || [];
}

function findTaggedBlocks(source, tagName) {
  return String(source || "").match(new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, "gi")) || [];
}

function findFirstTaggedBlockByClass(source, tagName, className) {
  return findTaggedBlocksByClass(source, tagName, className)[0] || "";
}

function getKeyPrefixFromDetailHtml(html, productId) {
  const heading = findFirstTag(findFirstTaggedBlockByClass(html, "div", "product-hero-text"), "h1");
  const key = getAttributeValue(heading, "data-i18n-key");
  if (key.endsWith("_page_title")) return key.replace(/_page_title$/, "");
  return `product_${String(productId || "").replace(/-/g, "_")}`;
}

function collectBenefitsFromPayload(payload, keyPrefix) {
  return Object.keys(payload?.content?.text || {})
    .filter(key => key.startsWith(`${keyPrefix}_benefit`))
    .sort((left, right) => Number(left.match(/(\d+)$/)?.[1] || 0) - Number(right.match(/(\d+)$/)?.[1] || 0))
    .map(key => getPayloadText(payload, key))
    .filter(Boolean);
}

function parseHeroOptions(html) {
  const heroText = findFirstTaggedBlockByClass(html, "div", "product-hero-text");
  return {
    hasKicker: /\bproduct-kicker\b/.test(heroText),
    hasActions: /\bproduct-hero-actions\b/.test(heroText),
    hasBadges: /\bproduct-badges\b/.test(heroText),
  };
}

function parseHeroBadges(html, payload) {
  const badgesBlock = findFirstTaggedBlockByClass(html, "div", "product-badges");
  return findTaggedBlocks(badgesBlock, "span")
    .map(item => getSnippetText(item, payload))
    .filter(Boolean);
}

function parseMetricItems(html, payload) {
  return findTaggedBlocksByClass(html, "div", "product-hero-metric")
    .map(block => ({
      value: getSnippetText(findFirstTag(block, "strong"), payload),
      title: getSnippetText(findFirstTag(block, "span"), payload),
      text: "",
    }))
    .filter(item => item.value || item.title);
}

function parseFactItems(html, payload) {
  return findTaggedBlocksByClass(html, "article", "product-fact-card")
    .map(block => ({
      value: getSnippetText(findFirstTag(block, "span"), payload),
      title: getSnippetText(findFirstTag(block, "h3"), payload),
      text: getSnippetText(findFirstTag(block, "p"), payload),
    }))
    .filter(item => item.value || item.title || item.text);
}

function parseFormulaItems(html, payload) {
  return findTaggedBlocksByClass(html, "article", "snup-formula-point")
    .map(block => {
      const image = findFirstTag(block, "img");
      return {
        className: getAttributeValue(block, "class"),
        value: getSnippetText(findFirstTag(block, "span"), payload),
        title: getSnippetText(findFirstTag(block, "h3"), payload),
        text: getSnippetText(findFirstTag(block, "p"), payload),
        imageSrc: normalizeProductImageSrc(getAttributeValue(image, "src")),
        imageAlt: getAttributeValue(image, "alt"),
      };
    })
    .filter(item => item.value || item.title || item.text || item.imageSrc);
}

function parseUsageItems(html, payload) {
  return findTaggedBlocksByClass(html, "article", "usage-item")
    .map((block, index) => ({
      className: getAttributeValue(block, "class"),
      title: getSnippetText(findFirstTag(block, "h3"), payload),
      text: getSnippetText(findFirstTag(block, "p"), payload),
      isActive: index === 0 || /\bis-active\b/.test(getAttributeValue(block, "class")),
    }))
    .filter(item => item.title || item.text);
}

function parseProductLayout(html) {
  const bodyTag = String(html || "").match(/<body\b[^>]*>/i)?.[0] || "";
  const formulaLayout = findFirstTaggedBlockByClass(html, "div", "product-formula-layout");
  const formulaSystem = findFirstTaggedBlockByClass(html, "div", "snup-formula-system");
  const formulaLines = String(html || "").match(/<svg\b(?=[^>]*class=["'][^"']*\bsnup-formula-lines\b)[^>]*>/i)?.[0] || "";
  const formulaLine = String(html || "").match(/<path\b(?=[^>]*class=["'][^"']*\bsnup-formula-line\b)[^>]*>/i)?.[0] || "";
  const formulaDot = String(html || "").match(/<circle\b(?=[^>]*class=["'][^"']*\bsnup-formula-dot\b)[^>]*>/i)?.[0] || "";

  return {
    bodyClasses: getAttributeValue(bodyTag, "class").split(/\s+/).filter(Boolean),
    formulaLayoutClassName: getAttributeValue(formulaLayout, "class"),
    formulaSystemClassName: getAttributeValue(formulaSystem, "class"),
    formulaLinesClassName: getAttributeValue(formulaLines, "class"),
    formulaLineClassName: getAttributeValue(formulaLine, "class"),
    formulaDotClassName: getAttributeValue(formulaDot, "class"),
  };
}

function parseProductDetailContent(pagePath, productId, payload) {
  const normalizedPagePath = String(pagePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
  const filePath = path.resolve(contentRoot, normalizedPagePath);
  const relativePath = path.relative(contentRoot, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath) || !fs.existsSync(filePath)) return null;

  const html = fs.readFileSync(filePath, "utf8");
  const keyPrefix = getKeyPrefixFromDetailHtml(html, productId);

  return {
    translation: {
      name: getPayloadText(payload, `${keyPrefix}_page_title`) || getPayloadText(payload, `${keyPrefix}_name`) || productId,
      shortDescription: getPayloadText(payload, `${keyPrefix}_page_desc`) || "",
      fullDescription: getPayloadText(payload, `${keyPrefix}_page_desc`) || "",
      composition: getPayloadText(payload, `${keyPrefix}_formula_intro`) || "",
      usageText: getPayloadText(payload, `${keyPrefix}_note_text`) || "",
      benefits: collectBenefitsFromPayload(payload, keyPrefix),
    },
    sections: {
      hero: {
        kicker: getPayloadText(payload, `${keyPrefix}_kicker`) || "",
        lead: getPayloadText(payload, `${keyPrefix}_page_desc`) || "",
        options: parseHeroOptions(html),
        badges: parseHeroBadges(html, payload),
        metrics: parseMetricItems(html, payload),
      },
      overview: {
        label: getPayloadText(payload, `${keyPrefix}_overview_label`) || "",
        heading: getPayloadText(payload, `${keyPrefix}_overview_heading`) || "",
        intro: getPayloadText(payload, `${keyPrefix}_overview_intro`) || "",
        facts: parseFactItems(html, payload),
      },
      formula: {
        label: getPayloadText(payload, `${keyPrefix}_formula_label`) || "",
        heading: getPayloadText(payload, `${keyPrefix}_formula_heading`) || "",
        intro: getPayloadText(payload, `${keyPrefix}_formula_intro`) || "",
        points: parseFormulaItems(html, payload),
      },
      usage: {
        label: getPayloadText(payload, `${keyPrefix}_usage_label`) || "",
        heading: getPayloadText(payload, `${keyPrefix}_usage_heading`) || "",
        items: parseUsageItems(html, payload),
      },
      note: {
        title: getPayloadText(payload, `${keyPrefix}_note_title`) || "",
        text: getPayloadText(payload, `${keyPrefix}_note_text`) || "",
      },
      buy: {
        intro: getPayloadText(payload, `${keyPrefix}_buy_intro`) || "",
      },
      layout: parseProductLayout(html),
    },
  };
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

function parseProductDetailImages(pagePath, productId) {
  const normalizedPagePath = String(pagePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalizedPagePath || normalizedPagePath.endsWith("/index.html") || normalizedPagePath === "products/index.html") return {};

  const filePath = path.resolve(contentRoot, normalizedPagePath);
  const relativePath = path.relative(contentRoot, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath) || !fs.existsSync(filePath)) return {};

  const html = fs.readFileSync(filePath, "utf8");
  const imageSlots = {
    image_002: "detailHero",
    image_003: "formulaCenter",
    image_004: "formulaPointActive",
    image_005: "formulaPointSeawater",
    image_006: "formulaPointFormat",
  };
  const images = {};

  for (const [imageIdSuffix, slot] of Object.entries(imageSlots)) {
    const pattern = new RegExp(`<img\\b[^>]*data-backend-image-id=["']products_${productId.replace(/[^a-z0-9]+/gi, "_")}_${imageIdSuffix}["'][^>]*>`, "i");
    const imageTag = html.match(pattern)?.[0] || "";
    const sourceSrc = normalizeProductImageSrc(getAttributeValue(imageTag, "src"));
    if (!sourceSrc) continue;
    images[slot] = {
      src: sourceSrc,
      alt: getAttributeValue(imageTag, "alt") || "",
      cloudinaryPublicId: cloudinaryPublicIdFromUrl(sourceSrc),
    };
  }

  return images;
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
    const pagePath = product.href || `products/${product.id}.html`;
    const detailImages = parseProductDetailImages(pagePath, product.id);
    const ruDetailPayload = getPagePayload({
      country: "kazakhstan",
      lang: "ru",
      page: pagePath,
      applyOverrides: false,
    });
    const kzDetailPayload = getPagePayload({
      country: "kazakhstan",
      lang: "kz",
      page: pagePath,
      applyOverrides: false,
    });
    const ruDetail = parseProductDetailContent(pagePath, product.id, ruDetailPayload);
    const kzDetail = parseProductDetailContent(pagePath, product.id, kzDetailPayload);

    await upsertProduct({
      id: product.id,
      slug: product.id,
      pagePath,
      status: "published",
      sortOrder: index + 1,
      therapeuticAreaId: areaId,
      accentColor: product.accent || null,
      isFeatured: featuredIds.has(product.id),
      translations: {
        ru: ruDetail?.translation || makeTranslation(product),
        kz: kzDetail?.translation || makeTranslation(kzProduct || product),
      },
      images: {
        card: {
          src: product.image?.url || product.image?.src || "",
          alt: product.image?.alt || product.name || product.id,
          cloudinaryPublicId: cloudinaryPublicIdFromUrl(product.image?.url || product.image?.src),
        },
        ...detailImages,
      },
      sections: {
        ru: ruDetail?.sections || {},
        kz: kzDetail?.sections || {},
      },
      purchaseLinks: parseProductPurchaseLinks(pagePath),
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
