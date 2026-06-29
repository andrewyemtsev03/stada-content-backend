const crypto = require("node:crypto");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { URL } = require("node:url");
const { getHomepagePayload, getPagePayload, listCountries } = require("./content-loader");
const { getPageOverrides, savePageOverrides } = require("./content-overrides");
const { checkDatabaseConnection } = require("./db/client");
const { importProductsFromSite } = require("./products/import-from-site");
const { deleteProduct, getProduct, listProducts, listTherapeuticAreas, upsertProduct } = require("./products/repository");

const port = Number(process.env.PORT || 10000);
const host = "0.0.0.0";
const adminRoot = path.resolve(__dirname, "..", "..", "admin");
const adminLogin = process.env.ADMIN_LOGIN || process.env.ADMIN_USERNAME || "andrewyemtsev";
const adminPassword = process.env.ADMIN_PASSWORD || "StadaAdmin67";
const adminSessionTtlMs = Number(process.env.ADMIN_SESSION_TTL_MS || 8 * 60 * 60 * 1000);
const adminSessions = new Map();
const hiddenTextKeys = new Set(["hero_kicker", "site_name"]);
const adminEditablePagePath = "index.html";
const editableImageFields = ["src", "alt", "loading", "srcset", "sizes"];
const maxJsonBodyBytes = Number(process.env.MAX_JSON_BODY_BYTES || 8 * 1024 * 1024);
const cloudinaryCloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const cloudinaryApiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();
const cloudinaryApiSecret = String(process.env.CLOUDINARY_API_SECRET || "").trim();
const cloudinaryUploadFolder = String(process.env.CLOUDINARY_UPLOAD_FOLDER || "stada/hero").trim();
const cloudinaryProductUploadFolder = String(process.env.CLOUDINARY_PRODUCT_UPLOAD_FOLDER || "stada/products").trim();
const productImageSyncTimeoutMs = Number(process.env.PRODUCT_IMAGE_SYNC_TIMEOUT_MS || 5 * 60 * 1000);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendFile(response, filePath) {
  const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  };

  response.writeHead(200, {
    "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  response.end(fs.readFileSync(filePath));
}

function serveAdminFile(pathname, response) {
  if (!pathname.startsWith("/admin")) return false;

  let relativePath = pathname === "/admin" || pathname === "/admin/"
    ? "index.html"
    : decodeURIComponent(pathname.replace(/^\/admin\/?/, ""));
  relativePath = relativePath.replace(/\\/g, "/");
  if (!relativePath || relativePath.endsWith("/")) relativePath = `${relativePath}index.html`;

  const filePath = path.resolve(adminRoot, relativePath);
  const relativeToAdminRoot = path.relative(adminRoot, filePath);
  if (relativeToAdminRoot.startsWith("..") || path.isAbsolute(relativeToAdminRoot)) {
    sendJson(response, 403, {
      error: {
        code: "ADMIN_FILE_FORBIDDEN",
        message: "Admin file path is not allowed.",
      },
    });
    return true;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendJson(response, 404, {
      error: {
        code: "ADMIN_FILE_NOT_FOUND",
        message: "Admin file not found.",
      },
    });
    return true;
  }

  sendFile(response, filePath);
  return true;
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", chunk => {
      body += chunk;
      if (body.length > maxJsonBodyBytes) {
        reject(Object.assign(new Error("Request body is too large."), { statusCode: 413 }));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(Object.assign(new Error("Request body must be valid JSON."), { statusCode: 400 }));
      }
    });
    request.on("error", reject);
  });
}

function timingSafeEqualText(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function cleanupAdminSessions() {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (!session || session.expiresAt <= now) {
      adminSessions.delete(token);
    }
  }
}

function issueAdminToken() {
  cleanupAdminSessions();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + adminSessionTtlMs;
  adminSessions.set(token, { expiresAt });
  return {
    token,
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

function requireAdmin(request) {
  cleanupAdminSessions();
  const header = request.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1].trim() : "";
  const session = token ? adminSessions.get(token) : null;

  if (!session) {
    throw Object.assign(new Error("Admin authorization is required."), {
      statusCode: 401,
      code: "ADMIN_UNAUTHORIZED",
    });
  }
}

function assertCloudinaryConfigured() {
  if (cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret) return;
  throw Object.assign(new Error("Cloudinary upload is not configured on the backend."), {
    statusCode: 500,
    code: "CLOUDINARY_NOT_CONFIGURED",
  });
}

function sanitizePublicId(value) {
  return String(value || "hero-image")
    .replace(/\.[^.]+$/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "hero-image";
}

function sanitizeCloudinaryPathPart(value, fallback) {
  return String(value || fallback || "")
    .replace(/\.[^.]+$/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function makeStableCloudinaryPublicId({ country, page, imageId }) {
  const slot = sanitizeCloudinaryPathPart(imageId);
  if (!slot) return "";

  const countryPart = sanitizeCloudinaryPathPart(country, "site");
  const pagePart = sanitizeCloudinaryPathPart(page || adminEditablePagePath, "index");
  return [countryPart, pagePart, slot].filter(Boolean).join("/");
}

function makeStableProductCloudinaryPublicId({ productId, slot, imageId }) {
  const productPart = sanitizeCloudinaryPathPart(productId);
  if (!productPart) return "";

  const slotPart = sanitizeCloudinaryPathPart(slot || imageId, "card");
  return [productPart, slotPart].filter(Boolean).join("/");
}

function makeStableCloudinaryDeliveryUrl(publicId, format) {
  if (!publicId || !format) return "";
  return `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/${publicId}.${format}`;
}

function normalizePreferredImageFormat(value) {
  const format = String(value || "").trim().toLowerCase();
  if (format === "jpeg") return "jpg";
  return ["png", "jpg", "webp"].includes(format) ? format : "";
}

function makeCloudinarySignature(params) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return crypto.createHash("sha1").update(`${payload}${cloudinaryApiSecret}`).digest("hex");
}

async function uploadImageToCloudinary({ dataUrl, fileName, imageId, country, page, preferredFormat, context, productId, slot }) {
  assertCloudinaryConfigured();

  if (!/^data:image\/(?:png|jpe?g|webp|svg\+xml);base64,/i.test(String(dataUrl || ""))) {
    throw Object.assign(new Error("Upload must be a PNG, JPEG, WebP, or SVG image."), {
      statusCode: 400,
      code: "INVALID_IMAGE_UPLOAD",
    });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const isProductImage = String(context || "").trim().toLowerCase() === "product";
  const stablePublicId = isProductImage
    ? makeStableProductCloudinaryPublicId({ productId, slot, imageId })
    : makeStableCloudinaryPublicId({ country, page, imageId });
  const publicId = stablePublicId || `${sanitizePublicId(fileName)}-${timestamp}`;
  const folder = isProductImage ? cloudinaryProductUploadFolder : cloudinaryUploadFolder;
  const signedParams = {
    folder,
    public_id: publicId,
    timestamp,
    overwrite: "true",
    invalidate: "true",
  };
  const signature = makeCloudinarySignature(signedParams);
  const form = new FormData();
  form.append("file", dataUrl);
  form.append("api_key", cloudinaryApiKey);
  form.append("signature", signature);
  Object.entries(signedParams).forEach(([key, value]) => form.append(key, String(value)));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw Object.assign(new Error(payload.error?.message || "Cloudinary upload failed."), {
      statusCode: response.status,
      code: "CLOUDINARY_UPLOAD_FAILED",
    });
  }

  return {
    publicId: payload.public_id,
    secureUrl: stablePublicId
      ? makeStableCloudinaryDeliveryUrl(payload.public_id, normalizePreferredImageFormat(preferredFormat) || payload.format) || payload.secure_url
      : payload.secure_url,
    width: payload.width,
    height: payload.height,
    format: payload.format,
    bytes: payload.bytes,
  };
}

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
    normalized[field] = String(image?.[field] ?? "");
  });
  return normalized;
}

function normalizeSubmittedImageMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([id, image]) => [id, normalizeEditableImage(image)])
  );
}

function normalizeProductIdList(value, productCatalog) {
  const availableProductIds = new Set((productCatalog || []).map(product => product.id));
  const ids = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(
    ids
      .map(id => String(id || "").trim())
      .filter(id => availableProductIds.has(id))
  )].slice(0, 4);
}

function normalizeProductSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
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
    if (textValue) normalized[key] = textValue;
  }

  return normalized;
}

function normalizeProductSections(value) {
  const submitted = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const normalized = {};
  for (const language of ["ru", "kz"]) {
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
  for (const language of ["ru", "kz"]) {
    const translation = submitted[language] && typeof submitted[language] === "object" && !Array.isArray(submitted[language])
      ? submitted[language]
      : {};
    normalized[language] = {
      name: String(translation.name || fallbackName || "").trim(),
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
    const src = String(image.src || "").trim();
    const alt = String(image.alt || "").trim();
    const cloudinaryPublicId = String(image.cloudinaryPublicId || "").trim() || null;
    normalized[slot] = { src, cloudinaryPublicId, alt };
  }
  return syncProductImageSlots(normalized);
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

function normalizeProductPayload(body, routeId = "") {
  const submitted = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const slug = normalizeProductSlug(submitted.slug || submitted.id || routeId);
  const id = normalizeProductSlug(routeId || submitted.id || slug);
  const statuses = new Set(["draft", "published", "archived"]);
  const status = statuses.has(String(submitted.status || "").trim()) ? String(submitted.status).trim() : "draft";
  const fallbackName = submitted.translations?.ru?.name || submitted.translations?.kz?.name || slug;

  if (!id || !slug) {
    throw Object.assign(new Error("Product slug is required."), {
      statusCode: 400,
      code: "PRODUCT_SLUG_REQUIRED",
    });
  }

  return {
    id,
    slug,
    pagePath: String(submitted.pagePath || `products/${slug}.html`).trim(),
    status,
    sortOrder: Number.isFinite(Number(submitted.sortOrder)) ? Number(submitted.sortOrder) : 0,
    therapeuticAreaId: normalizeProductSlug(submitted.therapeuticAreaId) || null,
    accentColor: String(submitted.accentColor || "").trim() || null,
    isFeatured: Boolean(submitted.isFeatured),
    translations: normalizeProductTranslations(submitted.translations, fallbackName),
    images: normalizeProductImages(submitted.images),
    sections: normalizeProductSections(submitted.sections),
  };
}

function contentProductFromDatabaseProduct(product, language = "ru", areaLabels = new Map()) {
  const translation = product.translations?.[language]
    || product.translations?.ru
    || product.translations?.kz
    || {};
  const cardImage = getCanonicalProductImageFromSlots(product.images || {});
  const category = product.therapeuticAreaId || "";
  const therapeuticArea = areaLabels.get(category) || category;

  return {
    id: product.id,
    slug: product.slug || product.id,
    href: `products/product.html?slug=${encodeURIComponent(product.slug || product.id)}`,
    category,
    categoryClass: category,
    accent: product.accentColor || "",
    image: {
      id: cardImage.cloudinaryPublicId || "",
      src: cardImage.src || "",
      url: cardImage.src || "",
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

function productDetailPayloadFromDatabaseProduct(product, therapeuticAreas, country, language = "ru") {
  const areaLabels = buildTherapeuticAreaLabelMap(therapeuticAreas, language);
  const translation = getProductPayloadTranslation(product, language);
  const sections = getProductPayloadSections(product, language);
  const image = getCanonicalProductImageFromSlots(product.images || {});
  const images = product.images || {};
  const name = translation.name || product.slug || product.id;
  const benefits = coerceProductTextList(translation.benefits);
  const badges = coerceProductTextList(sections.hero?.badges, sections.overview?.badges).slice(0, 3);
  const category = product.therapeuticAreaId || "";
  const therapeuticArea = areaLabels.get(category) || category;
  const overviewIntro = sections.overview?.intro || translation.fullDescription || translation.shortDescription || "";
  const heroLead = sections.hero?.lead || translation.fullDescription || translation.shortDescription || overviewIntro;
  const formulaIntro = sections.formula?.intro || translation.composition || "";
  const formulaImage = images.formulaCenter?.src || sections.formula?.image || "";
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
  const formulaPoints = coerceProductObjectList(formulaPointFallback, facts.slice(0, 3)).slice(0, 3);
  const usageItems = coerceProductObjectList(sections.usage?.items, benefits.slice(0, 3).map((text, index) => ({
    title: `${index + 1}`,
    text,
  }))).slice(0, 3);
  const purchaseLinks = (Array.isArray(product.purchaseLinks) && product.purchaseLinks.length
    ? product.purchaseLinks
    : makeDefaultProductPurchaseLinks(name)
  ).map((link, index) => ({
    slot: link.slot || `link-${index + 1}`,
    label: link.label || link.slot || "",
    url: link.url || "",
    logoSrc: link.logoSrc || "",
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
      pagePath: product.pagePath,
      category,
      therapeuticArea,
      accent: product.accentColor || "",
      isFeatured: Boolean(product.isFeatured),
      name,
      shortDescription: translation.shortDescription || "",
      image: {
        src: image.src || "",
        url: image.src || "",
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

function buildTherapeuticAreaLabelMap(areas, language = "ru") {
  return new Map((areas || []).map(area => {
    const translation = area.translations?.[language]
      || area.translations?.ru
      || area.translations?.kz
      || {};
    return [area.id, translation.name || area.id];
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

function normalizePayloadProductIds(value, productCatalog) {
  const availableProductIds = new Set((productCatalog || []).map(product => product.id));
  const ids = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(
    ids
      .map(id => String(id || "").trim())
      .filter(id => availableProductIds.has(id))
  )];
}

function syncPayloadHomeProducts(payload) {
  const catalog = payload.content?.productCatalog || [];
  payload.content.settings ||= {};
  const selectedIds = normalizePayloadProductIds(payload.content.settings.homeProducts, catalog);
  const fallbackIds = catalog.map(product => product.id).filter(Boolean);
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
  if (!productCount) return;
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
    return normalizeComparableProductPath(product.pagePath || `products/${product.slug || product.id}.html`) === pagePath
      || normalizeProductSlug(product.slug) === pageSlug
      || normalizeProductSlug(product.id) === pageSlug;
  }) || null;
}

function getProductPayloadTranslation(product, language = "ru") {
  return product.translations?.[language]
    || product.translations?.ru
    || product.translations?.kz
    || {};
}

function getProductPayloadSections(product, language = "ru") {
  return product.sections?.[language]
    || product.sections?.ru
    || product.sections?.kz
    || {};
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
  const src = String(image?.src || "").trim();
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
  const databaseProducts = (products || [])
    .filter(product => product.status !== "archived")
    .map(product => contentProductFromDatabaseProduct(product, payload.language, areaLabels));
  if (!databaseProducts.length) return payload;

  const databaseProductsById = new Map(databaseProducts.map(product => [product.id, product]));
  const staticCatalog = payload.content.productCatalog || [];
  const staticIds = new Set(staticCatalog.map(product => product.id));
  payload.content.productCatalog = [
    ...staticCatalog.map(product => {
      const databaseProduct = databaseProductsById.get(product.id);
      return databaseProduct ? mergeContentProduct(product, databaseProduct) : product;
    }),
    ...databaseProducts.filter(product => !staticIds.has(product.id)),
  ];
  syncPayloadHomeProducts(payload);
  syncPayloadProductMetrics(payload);
  applyDatabaseProductDetailToPayload(payload, products);
  return payload;
}

function isAbsoluteImageSource(src) {
  return /^(?:https?:)?\/\//i.test(String(src || "")) || /^data:/i.test(String(src || ""));
}

function staticCatalogFallbacksByLanguage(country) {
  const languages = ["ru", "kz"];
  const fallbacks = {};

  for (const language of languages) {
    try {
      const payload = getPagePayload({
        country,
        lang: language,
        page: adminEditablePagePath,
        applyOverrides: false,
      });
      fallbacks[language] = new Map(
        (payload.content?.productCatalog || []).map(product => [product.id, product])
      );
    } catch (error) {
      fallbacks[language] = new Map();
    }
  }

  return fallbacks;
}

function getPayloadDomTextValue(payload, id) {
  return (payload.content?.dom?.text || []).find(item => item.id === id)?.value || "";
}

function getPayloadDomImageValue(payload, id) {
  return (payload.content?.dom?.images || []).find(item => item.id === id) || null;
}

function getPayloadTextKeysInOrder(payload) {
  const keys = [];
  for (const section of payload.content?.sections || []) {
    for (const item of section.translatedTexts || []) {
      if (item?.key) keys.push(item.key);
    }
  }

  for (const key of Object.keys(payload.content?.text || {})) {
    if (!keys.includes(key)) keys.push(key);
  }

  return keys;
}

function collectTextValuesByPrefix(text, orderedKeys, prefix) {
  return orderedKeys
    .filter(key => key.startsWith(prefix))
    .map(key => text[key])
    .filter(Boolean);
}

function collectProductCardItems(text, orderedKeys, keyPrefix, values = []) {
  const cards = new Map();
  orderedKeys.forEach(key => {
    const value = text[key];
    const match = key.match(new RegExp(`^${keyPrefix}_card_(.+)_(title|text)$`));
    if (!match || !String(value || "").trim()) return;
    const [, id, field] = match;
    cards.set(id, {
      ...(cards.get(id) || {}),
      [field === "title" ? "title" : "text"]: value,
    });
  });

  return [...cards.values()]
    .map((card, index) => ({
      value: values[index] || "",
      title: card.title || "",
      text: card.text || "",
    }))
    .filter(card => card.value || card.title || card.text);
}

function collectProductMetricItems(text, orderedKeys, keyPrefix, values = []) {
  return orderedKeys
    .filter(key => key.startsWith(`${keyPrefix}_metric_`))
    .map((key, index) => ({
      value: values[index] || "",
      title: text[key] || "",
      text: "",
    }))
    .filter(metric => metric.value || metric.title);
}

function collectProductUsageItems(text, orderedKeys, keyPrefix) {
  const items = new Map();
  orderedKeys.forEach(key => {
    const value = text[key];
    const match = key.match(new RegExp(`^${keyPrefix}_usage_(.+)_(title|text)$`));
    if (!match || !String(value || "").trim()) return;
    const [, id, field] = match;
    items.set(id, {
      ...(items.get(id) || {}),
      [field === "title" ? "title" : "text"]: value,
    });
  });

  return [...items.values()].filter(item => item.title || item.text);
}

function collectProductFormulaItems(text, orderedKeys, keyPrefix, imageSlots = []) {
  return orderedKeys
    .filter(key => key.startsWith(`${keyPrefix}_formula_`) && key.endsWith("_text"))
    .map((key, index) => ({
      title: "",
      text: text[key] || "",
      imageSrc: imageSlots[index]?.url || imageSlots[index]?.src || "",
      imageAlt: imageSlots[index]?.alt || "",
    }))
    .filter(item => item.text || item.imageSrc);
}

function getProductDetailFallbackFromPayload(payload) {
  const keyPrefix = findProductDetailKeyPrefix(payload);
  const domBase = productDomBaseFromPagePath(payload.page?.path);
  const text = payload.content?.text || {};
  const orderedTextKeys = getPayloadTextKeysInOrder(payload);

  if (keyPrefix) {
    const benefitKeys = orderedTextKeys
      .filter(key => key.startsWith(`${keyPrefix}_benefit`))
      .sort((left, right) => Number(left.match(/(\d+)$/)?.[1] || 0) - Number(right.match(/(\d+)$/)?.[1] || 0));
    return {
      translation: {
        name: text[`${keyPrefix}_page_title`] || text[`${keyPrefix}_name`] || "",
        fullDescription: text[`${keyPrefix}_page_desc`] || "",
        composition: text[`${keyPrefix}_formula_intro`] || "",
        usageText: text[`${keyPrefix}_note_text`] || "",
        benefits: benefitKeys.map(key => text[key]).filter(Boolean),
      },
      sections: {
        hero: {
          kicker: text[`${keyPrefix}_kicker`] || "",
          lead: text[`${keyPrefix}_page_desc`] || "",
          badges: collectTextValuesByPrefix(text, orderedTextKeys, `${keyPrefix}_badge_`),
          metrics: collectProductMetricItems(text, orderedTextKeys, keyPrefix, [6, 7, 8]
            .map(number => getPayloadDomTextValue(payload, `products_${domBase}_text_${String(number).padStart(3, "0")}`))),
        },
        overview: {
          label: text[`${keyPrefix}_overview_label`] || "",
          heading: text[`${keyPrefix}_overview_heading`] || "",
          intro: text[`${keyPrefix}_overview_intro`] || "",
          facts: collectProductCardItems(text, orderedTextKeys, keyPrefix, [9, 10, 11, 12]
            .map(number => getPayloadDomTextValue(payload, `products_${domBase}_text_${String(number).padStart(3, "0")}`))),
        },
        formula: {
          label: text[`${keyPrefix}_formula_label`] || "",
          heading: text[`${keyPrefix}_formula_heading`] || "",
          intro: text[`${keyPrefix}_formula_intro`] || "",
          image: getPayloadDomImageValue(payload, `products_${domBase}_image_003`)?.url
            || getPayloadDomImageValue(payload, `products_${domBase}_image_003`)?.src
            || "",
          points: collectProductFormulaItems(text, orderedTextKeys, keyPrefix, [4, 5, 6]
            .map(number => getPayloadDomImageValue(payload, `products_${domBase}_image_${String(number).padStart(3, "0")}`))),
        },
        usage: {
          label: text[`${keyPrefix}_usage_label`] || "",
          heading: text[`${keyPrefix}_usage_heading`] || "",
          items: collectProductUsageItems(text, orderedTextKeys, keyPrefix),
        },
        note: {
          title: text[`${keyPrefix}_note_title`] || "",
          text: text[`${keyPrefix}_note_text`] || "",
        },
        buy: { intro: text[`${keyPrefix}_buy_intro`] || "" },
      },
      detailHeroImage: getPayloadDomImageValue(payload, `products_${domBase}_image_002`),
    };
  }

  return {
    translation: {
      name: getPayloadDomTextValue(payload, `products_${domBase}_text_003`),
      fullDescription: getPayloadDomTextValue(payload, `products_${domBase}_text_004`),
      composition: getPayloadDomTextValue(payload, `products_${domBase}_text_036`),
      usageText: getPayloadDomTextValue(payload, `products_${domBase}_text_055`),
      benefits: [29, 30, 31, 32, 33]
        .map(number => getPayloadDomTextValue(payload, `products_${domBase}_text_${String(number).padStart(3, "0")}`))
        .filter(Boolean),
    },
    sections: {
      hero: { lead: getPayloadDomTextValue(payload, `products_${domBase}_text_004`) },
      overview: { intro: getPayloadDomTextValue(payload, `products_${domBase}_text_016`) },
      formula: { intro: getPayloadDomTextValue(payload, `products_${domBase}_text_036`) },
      usage: { heading: getPayloadDomTextValue(payload, `products_${domBase}_text_047`) },
      note: { text: getPayloadDomTextValue(payload, `products_${domBase}_text_055`) },
      buy: { intro: getPayloadDomTextValue(payload, `products_${domBase}_text_056`) },
    },
    detailHeroImage: getPayloadDomImageValue(payload, `products_${domBase}_image_002`),
  };
}

function mergeMissingProductSectionContent(current = {}, fallback = {}) {
  const merged = {};
  for (const key of Object.keys({ ...fallback, ...current })) {
    const currentValue = current[key];
    const fallbackValue = fallback[key];

    if (Array.isArray(currentValue) && currentValue.length) {
      merged[key] = currentValue;
    } else if (Array.isArray(fallbackValue)) {
      merged[key] = fallbackValue;
    } else if (currentValue && typeof currentValue === "object") {
      merged[key] = currentValue;
    } else if (fallbackValue && typeof fallbackValue === "object") {
      merged[key] = fallbackValue;
    } else {
      merged[key] = String(currentValue || "").trim() || String(fallbackValue || "").trim();
    }
  }
  return merged;
}

function applyStaticProductDetailFallbacks(products, country) {
  const languages = ["ru", "kz"];
  return (products || []).map(product => {
    const nextProduct = {
      ...product,
      translations: { ...(product.translations || {}) },
      images: { ...(product.images || {}) },
      sections: {
        ru: { ...(product.sections?.ru || {}) },
        kz: { ...(product.sections?.kz || {}) },
      },
    };

    for (const language of languages) {
      let fallback;
      try {
        fallback = getProductDetailFallbackFromPayload(getPagePayload({
          country,
          lang: language,
          page: product.pagePath || `products/${product.slug || product.id}.html`,
          applyOverrides: false,
        }));
      } catch (error) {
        continue;
      }

      const currentTranslation = nextProduct.translations[language] || {};
      nextProduct.translations[language] = {
        ...currentTranslation,
        name: currentTranslation.name || fallback.translation.name || product.slug || product.id,
        fullDescription: currentTranslation.fullDescription || fallback.translation.fullDescription || "",
        composition: currentTranslation.composition || fallback.translation.composition || "",
        usageText: currentTranslation.usageText || fallback.translation.usageText || "",
        benefits: Array.isArray(currentTranslation.benefits) && currentTranslation.benefits.length
          ? currentTranslation.benefits
          : fallback.translation.benefits || [],
      };

      nextProduct.sections[language] ||= {};
      for (const [sectionType, content] of Object.entries(fallback.sections || {})) {
        nextProduct.sections[language][sectionType] = mergeMissingProductSectionContent(
          nextProduct.sections[language][sectionType] || {},
          content
        );
      }

      if (language === "ru" && fallback.detailHeroImage && !nextProduct.images.detailHero?.src) {
        nextProduct.images.detailHero = {
          ...(nextProduct.images.detailHero || {}),
          src: fallback.detailHeroImage.url || fallback.detailHeroImage.src || "",
          alt: nextProduct.images.detailHero?.alt || fallback.detailHeroImage.alt || currentTranslation.name || product.id,
        };
      }
    }

    nextProduct.images = syncProductImageSlots(nextProduct.images);
    return nextProduct;
  });
}

function applyStaticProductFallbacks(products, country, options = {}) {
  const fallbacks = staticCatalogFallbacksByLanguage(country);
  const catalogProducts = (products || []).map(product => {
    const nextProduct = {
      ...product,
      translations: { ...(product.translations || {}) },
      images: { ...(product.images || {}) },
      sections: {
        ru: { ...(product.sections?.ru || {}) },
        kz: { ...(product.sections?.kz || {}) },
      },
    };

    for (const language of Object.keys(fallbacks)) {
      const fallback = fallbacks[language].get(product.id);
      if (!fallback) continue;

      const currentTranslation = nextProduct.translations[language] || {};
      nextProduct.translations[language] = {
        ...currentTranslation,
        name: currentTranslation.name || fallback.name || product.id,
        shortDescription: currentTranslation.shortDescription || fallback.shortDescription || "",
      };
    }

    const ruFallback = fallbacks.ru.get(product.id);
    const cardImage = nextProduct.images.card || {};
    if (ruFallback?.image && (!cardImage.src || !isAbsoluteImageSource(cardImage.src))) {
      nextProduct.images.card = {
        ...cardImage,
        src: ruFallback.image.url || ruFallback.image.src || cardImage.src || "",
        alt: cardImage.alt || ruFallback.image.alt || ruFallback.name || product.id,
      };
    }

    nextProduct.images = syncProductImageSlots(nextProduct.images);
    return nextProduct;
  });
  return options.includeDetailFallbacks
    ? applyStaticProductDetailFallbacks(catalogProducts, country)
    : catalogProducts;
}

async function attachDatabaseProductsToPayload(payload) {
  try {
    const [products, therapeuticAreas] = await Promise.all([
      listProducts(),
      listTherapeuticAreas(),
    ]);
    applyDatabaseProductsToPayload(payload, products, therapeuticAreas);
  } catch (error) {
    if (error.code !== "DATABASE_URL_MISSING") throw error;
  }
  return payload;
}

async function attachEditableProductCatalog(editable) {
  try {
    const [products, therapeuticAreas] = await Promise.all([
      listProducts(),
      listTherapeuticAreas(),
    ]);
    const areaLabels = buildTherapeuticAreaLabelMap(therapeuticAreas, editable.language);
    editable.productCatalog = applyStaticProductFallbacks(products, editable.country?.id)
      .filter(product => product.status !== "archived")
      .map(product => contentProductFromDatabaseProduct(product, editable.language, areaLabels));
  } catch (error) {
    if (error.code !== "DATABASE_URL_MISSING") throw error;
  }
  return editable;
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
  const text = {};
  const domText = {};
  const domImages = {};
  const settings = {};

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
    const value = normalizeProductIdList(submittedSettings.homeProducts, productCatalog);
    const baseValue = normalizeProductIdList(basePayload.content?.settings?.homeProducts || [], productCatalog);
    submittedSettingKeys.push("homeProducts");
    if (!sameStringArray(value, baseValue)) {
      settings.homeProducts = value;
    }
  }

  return {
    text,
    domText,
    domImages,
    settings,
    submittedTextKeys,
    submittedDomTextIds,
    submittedDomImageIds,
    submittedSettingKeys: submittedSettingKeys.length ? submittedSettingKeys : null,
  };
}

function routeCountryFromHomepagePath(pathname) {
  const match = pathname.match(/^\/api\/homepage\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function routeCountryFromPagePath(pathname) {
  const match = pathname.match(/^\/api\/page\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function routeProductSlugFromAdminPath(pathname) {
  const match = pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function routeProductSlugFromPublicPath(pathname) {
  const match = pathname.match(/^\/api\/products\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function runProductImageCloudinarySync() {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, "..", "scripts", "sync-product-images-to-cloudinary.js");
    const child = childProcess.spawn(process.execPath, [scriptPath], {
      cwd: path.resolve(__dirname, ".."),
      env: process.env,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    let finished = false;

    const timer = setTimeout(() => {
      if (finished) return;
      child.kill("SIGTERM");
      reject(Object.assign(new Error("Cloudinary image sync timed out."), {
        statusCode: 504,
        code: "PRODUCT_IMAGE_SYNC_TIMEOUT",
      }));
    }, productImageSyncTimeoutMs);

    child.stdout.on("data", chunk => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", chunk => {
      stderr += chunk.toString();
    });
    child.on("error", error => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", code => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(Object.assign(new Error(stderr || stdout || `Cloudinary image sync failed with exit code ${code}.`), {
        statusCode: 500,
        code: "PRODUCT_IMAGE_SYNC_FAILED",
      }));
    });
  });
}

async function handleRequest(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
  const pathname = requestUrl.pathname.replace(/\/+$/, "") || "/";

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  try {
    if (request.method === "GET" && pathname === "/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    if (request.method === "GET" && pathname === "/health/db") {
      const database = await checkDatabaseConnection();
      sendJson(response, 200, {
        status: "ok",
        database,
      });
      return;
    }

    if (request.method === "GET" && pathname.startsWith("/admin")) {
      serveAdminFile(pathname, response);
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/login") {
      const body = await readJsonBody(request);
      const isValidLogin = timingSafeEqualText(body.login || body.username, adminLogin);
      const isValidPassword = timingSafeEqualText(body.password, adminPassword);

      if (!isValidLogin || !isValidPassword) {
        sendJson(response, 401, {
          error: {
            code: "INVALID_ADMIN_CREDENTIALS",
            message: "Invalid admin login or password.",
          },
        });
        return;
      }

      sendJson(response, 200, {
        status: "ok",
        session: issueAdminToken(),
      });
      return;
    }

    if (request.method === "GET" && pathname === "/api/admin/content") {
      requireAdmin(request);
      const country = requestUrl.searchParams.get("country");
      const lang = requestUrl.searchParams.get("lang") || requestUrl.searchParams.get("language");
      const page = adminEditablePagePath;
      const basePayload = getPagePayload({ country, lang, page, applyOverrides: false });
      const currentPayload = getPagePayload({ country, lang: basePayload.language, page: basePayload.page.path });
      const editable = buildEditableContent(basePayload, currentPayload);
      await attachEditableProductCatalog(editable);

      sendJson(response, 200, {
        countries: listCountries(),
        editable,
      });
      return;
    }

    if (request.method === "GET" && pathname === "/api/admin/products") {
      requireAdmin(request);
      const country = requestUrl.searchParams.get("country") || requestUrl.searchParams.get("countryId");
      sendJson(response, 200, {
        products: applyStaticProductFallbacks(await listProducts(), country),
        therapeuticAreas: await listTherapeuticAreas(),
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/products/import-from-site") {
      requireAdmin(request);
      const result = await importProductsFromSite();
      sendJson(response, 200, {
        status: "imported",
        ...result,
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/products/sync-cloudinary-images") {
      requireAdmin(request);
      const result = await runProductImageCloudinarySync();
      sendJson(response, 200, {
        status: "synced",
        ...result,
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/products") {
      requireAdmin(request);
      const body = await readJsonBody(request);
      const product = await upsertProduct(normalizeProductPayload(body));
      sendJson(response, 201, {
        status: "saved",
        product,
      });
      return;
    }

    if (request.method === "PUT" && pathname.startsWith("/api/admin/products/")) {
      requireAdmin(request);
      const body = await readJsonBody(request);
      const product = await upsertProduct(normalizeProductPayload(body, routeProductSlugFromAdminPath(pathname)));
      sendJson(response, 200, {
        status: "saved",
        product,
      });
      return;
    }

    if (request.method === "DELETE" && pathname.startsWith("/api/admin/products/")) {
      requireAdmin(request);
      const deleted = await deleteProduct(routeProductSlugFromAdminPath(pathname));
      if (!deleted) {
        sendJson(response, 404, {
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product was not found.",
          },
        });
        return;
      }
      sendJson(response, 200, { status: "deleted" });
      return;
    }

    if (request.method === "GET" && pathname.startsWith("/api/admin/products/")) {
      requireAdmin(request);
      const product = await getProduct(routeProductSlugFromAdminPath(pathname));
      if (!product) {
        sendJson(response, 404, {
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product was not found.",
          },
        });
        return;
      }
      const country = requestUrl.searchParams.get("country") || requestUrl.searchParams.get("countryId");
      sendJson(response, 200, {
        product: applyStaticProductFallbacks([product], country, { includeDetailFallbacks: true })[0],
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/upload-image") {
      requireAdmin(request);
      const body = await readJsonBody(request);
      const image = await uploadImageToCloudinary({
        dataUrl: body.dataUrl,
        fileName: body.fileName,
        imageId: body.imageId,
        country: body.country || body.countryId,
        page: body.page,
        preferredFormat: body.preferredFormat,
        context: body.context,
        productId: body.productId,
        slot: body.slot,
      });

      sendJson(response, 200, {
        status: "uploaded",
        image,
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/content") {
      requireAdmin(request);
      const body = await readJsonBody(request);
      const page = adminEditablePagePath;
      const basePayload = getPagePayload({
        country: body.country || body.countryId,
        lang: body.lang || body.language,
        page,
        applyOverrides: false,
      });
      const overrides = buildChangedOverrides(basePayload, body);
      const savedOverrides = savePageOverrides({
        countryId: basePayload.country.id,
        language: basePayload.language,
        pagePath: basePayload.page.path,
        ...overrides,
      });
      const currentPayload = getPagePayload({
        country: basePayload.country.id,
        lang: basePayload.language,
        page: basePayload.page.path,
      });

      sendJson(response, 200, {
        status: "saved",
        overrides: savedOverrides,
        editable: await attachEditableProductCatalog(buildEditableContent(basePayload, currentPayload)),
      });
      return;
    }

    if (request.method === "GET" && pathname === "/api/countries") {
      sendJson(response, 200, { countries: listCountries() });
      return;
    }

    if (request.method === "GET" && pathname.startsWith("/api/products/")) {
      const slug = routeProductSlugFromPublicPath(pathname);
      const country = requestUrl.searchParams.get("country") || requestUrl.searchParams.get("countryId") || "kazakhstan";
      const lang = requestUrl.searchParams.get("lang") || requestUrl.searchParams.get("language") || "ru";
      const product = await getProduct(slug);
      if (!product || product.status === "archived") {
        sendJson(response, 404, {
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product was not found.",
          },
        });
        return;
      }

      const enrichedProduct = applyStaticProductFallbacks([product], country, { includeDetailFallbacks: true })[0];
      sendJson(response, 200, productDetailPayloadFromDatabaseProduct(
        enrichedProduct,
        await listTherapeuticAreas(),
        getPagePayload({ country, lang, page: "index.html" }).country,
        lang
      ));
      return;
    }

    if (request.method === "GET" && (pathname === "/api/homepage" || pathname.startsWith("/api/homepage/"))) {
      const payload = getHomepagePayload({
        country: routeCountryFromHomepagePath(pathname) || requestUrl.searchParams.get("country"),
        lang: requestUrl.searchParams.get("lang") || requestUrl.searchParams.get("language"),
      });
      sendJson(response, 200, await attachDatabaseProductsToPayload(payload));
      return;
    }

    if (request.method === "GET" && (pathname === "/api/page" || pathname.startsWith("/api/page/"))) {
      const payload = getPagePayload({
        country: routeCountryFromPagePath(pathname) || requestUrl.searchParams.get("country"),
        lang: requestUrl.searchParams.get("lang") || requestUrl.searchParams.get("language"),
        page: requestUrl.searchParams.get("page") || requestUrl.searchParams.get("path"),
      });
      sendJson(response, 200, await attachDatabaseProductsToPayload(payload));
      return;
    }

    if (request.method === "POST" && pathname === "/api/homepage") {
      const body = await readJsonBody(request);
      const payload = getHomepagePayload({
        country: body.country || body.countryId,
        lang: body.lang || body.language,
      });
      sendJson(response, 200, await attachDatabaseProductsToPayload(payload));
      return;
    }

    if (request.method === "POST" && pathname === "/api/page") {
      const body = await readJsonBody(request);
      const payload = getPagePayload({
        country: body.country || body.countryId,
        lang: body.lang || body.language,
        page: body.page || body.path,
      });
      sendJson(response, 200, await attachDatabaseProductsToPayload(payload));
      return;
    }

    if (request.method === "GET" && pathname === "/") {
      sendJson(response, 200, {
        service: "stada-country-content-backend",
        endpoints: [
          "GET /health",
          "GET /health/db",
          "GET /api/countries",
          "GET /api/homepage?country=kazakhstan&lang=ru",
          "GET /api/homepage/kazakhstan?lang=kz",
          "GET /api/homepage/kyrgyzstan?lang=kg",
          "GET /api/page/kg?lang=kg&page=products/coldrex.html",
          "GET /api/products/coldrex?country=kazakhstan&lang=ru",
          "POST /api/homepage { country, lang }",
          "POST /api/page { country, lang, page }",
          "GET /admin",
          "POST /api/admin/login { login, password }",
          "GET /api/admin/content?country=kazakhstan&lang=ru",
          "POST /api/admin/content { country, lang, text, domText, domImages }",
          "GET /api/admin/products",
          "POST /api/admin/products",
          "POST /api/admin/products/import-from-site",
          "POST /api/admin/products/sync-cloudinary-images",
          "GET /api/admin/products/:slug",
          "PUT /api/admin/products/:slug",
          "DELETE /api/admin/products/:slug",
        ],
      });
      return;
    }

    sendJson(response, 404, {
      error: {
        code: "NOT_FOUND",
        message: "Endpoint not found.",
      },
    });
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message,
        knownCountries: error.knownCountries,
      },
    });
  }
}

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(port, host, () => {
    console.log(`STADA country content backend listening on port ${port}`);
  });
}

module.exports = { server };
