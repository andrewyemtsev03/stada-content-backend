const crypto = require("node:crypto");
const { transliterateSlugText } = require("../products/validation");

const cloudinaryCloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const cloudinaryApiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();
const cloudinaryApiSecret = String(process.env.CLOUDINARY_API_SECRET || "").trim();
const cloudinaryUploadFolder = String(process.env.CLOUDINARY_UPLOAD_FOLDER || "stada/hero").trim();
const cloudinaryProductUploadFolder = String(process.env.CLOUDINARY_PRODUCT_UPLOAD_FOLDER || "stada/products").trim();
const defaultAdminPagePath = "index.html";

function assertCloudinaryConfigured() {
  if (cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret) return;
  throw Object.assign(new Error("Cloudinary upload is not configured on the backend."), {
    statusCode: 500,
    code: "CLOUDINARY_NOT_CONFIGURED",
  });
}

function sanitizePublicId(value) {
  return transliterateSlugText(value || "hero-image")
    .replace(/\.[^.]+$/, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "hero-image";
}

function sanitizeCloudinaryPathPart(value, fallback) {
  return transliterateSlugText(value || fallback || "")
    .replace(/\.[^.]+$/, "")
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function makeStableCloudinaryPublicId({ country, page, imageId }) {
  const slot = sanitizeCloudinaryPathPart(imageId);
  if (!slot) return "";

  const countryPart = sanitizeCloudinaryPathPart(country, "site");
  const pagePart = sanitizeCloudinaryPathPart(page || defaultAdminPagePath, "index");
  return [countryPart, pagePart, slot].filter(Boolean).join("/");
}

function makeStableProductCloudinaryPublicId({ country, productId, slot, imageId }) {
  const productPart = sanitizeCloudinaryPathPart(productId);
  if (!productPart) return "";

  const countryPart = sanitizeCloudinaryPathPart(country, "site");
  const slotPart = sanitizeCloudinaryPathPart(slot || imageId, "card");
  return [countryPart, productPart, slotPart].filter(Boolean).join("/");
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

  if (!/^data:image\/(?:png|jpe?g|webp);base64,/i.test(String(dataUrl || ""))) {
    throw Object.assign(new Error("Upload must be a PNG, JPEG, or WebP image."), {
      statusCode: 400,
      code: "INVALID_IMAGE_UPLOAD",
    });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const isProductImage = String(context || "").trim().toLowerCase() === "product";
  const stablePublicId = isProductImage
    ? makeStableProductCloudinaryPublicId({ country, productId, slot, imageId })
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

module.exports = {
  uploadImageToCloudinary,
};
