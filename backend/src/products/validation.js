const { findCountryByInput, normalizeCountrySlug } = require("../countries");

const productLanguages = ["ru", "kz", "kg", "ge", "en", "az", "ro", "uz", "hy"];
const productNameFallbackLanguages = new Set(["ru", "kz", "en", "az", "ro", "uz", "hy"]);
const productSlugTransliteration = {
  "\u0430": "a",
  "\u0431": "b",
  "\u0432": "v",
  "\u0433": "g",
  "\u0434": "d",
  "\u0435": "e",
  "\u0451": "e",
  "\u0436": "zh",
  "\u0437": "z",
  "\u0438": "i",
  "\u0439": "y",
  "\u043a": "k",
  "\u043b": "l",
  "\u043c": "m",
  "\u043d": "n",
  "\u043e": "o",
  "\u043f": "p",
  "\u0440": "r",
  "\u0441": "s",
  "\u0442": "t",
  "\u0443": "u",
  "\u0444": "f",
  "\u0445": "h",
  "\u0446": "ts",
  "\u0447": "ch",
  "\u0448": "sh",
  "\u0449": "sch",
  "\u044a": "",
  "\u044b": "y",
  "\u044c": "",
  "\u044d": "e",
  "\u044e": "yu",
  "\u044f": "ya",
  "\u04a3": "n",
  "\u04e9": "o",
  "\u04af": "u",
};

function transliterateSlugText(value) {
  return Array.from(String(value || "").normalize("NFKD").toLowerCase())
    .map(char => productSlugTransliteration[char] ?? char)
    .join("")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeProductSlug(value) {
  return transliterateSlugText(value)
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function productCountryId(countryId) {
  return findCountryByInput(countryId)?.id || normalizeCountrySlug(countryId) || "kazakhstan";
}

function productCountryPrefix(countryId) {
  const country = productCountryId(countryId);
  return country && country !== "kazakhstan" ? `${country}-` : "";
}

function productPublicIdFromStorageId(value, countryId) {
  const id = normalizeProductSlug(value);
  const prefix = productCountryPrefix(countryId);
  return prefix && id.startsWith(prefix) ? id.slice(prefix.length) : id;
}

function normalizeProductStorageId(countryId, value) {
  return productPublicIdFromStorageId(value, countryId);
}

function normalizeProductImageSlot(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "")
    .slice(0, 80);
}

function normalizePublicUrl(value, options = {}) {
  const {
    allowRelative = true,
    allowDataImage = false,
    requireExternal = false,
  } = options;
  const raw = String(value || "").trim();
  if (!raw || /[\u0000-\u001f\u007f]/.test(raw)) return "";

  if (allowDataImage && /^data:image\/(?:png|jpe?g|webp);base64,/i.test(raw)) {
    return raw;
  }

  if (/^\/\//.test(raw)) {
    try {
      return new URL(`https:${raw}`).href;
    } catch (error) {
      return "";
    }
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    try {
      const url = new URL(raw);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (error) {
      return "";
    }
  }

  if (requireExternal || !allowRelative) return "";

  const normalized = raw
    .replace(/\\/g, "/")
    .replace(/^(\.\/)+/, "")
    .replace(/^\/+/, "");
  if (!normalized || normalized.startsWith("#") || normalized.startsWith("?")) return "";
  if (normalized.split("/").includes("..")) return "";
  return normalized.slice(0, 500);
}

function normalizeImageSource(value) {
  return normalizePublicUrl(value, { allowRelative: true });
}

function normalizeExternalLink(value) {
  return normalizePublicUrl(value, { allowRelative: false, requireExternal: true });
}

function normalizeImageSrcset(value) {
  return String(value || "")
    .split(",")
    .map(candidate => {
      const parts = candidate.trim().split(/\s+/).filter(Boolean);
      const src = normalizeImageSource(parts.shift());
      if (!src) return "";
      const descriptors = parts.filter(part => /^\d+(?:\.\d+)?[wx]$/.test(part));
      return [src, ...descriptors].join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

function normalizeLoadingValue(value) {
  const loading = String(value || "").trim().toLowerCase();
  return ["lazy", "eager"].includes(loading) ? loading : "";
}

function normalizeCssColor(value) {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(color) ? color : null;
}

function normalizeProductBenefits(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeProductSectionContent(value) {
  const content = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const normalized = {};

  for (const [key, item] of Object.entries(content)) {
    if (Array.isArray(item)) {
      const arrayValue = item
        .map(entry => {
          if (entry && typeof entry === "object" && !Array.isArray(entry)) {
            const objectValue = normalizeProductSectionContent(entry);
            return Object.keys(objectValue).length ? objectValue : null;
          }
          return String(entry ?? "").trim();
        })
        .filter(entry => {
          if (entry && typeof entry === "object") return Object.keys(entry).length;
          return String(entry || "").trim();
        });
      if (arrayValue.length) normalized[key] = arrayValue;
      continue;
    }

    if (item && typeof item === "object") {
      const objectValue = normalizeProductSectionContent(item);
      if (Object.keys(objectValue).length) normalized[key] = objectValue;
      continue;
    }

    const textValue = String(item ?? "").trim();
    if (textValue && /^(?:image|imageSrc|logoSrc|src)$/i.test(key)) {
      const imageSource = normalizeImageSource(textValue);
      if (imageSource) normalized[key] = imageSource;
    } else if (textValue) {
      normalized[key] = textValue;
    }
  }

  return normalized;
}

function normalizeProductSections(value) {
  const submitted = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const normalized = {};
  for (const language of productLanguages) {
    const sections = submitted[language] && typeof submitted[language] === "object" && !Array.isArray(submitted[language])
      ? submitted[language]
      : {};
    normalized[language] = {};
    for (const [sectionType, content] of Object.entries(sections)) {
      const normalizedContent = normalizeProductSectionContent(content);
      if (Object.keys(normalizedContent).length) {
        normalized[language][sectionType] = normalizedContent;
      }
    }
  }
  return normalized;
}

function normalizeProductTranslations(value, fallbackName) {
  const submitted = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const normalized = {};
  for (const language of productLanguages) {
    const translation = submitted[language] && typeof submitted[language] === "object" && !Array.isArray(submitted[language])
      ? submitted[language]
      : {};
    normalized[language] = {
      name: String(translation.name || (productNameFallbackLanguages.has(language) ? fallbackName : "") || "").trim(),
      shortDescription: String(translation.shortDescription || "").trim(),
      fullDescription: String(translation.fullDescription || "").trim(),
      composition: String(translation.composition || "").trim(),
      usageText: String(translation.usageText || "").trim(),
      benefits: normalizeProductBenefits(translation.benefits),
    };
  }
  return normalized;
}

function normalizeProductImages(value) {
  const images = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const normalized = {};
  for (const [slot, image] of Object.entries(images)) {
    if (!image || typeof image !== "object" || Array.isArray(image)) continue;
    const normalizedSlot = normalizeProductImageSlot(slot);
    if (!normalizedSlot) continue;
    const src = normalizeImageSource(image.src);
    const alt = String(image.alt || "").trim();
    const cloudinaryPublicId = String(image.cloudinaryPublicId || "").trim() || null;
    normalized[normalizedSlot] = { src, cloudinaryPublicId, alt };
  }
  return syncProductImageSlots(normalized);
}

function normalizeProductPurchaseLinks(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((link, index) => {
      if (!link || typeof link !== "object" || Array.isArray(link)) return null;
      const label = String(link.label || "").trim();
      const url = normalizeExternalLink(link.url);
      if (!label || !url) return null;
      return {
        slot: normalizeProductSlug(link.slot || label) || `link-${index + 1}`,
        label,
        url,
        logoSrc: normalizeImageSource(link.logoSrc || link.logo_src),
        logoAlt: String(link.logoAlt || link.logo_alt || label).trim(),
        sortOrder: Number.isFinite(Number(link.sortOrder)) ? Number(link.sortOrder) : index,
      };
    })
    .filter(Boolean)
    .slice(0, 12);
}

function isCloudinaryImageSource(src) {
  return /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//i.test(String(src || ""));
}

function getCanonicalProductImageFromSlots(images = {}) {
  const mainCandidates = [
    images.card,
    images.detailHero,
    images.hero,
  ].filter(image => image?.src);
  if (mainCandidates.length) {
    return mainCandidates.find(image => isCloudinaryImageSource(image.src)) || mainCandidates[0] || {};
  }

  const candidates = Object.values(images).filter(image => image?.src);
  return candidates.find(image => isCloudinaryImageSource(image.src)) || candidates[0] || {};
}

function syncProductImageSlots(images = {}) {
  const canonicalImage = getCanonicalProductImageFromSlots(images);
  if (!canonicalImage.src) return images;

  const synced = { ...images };
  for (const slot of ["card", "detailHero", "hero"]) {
    synced[slot] = {
      ...(synced[slot] || {}),
      src: synced[slot]?.src || canonicalImage.src || "",
      cloudinaryPublicId: canonicalImage.cloudinaryPublicId || null,
      alt: synced[slot]?.alt || canonicalImage.alt || "",
    };
  }
  return synced;
}

function normalizeProductPayload(body, routeId = "", countryId = "kazakhstan") {
  const submitted = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const country = productCountryId(countryId);
  const publicRouteId = productPublicIdFromStorageId(routeId, country);
  const publicSubmittedId = productPublicIdFromStorageId(submitted.id, country);
  const publicSubmittedSlug = productPublicIdFromStorageId(submitted.slug, country);
  const submittedNames = productLanguages
    .map(language => submitted.translations?.[language]?.name)
    .map(name => String(name || "").trim())
    .filter(Boolean);
  const nameSlug = submittedNames.map(normalizeProductSlug).find(Boolean) || "";
  const slug = normalizeProductSlug(publicSubmittedSlug || publicSubmittedId || publicRouteId) || nameSlug;
  const id = normalizeProductStorageId(country, routeId || submitted.id || slug);
  const statuses = new Set(["draft", "published", "archived"]);
  const status = statuses.has(String(submitted.status || "").trim()) ? String(submitted.status).trim() : "draft";
  const fallbackName = submittedNames.find(Boolean) || slug;

  if (!id || !slug) {
    throw Object.assign(new Error("Product slug is required."), {
      statusCode: 400,
      code: "PRODUCT_SLUG_REQUIRED",
    });
  }

  return {
    id,
    countryId: country,
    slug,
    status,
    sortOrder: Number.isFinite(Number(submitted.sortOrder)) ? Number(submitted.sortOrder) : 0,
    therapeuticAreaId: normalizeProductSlug(submitted.therapeuticAreaId) || null,
    accentColor: normalizeCssColor(submitted.accentColor),
    isFeatured: Boolean(submitted.isFeatured),
    translations: normalizeProductTranslations(submitted.translations, fallbackName),
    images: normalizeProductImages(submitted.images),
    sections: normalizeProductSections(submitted.sections),
    purchaseLinks: normalizeProductPurchaseLinks(submitted.purchaseLinks),
  };
}

module.exports = {
  getCanonicalProductImageFromSlots,
  isCloudinaryImageSource,
  normalizeCssColor,
  normalizeExternalLink,
  normalizeImageSource,
  normalizeImageSrcset,
  normalizeLoadingValue,
  normalizeProductBenefits,
  normalizeProductImageSlot,
  normalizeProductImages,
  normalizeProductPayload,
  normalizeProductPurchaseLinks,
  normalizeProductSectionContent,
  normalizeProductSections,
  normalizeProductSlug,
  normalizeProductStorageId,
  normalizeProductTranslations,
  normalizePublicUrl,
  productCountryId,
  productCountryPrefix,
  productLanguages,
  productPublicIdFromStorageId,
  syncProductImageSlots,
  transliterateSlugText,
};
