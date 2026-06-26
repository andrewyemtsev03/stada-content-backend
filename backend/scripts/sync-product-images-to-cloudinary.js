const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { query } = require("../src/db/client");

const backendRoot = path.resolve(__dirname, "..");
const contentRoot = path.join(backendRoot, "content", "main");
const defaultAssetsRoot = path.join(backendRoot, "assets");
const assetsRoot = path.resolve(process.env.PRODUCT_ASSETS_ROOT || defaultAssetsRoot);
const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = String(process.env.CLOUDINARY_API_SECRET || "").trim();
const uploadFolder = String(process.env.CLOUDINARY_PRODUCT_UPLOAD_FOLDER || "stada/products").trim();

const imageSlots = {
  image_002: "detailHero",
  image_003: "formulaCenter",
  image_004: "formulaPointActive",
  image_005: "formulaPointSeawater",
  image_006: "formulaPointFormat",
};

function assertConfigured() {
  const missing = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getAttributeValue(source, name) {
  const match = String(source || "").match(new RegExp(`\\s${name}=["']([^"']*)["']`, "i"));
  return match ? match[1].trim() : "";
}

function makeSignature(params) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

function resolveAssetPath(src) {
  const normalized = String(src || "")
    .replace(/\\/g, "/")
    .replace(/^(\.\/|\.\.\/)+/, "")
    .replace(/^assets\//, "");
  const filePath = path.resolve(assetsRoot, normalized);
  const relativePath = path.relative(assetsRoot, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return "";
  return filePath;
}

function mimeTypeForFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".svg") return "image/svg+xml";
  return "image/png";
}

async function uploadImage({ filePath, productId, slot }) {
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${normalizeSlug(productId)}/${normalizeSlug(slot)}`;
  const signedParams = {
    folder: uploadFolder,
    public_id: publicId,
    timestamp,
    overwrite: "true",
    invalidate: "true",
  };
  const signature = makeSignature(signedParams);
  const dataUrl = `data:${mimeTypeForFile(filePath)};base64,${fs.readFileSync(filePath).toString("base64")}`;
  const form = new FormData();
  form.append("file", dataUrl);
  form.append("api_key", apiKey);
  form.append("signature", signature);
  Object.entries(signedParams).forEach(([key, value]) => form.append(key, String(value)));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || `Cloudinary upload failed for ${filePath}`);
  }
  return payload;
}

function productIdFromFile(fileName) {
  return fileName.replace(/\.html$/i, "");
}

function parseProductImages(fileName) {
  const productId = productIdFromFile(fileName);
  const html = fs.readFileSync(path.join(contentRoot, "products", fileName), "utf8");
  const domBase = productId.replace(/[^a-z0-9]+/gi, "_");
  const images = [];

  for (const [suffix, slot] of Object.entries(imageSlots)) {
    const pattern = new RegExp(`<img\\b[^>]*data-backend-image-id=["']products_${domBase}_${suffix}["'][^>]*>`, "i");
    const imageTag = html.match(pattern)?.[0] || "";
    const src = getAttributeValue(imageTag, "src");
    if (!src) continue;
    const filePath = resolveAssetPath(src);
    if (!filePath || !fs.existsSync(filePath)) continue;
    images.push({
      productId,
      slot,
      filePath,
      alt: getAttributeValue(imageTag, "alt") || "",
    });
  }

  return images;
}

async function upsertProductImage({ productId, slot, uploaded, alt }) {
  await query(`
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
    productId,
    slot,
    uploaded.secure_url,
    uploaded.public_id || null,
    alt || "",
  ]);
}

async function main() {
  assertConfigured();
  const productsDir = path.join(contentRoot, "products");
  const productFiles = fs.readdirSync(productsDir)
    .filter(file => file.endsWith(".html") && file !== "index.html")
    .sort();
  const images = productFiles.flatMap(parseProductImages);

  let uploadedCount = 0;
  for (const image of images) {
    const uploaded = await uploadImage(image);
    await upsertProductImage({ ...image, uploaded });
    uploadedCount += 1;
    console.log(`Uploaded ${image.productId}/${image.slot}: ${uploaded.secure_url}`);
  }

  console.log(`Synced ${uploadedCount} product image(s) to Cloudinary.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
