const { runMigrations } = require("../db/migrate");
const { getPagePayload } = require("../content-loader");
const { upsertProduct, upsertTherapeuticArea } = require("./repository");

const detailImageSlots = {
  image_002: "detailHero",
  image_003: "formulaCenter",
  image_004: "formulaPointActive",
  image_005: "formulaPointSeawater",
  image_006: "formulaPointFormat",
};

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

function productDomBase(productId) {
  return String(productId || "").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
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

function getPayloadText(payload, key) {
  return payload?.content?.text?.[key] || "";
}

function getPayloadDomText(payload, id) {
  return (payload?.content?.dom?.text || []).find(item => item.id === id)?.value || "";
}

function getPayloadDomImage(payload, id) {
  return (payload?.content?.dom?.images || []).find(item => item.id === id) || null;
}

function getPayloadTextKeysInOrder(payload) {
  const keys = [];
  for (const section of payload.content?.sections || []) {
    for (const item of section.translatedTexts || []) {
      if (item?.key && !keys.includes(item.key)) keys.push(item.key);
    }
  }

  for (const key of Object.keys(payload.content?.text || {})) {
    if (!keys.includes(key)) keys.push(key);
  }
  return keys;
}

function findProductKeyPrefix(payload, productId) {
  const preferredPrefix = `product_${productDomBase(productId)}`;
  if (Object.prototype.hasOwnProperty.call(payload.content?.text || {}, `${preferredPrefix}_page_title`)) {
    return preferredPrefix;
  }

  const match = Object.keys(payload.content?.text || {})
    .map(key => key.match(/^(product_.+)_page_title$/))
    .find(Boolean);
  return match ? match[1] : preferredPrefix;
}

function collectBenefitsFromPayload(payload, keyPrefix) {
  return Object.keys(payload?.content?.text || {})
    .filter(key => key.startsWith(`${keyPrefix}_benefit`))
    .sort((left, right) => Number(left.match(/(\d+)$/)?.[1] || 0) - Number(right.match(/(\d+)$/)?.[1] || 0))
    .map(key => getPayloadText(payload, key))
    .filter(Boolean);
}

function collectTextValuesByPrefix(text, orderedKeys, prefix) {
  return orderedKeys
    .filter(key => key.startsWith(prefix))
    .map(key => text[key])
    .filter(Boolean);
}

function collectPairedItems(text, orderedKeys, pattern, values = []) {
  const items = new Map();
  orderedKeys.forEach(key => {
    const value = text[key];
    const match = key.match(pattern);
    if (!match || !String(value || "").trim()) return;
    const [, id, field] = match;
    items.set(id, {
      ...(items.get(id) || {}),
      [field === "title" ? "title" : "text"]: value,
    });
  });

  return [...items.values()]
    .map((item, index) => ({
      value: values[index] || "",
      title: item.title || "",
      text: item.text || "",
    }))
    .filter(item => item.value || item.title || item.text);
}

function collectMetricItems(text, orderedKeys, keyPrefix, payload, domBase) {
  return orderedKeys
    .filter(key => key.startsWith(`${keyPrefix}_metric_`))
    .map((key, index) => ({
      value: getPayloadDomText(payload, `products_${domBase}_text_${String(index + 2).padStart(3, "0")}`),
      title: text[key] || "",
      text: "",
    }))
    .filter(item => item.value || item.title);
}

function collectFormulaItems(text, orderedKeys, keyPrefix, payload, domBase) {
  const items = collectPairedItems(
    text,
    orderedKeys,
    new RegExp(`^${keyPrefix}_formula_(.+)_(title|text)$`)
  );

  return items.map((item, index) => {
    const image = getPayloadDomImage(payload, `products_${domBase}_image_${String(index + 4).padStart(3, "0")}`);
    return {
      ...item,
      imageSrc: normalizeProductImageSrc(image?.src || image?.url || ""),
      imageAlt: image?.alt || "",
    };
  });
}

function collectUsageItems(text, orderedKeys, keyPrefix) {
  return collectPairedItems(
    text,
    orderedKeys,
    new RegExp(`^${keyPrefix}_usage_(.+)_(title|text)$`)
  ).map(item => ({
    className: "",
    title: item.title,
    text: item.text,
    isActive: false,
  }));
}

function parseProductDetailContent(productId, payload) {
  const keyPrefix = findProductKeyPrefix(payload, productId);
  const domBase = productDomBase(productId);
  const text = payload.content?.text || {};
  const orderedKeys = getPayloadTextKeysInOrder(payload);

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
        badges: collectTextValuesByPrefix(text, orderedKeys, `${keyPrefix}_badge_`),
        metrics: collectMetricItems(text, orderedKeys, keyPrefix, payload, domBase),
      },
      overview: {
        label: getPayloadText(payload, `${keyPrefix}_overview_label`) || "",
        heading: getPayloadText(payload, `${keyPrefix}_overview_heading`) || "",
        intro: getPayloadText(payload, `${keyPrefix}_overview_intro`) || "",
        facts: collectPairedItems(
          text,
          orderedKeys,
          new RegExp(`^${keyPrefix}_card_(.+)_(title|text)$`),
          [5, 6, 7, 8].map(number => getPayloadDomText(payload, `products_${domBase}_text_${String(number).padStart(3, "0")}`))
        ),
      },
      formula: {
        label: getPayloadText(payload, `${keyPrefix}_formula_label`) || "",
        heading: getPayloadText(payload, `${keyPrefix}_formula_heading`) || "",
        intro: getPayloadText(payload, `${keyPrefix}_formula_intro`) || "",
        image: getPayloadDomImage(payload, `products_${domBase}_image_003`)?.url
          || getPayloadDomImage(payload, `products_${domBase}_image_003`)?.src
          || "",
        points: collectFormulaItems(text, orderedKeys, keyPrefix, payload, domBase),
      },
      usage: {
        label: getPayloadText(payload, `${keyPrefix}_usage_label`) || "",
        heading: getPayloadText(payload, `${keyPrefix}_usage_heading`) || "",
        items: collectUsageItems(text, orderedKeys, keyPrefix),
      },
      note: {
        title: getPayloadText(payload, `${keyPrefix}_note_title`) || "",
        text: getPayloadText(payload, `${keyPrefix}_note_text`) || "",
      },
      buy: {
        intro: getPayloadText(payload, `${keyPrefix}_buy_intro`) || "",
      },
    },
  };
}

function parseProductPurchaseLinks(payload) {
  return Array.isArray(payload.content?.purchaseLinks) ? payload.content.purchaseLinks : [];
}

function parseProductDetailImages(productId, payload) {
  const domBase = productDomBase(productId);
  const images = {};

  for (const [imageIdSuffix, slot] of Object.entries(detailImageSlots)) {
    const image = getPayloadDomImage(payload, `products_${domBase}_${imageIdSuffix}`);
    const sourceSrc = normalizeProductImageSrc(image?.src || image?.url || "");
    if (!sourceSrc) continue;
    images[slot] = {
      src: sourceSrc,
      alt: image?.alt || "",
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
    const detailImages = parseProductDetailImages(product.id, ruDetailPayload);
    const ruDetail = parseProductDetailContent(product.id, ruDetailPayload);
    const kzDetail = parseProductDetailContent(product.id, kzDetailPayload);

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
      purchaseLinks: parseProductPurchaseLinks(ruDetailPayload),
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
