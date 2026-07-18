const {
  getCanonicalProductImageFromSlots,
  normalizeExternalLink,
  normalizeImageSource,
  normalizeProductSlug,
  productLanguages,
} = require("./validation");

function localizedProductFallbacks(product, language) {
  const requestedLanguage = String(language || "").trim().toLowerCase();
  if (requestedLanguage === "az") {
    return [product?.translations?.az, product?.translations?.ru, product?.translations?.en, product?.translations?.kz, product?.translations?.kg, product?.translations?.ge];
  }
  if (requestedLanguage === "ro") {
    return [product?.translations?.ro, product?.translations?.ru, product?.translations?.en, product?.translations?.az, product?.translations?.kz, product?.translations?.kg, product?.translations?.ge];
  }
  if (requestedLanguage === "kg") {
    return [product?.translations?.kg, product?.translations?.ru, product?.translations?.en];
  }
  if (requestedLanguage === "ge") {
    return [product?.translations?.ge, product?.translations?.en, product?.translations?.ru, product?.translations?.kz, product?.translations?.kg];
  }
  if (requestedLanguage === "en") {
    return [product?.translations?.en, product?.translations?.ge, product?.translations?.ru, product?.translations?.kz, product?.translations?.kg];
  }
  return productLanguages.map(candidateLanguage => product?.translations?.[candidateLanguage]);
}

function contentProductFromDatabaseProduct(product, language = "ru", areaLabels = new Map()) {
  const translation = localizedProductFallbacks(product, language).find(Boolean) || {};
  const cardImage = getCanonicalProductImageFromSlots(product.images || {});
  const cardImageSrc = normalizeImageSource(cardImage.src);
  const category = product.therapeuticAreaId || "";
  const therapeuticArea = getTherapeuticAreaLabel(category, language, areaLabels);

  return {
    id: product.id,
    slug: product.slug || product.id,
    href: `products/product.html?slug=${encodeURIComponent(product.slug || product.id)}`,
    category,
    categoryClass: category,
    accent: product.accentColor || "",
    image: {
      id: cardImage.cloudinaryPublicId || "",
      src: cardImageSrc,
      url: cardImageSrc,
      alt: cardImage.alt || translation.name || product.id,
    },
    name: translation.name || product.id,
    shortDescription: translation.shortDescription || "",
    therapeuticArea,
  };
}

function coerceProductTextList(...values) {
  const list = [];
  for (const value of values) {
    if (Array.isArray(value)) {
      value.forEach(item => {
        const text = String(item || "").trim();
        if (text) list.push(text);
      });
      continue;
    }
    String(value || "")
      .split(/\r?\n|;/)
      .map(item => item.trim())
      .filter(Boolean)
      .forEach(item => list.push(item));
  }
  return [...new Set(list)];
}

function coerceProductObjectList(value, fallback = []) {
  const source = Array.isArray(value) && value.length ? value : fallback;
  return source
    .map(item => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const title = String(item.title || item.label || item.heading || "").trim();
      const text = String(item.text || item.description || item.body || "").trim();
      const value = String(item.value || item.metric || item.icon || "").trim();
      const imageSrc = String(item.imageSrc || item.image_src || item.src || "").trim();
      const imageAlt = String(item.imageAlt || item.image_alt || item.alt || "").trim();
      const className = String(item.className || item.class_name || "").trim();
      const isActive = Boolean(item.isActive || item.is_active);
      if (!title && !text && !value && !imageSrc) return null;
      return { value, title, text, imageSrc, imageAlt, className, isActive };
    })
    .filter(Boolean);
}

function makeDefaultProductPurchaseLinks(productName = "") {
  const labelPrefix = productName ? `${productName} - ` : "";
  return [
    {
      slot: "kaspi",
      label: "KASPI",
      url: "https://kaspi.kz/shop/",
      logoSrc: "assets/logos/logo_kaspi.png",
      logoAlt: "KASPI",
      ariaLabel: `${labelPrefix}KASPI`,
      sortOrder: 0,
    },
    {
      slot: "biosfera",
      label: "Биосфера",
      url: "https://biosfera.kz/",
      logoSrc: "assets/logos/logo_biosfera.png",
      logoAlt: "Биосфера",
      ariaLabel: `${labelPrefix}Биосфера`,
      sortOrder: 1,
    },
    {
      slot: "europharma",
      label: "Europharma",
      url: "https://europharma.kz/",
      logoSrc: "assets/logos/logo_europharma.png",
      logoAlt: "Europharma",
      ariaLabel: `${labelPrefix}Europharma`,
      sortOrder: 2,
    },
    {
      slot: "aptekaplus",
      label: "Аптека плюс",
      url: "https://aptekaplus.kz/",
      logoSrc: "assets/logos/logo_aptekaplus.svg",
      logoAlt: "Аптека плюс",
      ariaLabel: `${labelPrefix}Аптека плюс`,
      sortOrder: 3,
    },
  ];
}

function mergeProductContentWithFallback(primary, fallback) {
  if (Array.isArray(primary) || Array.isArray(fallback)) {
    return Array.isArray(primary) && primary.length ? primary : (Array.isArray(fallback) ? fallback : []);
  }

  if ((primary && typeof primary === "object") || (fallback && typeof fallback === "object")) {
    const primaryObject = primary && typeof primary === "object" ? primary : {};
    const fallbackObject = fallback && typeof fallback === "object" ? fallback : {};
    return Object.fromEntries(
      [...new Set([...Object.keys(fallbackObject), ...Object.keys(primaryObject)])]
        .map(key => [key, mergeProductContentWithFallback(primaryObject[key], fallbackObject[key])])
    );
  }

  if (typeof primary === "string") return primary.trim() ? primary : (fallback ?? primary);
  return primary ?? fallback;
}

function productDetailPayloadFromDatabaseProduct(product, therapeuticAreas, country, language = "ru", staticDetail = null) {
  const areaLabels = buildTherapeuticAreaLabelMap(therapeuticAreas, language);
  const translation = mergeProductContentWithFallback(
    getProductPayloadTranslation(product, language),
    staticDetail?.translation || {}
  );
  const sections = mergeProductContentWithFallback(
    getProductPayloadSections(product, language),
    staticDetail?.sections || {}
  );
  const image = getCanonicalProductImageFromSlots(product.images || {});
  const images = product.images || {};
  const imageSrc = normalizeImageSource(image.src);
  const name = translation.name || product.slug || product.id;
  const benefits = coerceProductTextList(translation.benefits);
  const badges = coerceProductTextList(sections.hero?.badges, sections.overview?.badges).slice(0, 3);
  const category = product.therapeuticAreaId || "";
  const therapeuticArea = getTherapeuticAreaLabel(category, language, areaLabels);
  const overviewIntro = sections.overview?.intro || translation.fullDescription || translation.shortDescription || "";
  const heroLead = sections.hero?.lead || translation.fullDescription || translation.shortDescription || overviewIntro;
  const formulaIntro = sections.formula?.intro || translation.composition || "";
  const formulaImage = normalizeImageSource(images.formulaCenter?.src || sections.formula?.image || "");
  const usageHeading = sections.usage?.heading || "";
  const noteText = sections.note?.text || translation.usageText || "";
  const buyIntro = sections.buy?.intro || "";
  const fallbackFacts = benefits.slice(0, 4).map((text, index) => ({
    value: index + 1,
    title: text.split(/[.,;:]/)[0].slice(0, 72),
    text,
  }));
  const facts = coerceProductObjectList(sections.overview?.facts || sections.facts?.items, fallbackFacts).slice(0, 4);
  const metrics = coerceProductObjectList(sections.hero?.metrics, facts.slice(0, 3)).slice(0, 3);
  const formulaPointFallback = [
    { ...(sections.formula?.points?.[0] || {}), imageSrc: images.formulaPointActive?.src || sections.formula?.points?.[0]?.imageSrc || "" },
    { ...(sections.formula?.points?.[1] || {}), imageSrc: images.formulaPointSeawater?.src || sections.formula?.points?.[1]?.imageSrc || "" },
    { ...(sections.formula?.points?.[2] || {}), imageSrc: images.formulaPointFormat?.src || sections.formula?.points?.[2]?.imageSrc || "" },
  ].filter(point => point.text || point.title || point.value || point.imageSrc);
  const formulaPoints = coerceProductObjectList(formulaPointFallback, facts.slice(0, 3))
    .slice(0, 3)
    .map(point => ({
      ...point,
      imageSrc: normalizeImageSource(point.imageSrc),
    }));
  const usageItems = coerceProductObjectList(sections.usage?.items, benefits.slice(0, 3).map((text, index) => ({
    title: `${index + 1}`,
    text,
  }))).slice(0, 3);
  const defaultPurchaseLinks = country?.id === "kazakhstan" ? makeDefaultProductPurchaseLinks(name) : [];
  const purchaseLinks = (Array.isArray(product.purchaseLinks) && product.purchaseLinks.length
    ? product.purchaseLinks
    : defaultPurchaseLinks
  ).map((link, index) => ({
    slot: link.slot || `link-${index + 1}`,
    label: link.label || link.slot || "",
    url: normalizeExternalLink(link.url),
    logoSrc: normalizeImageSource(link.logoSrc),
    logoAlt: link.logoAlt || link.label || "",
    ariaLabel: link.ariaLabel || `${name} - ${link.label || link.slot || "pharmacy"}`,
    sortOrder: Number.isFinite(Number(link.sortOrder)) ? Number(link.sortOrder) : index,
  })).filter(link => link.label && link.url);

  return {
    country,
    language,
    product: {
      id: product.id,
      slug: product.slug || product.id,
      status: product.status,
      category,
      therapeuticArea,
      accent: product.accentColor || "",
      isFeatured: Boolean(product.isFeatured),
      name,
      shortDescription: translation.shortDescription || "",
      image: {
        src: imageSrc,
        url: imageSrc,
        alt: image.alt || name,
      },
      page: {
        title: `STADA - ${name}`,
        kicker: sections.hero?.kicker || therapeuticArea || "",
        lead: heroLead,
        heroOptions: sections.hero?.options || {},
        overviewLabel: sections.overview?.label || therapeuticArea || "",
        overviewHeading: sections.overview?.heading || name,
        overviewIntro,
        formulaLabel: sections.formula?.label || "Формула",
        formulaHeading: sections.formula?.heading || name,
        formulaIntro,
        formulaImage,
        usageLabel: sections.usage?.label || "Когда применяют",
        usageHeading: usageHeading || name,
        noteTitle: sections.note?.title || "Важно",
        noteText,
        buyIntro,
        layout: sections.layout || {},
        badges,
        metrics,
        benefits,
        facts,
        formulaPoints,
        usageItems,
        purchaseLinks,
      },
    },
  };
}

const DEFAULT_THERAPEUTIC_AREA_LABELS = {
  allergy: {
    ru: "Аллергия",
    kz: "Аллергия",
    kg: "Аллергия",
    ge: "ალერგია",
    en: "Allergy",
    az: "Allergiya",
  },
  cardio: {
    ru: "Кардио",
    kz: "Кардио",
    kg: "Жүрөк-кан тамыр",
    ge: "გულ-სისხლძარღვთა",
    en: "Cardio",
    az: "Kardio",
  },
  cold: {
    ru: "Простуда и дыхание",
    kz: "Суық тию және тыныс алу",
    kg: "Суук тийүү жана дем алуу жолдору",
    ge: "გაციება და სასუნთქი გზები",
    en: "Cold and breathing",
    az: "Soyuqdəymə və tənəffüs",
  },
  dermatology: {
    ru: "Дерматология",
    kz: "Дерматология",
    kg: "Дерматология",
    ge: "დერმატოლოგია",
    en: "Dermatology",
    az: "Dermatologiya",
  },
  digestive: {
    ru: "Пищеварение",
    kz: "Ас қорыту",
    kg: "Тамак сиңирүү",
    ge: "საჭმლის მონელება",
    en: "Digestive health",
    az: "Həzm",
  },
  immunity: {
    ru: "Иммунитет",
    kz: "Иммунитет",
    kg: "Иммунитет",
    ge: "იმუნიტეტი",
    en: "Immunity",
    az: "İmmunitet",
  },
  kids: {
    ru: "Для детей",
    kz: "Балаларға арналған",
    kg: "Балдар үчүн",
    ge: "ბავშვებისთვის",
    en: "For children",
    az: "Uşaqlar üçün",
  },
  respiratory: {
    ru: "Дыхательные пути",
    kz: "Тыныс алу жолдары",
    kg: "Дем алуу жолдору",
    ge: "სასუნთქი გზები",
    en: "Respiratory",
    az: "Tənəffüs yolları",
  },
  urology: {
    ru: "Урология",
    kz: "Урология",
    kg: "Урология",
    ge: "უროლოგია",
    en: "Urology",
    az: "Urologiya",
  },
  women: {
    ru: "Гинекология",
    kz: "Гинекология",
    kg: "Гинекология",
    ge: "გინეკოლოგია",
    en: "Gynecology",
    az: "Ginekologiya",
  },
};

function knownTherapeuticAreaLabel(areaId, language = "ru") {
  const normalizedLanguage = String(language || "").trim().toLowerCase();
  const labels = DEFAULT_THERAPEUTIC_AREA_LABELS[String(areaId || "").trim().toLowerCase()];
  if (!labels) return "";
  return labels[normalizedLanguage] || labels.ru || "";
}

function getTherapeuticAreaLabel(areaId, language = "ru", areaLabels = new Map()) {
  const category = String(areaId || "").trim();
  const mappedLabel = String(areaLabels.get(category) || "").trim();
  const fallbackLabel = knownTherapeuticAreaLabel(category, language);
  if (fallbackLabel && isEnglishTherapeuticAreaPlaceholder(mappedLabel, category)) return fallbackLabel;
  return mappedLabel || fallbackLabel || category;
}

function isEnglishTherapeuticAreaPlaceholder(value, areaId) {
  const text = String(value || "").trim();
  if (!text) return true;
  const normalizedText = text.toLowerCase().replace(/[\s_]+/g, "-");
  const normalizedAreaId = String(areaId || "").trim().toLowerCase();
  return normalizedText === normalizedAreaId || /^[a-z][a-z\s-]*$/i.test(text);
}

function buildTherapeuticAreaLabelMap(areas, language = "ru") {
  return new Map((areas || []).map(area => {
    const requestedLanguage = String(language || "").trim().toLowerCase();
    const translation = requestedLanguage === "az"
      ? area.translations?.az || area.translations?.ru || {}
      : requestedLanguage === "ro"
      ? area.translations?.ro || area.translations?.ru || area.translations?.en || {}
      : requestedLanguage === "kg" || requestedLanguage === "ge"
      ? area.translations?.[requestedLanguage] || {}
      : requestedLanguage === "en"
        ? area.translations?.en || area.translations?.ge || {}
        : area.translations?.[requestedLanguage] || area.translations?.ru || area.translations?.kz || {};
    const fallbackLabel = knownTherapeuticAreaLabel(area.id, language);
    const translatedLabel = String(translation.name || "").trim();
    const label = fallbackLabel && isEnglishTherapeuticAreaPlaceholder(translatedLabel, area.id)
      ? fallbackLabel
      : translatedLabel || fallbackLabel || area.id;
    return [area.id, label];
  }));
}

function mergeContentProduct(staticProduct, databaseProduct) {
  return {
    ...staticProduct,
    ...databaseProduct,
    className: staticProduct.className || databaseProduct.className || "",
    categoryClass: databaseProduct.categoryClass || staticProduct.categoryClass || "",
    image: {
      ...(staticProduct.image || {}),
      ...(databaseProduct.image || {}),
      id: databaseProduct.image?.id || staticProduct.image?.id || "",
      src: databaseProduct.image?.src || staticProduct.image?.src || "",
      url: databaseProduct.image?.url || databaseProduct.image?.src || staticProduct.image?.url || "",
      alt: databaseProduct.image?.alt || staticProduct.image?.alt || databaseProduct.name || staticProduct.name || "",
    },
    name: databaseProduct.name || staticProduct.name || databaseProduct.id || staticProduct.id,
    shortDescription: databaseProduct.shortDescription || staticProduct.shortDescription || "",
    therapeuticArea: databaseProduct.therapeuticArea || staticProduct.therapeuticArea || "",
  };
}

function normalizePayloadProductIds(value, productCatalog, countryId = "") {
  const availableProductIds = new Set((productCatalog || []).map(product => product.id));
  const ids = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(
    ids
      .map(id => String(id || "").trim())
      .map(id => availableProductIds.has(id) ? id : normalizeCatalogProductId(id, countryId))
      .filter(id => availableProductIds.has(id))
  )];
}

function syncPayloadHomeProducts(payload) {
  const catalog = payload.content?.productCatalog || [];
  payload.content.settings ||= {};
  const selectedIds = normalizePayloadProductIds(payload.content.settings.homeProducts, catalog, payload.country?.id);
  const fallbackIds = [...new Set(catalog.map(product => product.id).filter(Boolean))];
  payload.content.settings.homeProducts = [
    ...selectedIds,
    ...fallbackIds.filter(id => !selectedIds.includes(id)),
  ].slice(0, 4);
  const catalogById = new Map(catalog.map(product => [product.id, product]));
  payload.content.homeProducts = payload.content.settings.homeProducts
    .map(id => catalogById.get(id))
    .filter(Boolean);
}

function setPayloadDomText(payload, ids, value) {
  const domText = payload.content?.dom?.text;
  if (!Array.isArray(domText)) return;
  const textValue = String(value ?? "");
  const idSet = new Set(ids);

  payload.content.dom.text = domText.map(item => {
    if (!idSet.has(item.id)) return item;
    return {
      ...item,
      value: textValue,
      source: "database",
    };
  });
}

function syncPayloadProductMetrics(payload) {
  const productCount = (payload.content?.productCatalog || []).length;
  setPayloadDomText(payload, ["index_text_026", "products_index_text_002"], productCount);
}

function normalizeComparableProductPath(value) {
  return String(value || "")
    .split(/[?#]/)[0]
    .replace(/\\/g, "/")
    .replace(/^(\.\/)+/, "")
    .replace(/^\/+/, "")
    .replace(/^main\//, "")
    .toLowerCase();
}

function productSlugFromPagePath(value) {
  return normalizeComparableProductPath(value)
    .replace(/^products\//, "")
    .replace(/\.html$/i, "")
    .replace(/\/index$/i, "");
}

function productDomBaseFromPagePath(value) {
  return productSlugFromPagePath(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function findProductForPayloadPage(payload, products) {
  const pagePath = normalizeComparableProductPath(payload.page?.path);
  if (!pagePath.startsWith("products/") || pagePath.endsWith("/index.html") || pagePath === "products/index.html") {
    return null;
  }

  const pageSlug = productSlugFromPagePath(pagePath);
  return (products || []).find(product => {
    if (product.status === "archived") return false;
    return normalizeComparableProductPath(`products/${product.slug || product.id}.html`) === pagePath
      || normalizeProductSlug(product.slug) === pageSlug
      || normalizeProductSlug(product.id) === pageSlug;
  }) || null;
}

function getProductPayloadTranslation(product, language = "ru") {
  return localizedProductFallbacks(product, language).find(Boolean) || {};
}

function getProductPayloadSections(product, language = "ru") {
  const requestedLanguage = String(language || "").trim().toLowerCase();
  if (requestedLanguage === "az") {
    return product.sections?.az || product.sections?.ru || product.sections?.en || product.sections?.kz || {};
  }
  if (requestedLanguage === "ro") {
    return product.sections?.ro || product.sections?.ru || product.sections?.en || {};
  }
  if (requestedLanguage === "kg") {
    return product.sections?.kg || product.sections?.ru || product.sections?.en || {};
  }
  if (requestedLanguage === "ge") {
    return product.sections?.ge || product.sections?.en || product.sections?.ru || product.sections?.kz || product.sections?.kg || {};
  }
  if (requestedLanguage === "en") {
    return product.sections?.en || product.sections?.ge || product.sections?.ru || product.sections?.kz || product.sections?.kg || {};
  }
  return product.sections?.[requestedLanguage] || product.sections?.ru || product.sections?.kz || {};
}

function findProductDetailKeyPrefix(payload) {
  const keys = Object.keys(payload.content?.text || {});
  const match = keys.map(key => key.match(/^(product_.+)_page_title$/)).find(Boolean);
  return match ? match[1] : "";
}

function setPayloadTextValue(payload, key, value, { allowEmpty = false } = {}) {
  if (!key || (!allowEmpty && !String(value || "").trim())) return;
  const textValue = String(value ?? "");
  payload.content.text[key] = textValue;
  for (const section of payload.content.sections || []) {
    for (const item of section.translatedTexts || []) {
      if (item.key !== key) continue;
      item.value = textValue;
      item.source = "database";
    }
  }
}

function setPayloadDomTextValue(payload, id, value, { allowEmpty = false } = {}) {
  if (!id || (!allowEmpty && !String(value || "").trim())) return;
  const domText = payload.content?.dom?.text;
  if (!Array.isArray(domText)) return;
  const textValue = String(value ?? "");
  const item = domText.find(candidate => candidate.id === id);
  if (!item) return;
  item.value = textValue;
  item.source = "database";
}

function setPayloadDomImageValue(payload, id, image) {
  const src = normalizeImageSource(image?.src);
  if (!id || !src || !Array.isArray(payload.content?.dom?.images)) return;
  const item = payload.content.dom.images.find(candidate => candidate.id === id);
  if (!item) return;
  item.src = src;
  item.url = src;
  item.alt = String(image.alt || item.alt || "").trim();
  item.source = "database";
}

function applyDatabaseProductDetailToPayload(payload, products) {
  const product = findProductForPayloadPage(payload, products);
  if (!product) return;

  const language = payload.language || "ru";
  const translation = getProductPayloadTranslation(product, language);
  const sections = getProductPayloadSections(product, language);
  const keyPrefix = findProductDetailKeyPrefix(payload);
  const domBase = productDomBaseFromPagePath(payload.page?.path);
  const name = translation.name || product.slug || product.id;
  const heroLead = sections.hero?.lead || translation.fullDescription || "";
  const overviewIntro = sections.overview?.intro || translation.fullDescription || "";
  const formulaIntro = sections.formula?.intro || translation.composition || "";
  const usageHeading = sections.usage?.heading || "";
  const noteText = sections.note?.text || translation.usageText || "";
  const buyIntro = sections.buy?.intro || "";
  const benefits = Array.isArray(translation.benefits) ? translation.benefits : [];

  if (keyPrefix) {
    setPayloadTextValue(payload, `${keyPrefix}_name`, name);
    setPayloadTextValue(payload, `${keyPrefix}_page_title`, name);
    setPayloadTextValue(payload, `${keyPrefix}_page_desc`, heroLead);
    setPayloadTextValue(payload, `${keyPrefix}_overview_intro`, overviewIntro);
    setPayloadTextValue(payload, `${keyPrefix}_formula_intro`, formulaIntro);
    setPayloadTextValue(payload, `${keyPrefix}_usage_heading`, usageHeading);
    setPayloadTextValue(payload, `${keyPrefix}_note_text`, noteText);
    setPayloadTextValue(payload, `${keyPrefix}_buy_intro`, buyIntro);

    const benefitKeys = Object.keys(payload.content?.text || {})
      .filter(key => key.startsWith(`${keyPrefix}_benefit`))
      .sort((left, right) => Number(left.match(/(\d+)$/)?.[1] || 0) - Number(right.match(/(\d+)$/)?.[1] || 0));
    if (benefits.length) {
      benefitKeys.forEach((key, index) => {
        setPayloadTextValue(payload, key, benefits[index] || "", { allowEmpty: true });
      });
    }
  } else if (domBase) {
    setPayloadDomTextValue(payload, `products_${domBase}_text_001`, `STADA - ${name}`);
    setPayloadDomTextValue(payload, `products_${domBase}_text_003`, name);
    setPayloadDomTextValue(payload, `products_${domBase}_text_004`, heroLead);
    setPayloadDomTextValue(payload, `products_${domBase}_text_016`, overviewIntro);
    setPayloadDomTextValue(payload, `products_${domBase}_text_036`, formulaIntro);
    setPayloadDomTextValue(payload, `products_${domBase}_text_047`, usageHeading);
    setPayloadDomTextValue(payload, `products_${domBase}_text_055`, noteText);
    setPayloadDomTextValue(payload, `products_${domBase}_text_056`, buyIntro);

    if (benefits.length) {
      for (let index = 0; index < 8; index += 1) {
        const id = `products_${domBase}_text_${String(29 + index).padStart(3, "0")}`;
        setPayloadDomTextValue(payload, id, benefits[index] || "", { allowEmpty: true });
      }
    }
  }

  setPayloadDomImageValue(payload, `products_${domBase}_image_002`, getCanonicalProductImageFromSlots(product.images || {}));
}

function applyDatabaseProductsToPayload(payload, products, therapeuticAreas) {
  if (!payload?.content) return payload;

  const areaLabels = buildTherapeuticAreaLabelMap(therapeuticAreas, payload.language);
  const databaseSourceProducts = products || [];
  const databaseProducts = databaseSourceProducts
    .filter(product => product.status !== "archived")
    .map(product => contentProductFromDatabaseProduct(product, payload.language, areaLabels));

  payload.content.productCatalog = databaseProducts;
  syncPayloadHomeProducts(payload);
  syncPayloadProductMetrics(payload);
  if (databaseSourceProducts.length) {
    applyDatabaseProductDetailToPayload(payload, databaseSourceProducts);
  }
  return payload;
}

module.exports = {
  applyDatabaseProductsToPayload,
  buildTherapeuticAreaLabelMap,
  contentProductFromDatabaseProduct,
  getProductPayloadTranslation,
  mergeProductContentWithFallback,
  productDetailPayloadFromDatabaseProduct,
};
