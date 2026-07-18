const {
  normalizeImageSource,
  normalizeImageSrcset,
  normalizeLoadingValue,
  productCountryId,
  productCountryPrefix,
} = require("../products/validation");

const hiddenTextKeys = new Set(["hero_kicker", "site_name"]);
const adminEditablePagePath = "index.html";
const editableImageFields = ["src", "alt", "loading", "srcset", "sizes"];
const maxNewsCards = 30;
const defaultNewsCardFields = [
  { date: "index_text_013", title: "hero_text1", text: "news_1_text", image: "index_image_006" },
  { date: "index_text_014", title: "hero_text2", text: "news_2_text", image: "index_image_007" },
  { date: "index_text_015", title: "hero_text3", text: "news_3_text", image: "index_image_008" },
  { date: "index_text_016", title: "news_4_title", text: "news_4_text", image: "index_image_009" },
  { date: "index_text_017", title: "news_5_title", text: "news_5_text", image: "index_image_010" },
  { date: "index_text_018", title: "news_6_title", text: "news_6_text", image: "index_image_011" },
  { date: "index_text_019", title: "news_7_title", text: "news_7_text", image: "index_image_012" },
  { date: "index_text_020", title: "news_8_title", text: "news_8_text", image: "index_image_013" },
];

function makeEditableLabel(id) {
  const specialLabels = {
  };
  if (specialLabels[id]) return specialLabels[id];

  return String(id || "")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function isHiddenEditableTextKey(key) {
  return hiddenTextKeys.has(key)
    || /^nav_/i.test(key)
    || /^footer_nav_/i.test(key)
    || (/^hero_caption_/i.test(key) && key !== "hero_caption_logo")
    || /(^|_)button($|_)/i.test(key)
    || key === "cta_more"
    || key === "products_browse_catalog";
}

function makeSectionDisplayLabel(value) {
  const raw = String(value || "").trim();
  const normalized = raw.toLowerCase();
  const labelMatches = [
    [/worldwide-globe-panel/, "Interactive globe"],
    [/worldwide-country-detail/, "Country details"],
    [/worldwide-shell/, "Worldwide overview"],
    [/catalog-hero/, "Products hero"],
    [/catalog-section|products-catalog/, "Products catalog"],
    [/catalog-partners|pharmacy-partners/, "Pharmacy partners"],
    [/culture-purpose/, "Purpose and vision"],
    [/culture-values/, "Values"],
    [/culture-action/, "Culture in action"],
    [/culture-next/, "More culture links"],
    [/history-summary/, "Key milestones"],
    [/history-periods/, "History periods"],
    [/history-timeline/, "History timeline"],
    [/history-top|history-hero/, "History hero"],
    [/hero-section|(^|\\s)hero($|\\s)/, "Hero"],
    [/footer/, "Footer"],
    [/navigation/, "Navigation"],
  ];

  for (const [pattern, label] of labelMatches) {
    if (pattern.test(normalized)) return label;
  }

  const className = raw.split(/\s+/).find(part => !part.includes("--")) || raw;
  return makeEditableLabel(className || "Page content");
}

function makeSectionLookup(payload) {
  const lookup = new Map();
  for (const section of payload.content?.sections || []) {
    for (const item of section.translatedTexts || []) {
      if (!item?.key || lookup.has(item.key)) continue;
      lookup.set(item.key, {
        id: section.id || "content",
        label: makeSectionDisplayLabel(section.label || section.id || "content"),
      });
    }
  }
  return lookup;
}

function makeImageSectionLookup(payload) {
  const lookup = new Map();
  for (const section of payload.content?.sections || []) {
    for (const image of section.photos || []) {
      if (!image?.id || lookup.has(image.id)) continue;
      lookup.set(image.id, {
        id: section.id || "content",
        label: makeSectionDisplayLabel(section.label || section.id || "content"),
      });
    }
  }
  return lookup;
}

function fallbackSectionForTextKey(key) {
  if (/_page_title$/i.test(key) || /_meta_/i.test(key)) {
    return { id: "page-metadata", label: "Page metadata" };
  }
  return { id: "content", label: "Page content" };
}

function isLockedEditableSection(section) {
  return String(section?.label || section?.id || "").trim().toLowerCase() === "footer";
}

function normalizeNewsCardText(value, maxLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

function normalizeNewsCards(value) {
  if (!Array.isArray(value)) return [];

  const usedIds = new Set();
  return value.slice(0, maxNewsCards).map((card, index) => {
    const baseId = String(card?.id || "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `news-${index + 1}`;
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`.slice(0, 70);
      suffix += 1;
    }
    usedIds.add(id);

    return {
      id,
      date: normalizeNewsCardText(card?.date, 120),
      title: normalizeNewsCardText(card?.title, 500),
      text: normalizeNewsCardText(card?.text, 3000),
      image: normalizeEditableImage(card?.image),
    };
  });
}

function defaultNewsCardsFromPayload(payload) {
  const text = payload?.content?.text || {};
  const images = new Map((payload?.content?.dom?.images || []).map(image => [image.id, image]));
  return normalizeNewsCards(defaultNewsCardFields.map((fields, index) => ({
    id: `news-${index + 1}`,
    date: text[fields.date] || "",
    title: text[fields.title] || "",
    text: text[fields.text] || "",
    image: images.get(fields.image) || {},
  })));
}

function editableNewsCardsFromPayload(payload) {
  const configuredCards = payload?.content?.settings?.newsCards;
  return Array.isArray(configuredCards)
    ? normalizeNewsCards(configuredCards)
    : defaultNewsCardsFromPayload(payload);
}

function buildEditableContent(basePayload, currentPayload) {
  const baseText = basePayload.content?.text || {};
  const currentText = currentPayload.content?.text || {};
  const baseDomText = basePayload.content?.dom?.text || [];
  const currentDomTextById = new Map((currentPayload.content?.dom?.text || []).map(item => [item.id, item]));
  const baseDomImages = basePayload.content?.dom?.images || [];
  const currentDomImagesById = new Map((currentPayload.content?.dom?.images || []).map(item => [item.id, item]));
  const sectionLookup = makeSectionLookup(basePayload);
  const imageSectionLookup = makeImageSectionLookup(basePayload);

  const textItems = Object.keys(baseText)
    .filter(key => !isHiddenEditableTextKey(key) && baseText[key] !== null && baseText[key] !== undefined)
    .filter(key => !isLockedEditableSection(sectionLookup.get(key) || fallbackSectionForTextKey(key)))
    .map(key => {
      const original = String(baseText[key] || "");
      const value = String(currentText[key] ?? original);
      const section = sectionLookup.get(key) || fallbackSectionForTextKey(key);
      return {
        type: "text",
        id: key,
        label: makeEditableLabel(key),
        sectionId: section.id,
        sectionLabel: section.label,
        original,
        value,
        overridden: value !== original,
      };
    });

  const domTextItems = baseDomText.map(item => {
    const currentItem = currentDomTextById.get(item.id);
    const original = String(item.value || "");
    const value = String(currentItem?.value ?? original);
    return {
      type: "domText",
      id: item.id,
      tag: item.tag,
      label: `${item.tag.toUpperCase()} ${item.id}`,
      sectionId: "static-text",
      sectionLabel: "Static page text",
      original,
      value,
      overridden: value !== original,
    };
  });

  const domImageItems = baseDomImages.map(image => {
    const currentImage = currentDomImagesById.get(image.id);
    const original = normalizeEditableImage(image);
    const value = normalizeEditableImage(currentImage || image);
    const section = imageSectionLookup.get(image.id) || { id: "backend-images", label: "Backend images" };
    return {
      type: "domImage",
      id: image.id,
      label: makeEditableLabel(image.id),
      sectionId: section.id,
      sectionLabel: section.label,
      original,
      value,
      previewUrl: currentImage?.url || image.url || "",
      originalPreviewUrl: image.url || "",
      overridden: !sameEditableImage(value, original),
    };
  });

  return {
    country: currentPayload.country,
    language: currentPayload.language,
    requestedLanguage: currentPayload.requestedLanguage,
    page: currentPayload.page,
    overrides: getPageOverrides(currentPayload.country.id, currentPayload.language, currentPayload.page.path),
    settings: currentPayload.content?.settings || {},
    originalSettings: basePayload.content?.settings || {},
    newsCards: editableNewsCardsFromPayload(currentPayload),
    originalNewsCards: editableNewsCardsFromPayload(basePayload),
    productCatalog: currentPayload.content?.productCatalog || [],
    sections: [
      ...new Map(
        [...textItems, ...domTextItems, ...domImageItems].map(item => [item.sectionId, { id: item.sectionId, label: item.sectionLabel }])
      ).values(),
    ],
    items: [...textItems, ...domTextItems, ...domImageItems],
  };
}

function normalizeSubmittedMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, itemValue]) => [key, String(itemValue ?? "")])
  );
}

function normalizeEditableImage(image) {
  const normalized = {};
  editableImageFields.forEach(field => {
    if (field === "src") {
      normalized[field] = normalizeImageSource(image?.[field]);
    } else if (field === "srcset") {
      normalized[field] = normalizeImageSrcset(image?.[field]);
    } else if (field === "loading") {
      normalized[field] = normalizeLoadingValue(image?.[field]);
    } else {
      normalized[field] = String(image?.[field] ?? "").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 1000);
    }
  });
  return normalized;
}

function normalizeSubmittedImageMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([id, image]) => [id, normalizeEditableImage(image)])
  );
}

function normalizeCatalogProductId(value, countryId) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const country = productCountryId(countryId);
  const prefix = productCountryPrefix(country);
  return prefix && raw.toLowerCase().startsWith(prefix) ? raw.slice(prefix.length) : raw;
}

function normalizeProductIdList(value, productCatalog, countryId = "") {
  const availableProductIds = new Set((productCatalog || []).map(product => product.id));
  const ids = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(
    ids
      .map(id => String(id || "").trim())
      .map(id => availableProductIds.has(id) ? id : normalizeCatalogProductId(id, countryId))
      .filter(id => availableProductIds.has(id))
  )].slice(0, 4);
}

function sameStringArray(left, right) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function sameEditableImage(left, right) {
  return editableImageFields.every(field => String(left?.[field] ?? "") === String(right?.[field] ?? ""));
}

function buildChangedOverrides(basePayload, body) {
  const baseText = basePayload.content?.text || {};
  const sectionLookup = makeSectionLookup(basePayload);
  const baseDomText = Object.fromEntries((basePayload.content?.dom?.text || []).map(item => [item.id, item.value || ""]));
  const baseDomImages = Object.fromEntries((basePayload.content?.dom?.images || []).map(item => [item.id, normalizeEditableImage(item)]));
  const submittedText = normalizeSubmittedMap(body.text);
  const submittedDomText = normalizeSubmittedMap(body.domText);
  const submittedDomImages = normalizeSubmittedImageMap(body.domImages);
  const submittedSettings = body.settings && typeof body.settings === "object" && !Array.isArray(body.settings)
    ? body.settings
    : {};
  const submittedTextKeys = Object.keys(submittedText);
  const submittedDomTextIds = Object.keys(submittedDomText);
  const submittedDomImageIds = Object.keys(submittedDomImages);
  const submittedSettingKeys = [];
  const submittedLanguageSettingKeys = [];
  const text = {};
  const domText = {};
  const domImages = {};
  const settings = {};
  const languageSettings = {};

  for (const [key, value] of Object.entries(submittedText)) {
    if (isHiddenEditableTextKey(key) || !Object.prototype.hasOwnProperty.call(baseText, key)) continue;
    if (isLockedEditableSection(sectionLookup.get(key) || fallbackSectionForTextKey(key))) continue;
    if (value !== String(baseText[key] || "")) {
      text[key] = value;
    }
  }

  for (const [id, value] of Object.entries(submittedDomText)) {
    if (!Object.prototype.hasOwnProperty.call(baseDomText, id)) continue;
    if (value !== String(baseDomText[id] || "")) {
      domText[id] = value;
    }
  }

  for (const [id, value] of Object.entries(submittedDomImages)) {
    if (!Object.prototype.hasOwnProperty.call(baseDomImages, id)) continue;
    if (!sameEditableImage(value, baseDomImages[id])) {
      domImages[id] = value;
    }
  }

  if (Object.prototype.hasOwnProperty.call(submittedSettings, "homeProducts")) {
    const productCatalog = basePayload.content?.productCatalog || [];
    const value = normalizeProductIdList(submittedSettings.homeProducts, productCatalog, basePayload.country?.id);
    const baseValue = normalizeProductIdList(basePayload.content?.settings?.homeProducts || [], productCatalog, basePayload.country?.id);
    submittedSettingKeys.push("homeProducts");
    if (!sameStringArray(value, baseValue)) {
      settings.homeProducts = value;
    }
  }

  if (Object.prototype.hasOwnProperty.call(submittedSettings, "newsCards")) {
    languageSettings.newsCards = normalizeNewsCards(submittedSettings.newsCards);
    submittedLanguageSettingKeys.push("newsCards");
  }

  return {
    text,
    domText,
    domImages,
    settings,
    languageSettings,
    submittedTextKeys,
    submittedDomTextIds,
    submittedDomImageIds,
    submittedSettingKeys: submittedSettingKeys.length ? submittedSettingKeys : null,
    submittedLanguageSettingKeys: submittedLanguageSettingKeys.length ? submittedLanguageSettingKeys : null,
  };
}

module.exports = {
  adminEditablePagePath,
  buildChangedOverrides,
  buildEditableContent,
  fallbackSectionForTextKey,
  isHiddenEditableTextKey,
  isLockedEditableSection,
  makeSectionLookup,
  normalizeCatalogProductId,
  normalizeEditableImage,
  normalizeNewsCards,
  normalizeProductIdList,
  normalizeSubmittedImageMap,
  normalizeSubmittedMap,
};
