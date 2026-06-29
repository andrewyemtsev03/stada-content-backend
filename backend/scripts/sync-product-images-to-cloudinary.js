const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const backendRoot = path.resolve(__dirname, "..");
const contentRoot = path.join(backendRoot, "content", "main");
const defaultAssetsRoot = path.join(backendRoot, "assets");
const assetsRoots = String(process.env.PRODUCT_ASSETS_ROOT || defaultAssetsRoot)
  .split(path.delimiter)
  .map(item => item.trim())
  .filter(Boolean)
  .map(item => path.resolve(item));
const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = String(process.env.CLOUDINARY_API_SECRET || "").trim();
const uploadFolder = String(process.env.CLOUDINARY_PRODUCT_UPLOAD_FOLDER || "stada/products").trim();
const dryRun = ["1", "true", "yes"].includes(
  String(process.env.PRODUCT_IMAGE_SYNC_DRY_RUN || process.env.DRY_RUN || "").trim().toLowerCase()
);
const overwriteExistingCloudinary = ["1", "true", "yes"].includes(
  String(process.env.PRODUCT_IMAGE_SYNC_OVERWRITE_CLOUDINARY || process.env.PRODUCT_IMAGE_SYNC_FORCE || "").trim().toLowerCase()
);
const checkDatabaseInDryRun = ["1", "true", "yes"].includes(
  String(process.env.PRODUCT_IMAGE_SYNC_CHECK_DATABASE || "").trim().toLowerCase()
);
const logLimit = Number.parseInt(process.env.PRODUCT_IMAGE_SYNC_LOG_LIMIT || "40", 10);

const imageSlots = {
  image_002: "detailHero",
  image_003: "formulaCenter",
  image_004: "formulaPointActive",
  image_005: "formulaPointSeawater",
  image_006: "formulaPointFormat",
};

let dbQuery = null;

function getDbQuery() {
  if (!dbQuery) {
    dbQuery = require("../src/db/client").query;
  }
  return dbQuery;
}

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
    .replace(/[?#].*$/, "")
    .replace(/^(\.\/|\.\.\/)+/, "")
    .replace(/^assets\//, "");

  for (const assetsRoot of assetsRoots) {
    const filePath = path.resolve(assetsRoot, normalized);
    const relativePath = path.relative(assetsRoot, filePath);
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) continue;
    if (fs.existsSync(filePath)) return filePath;
  }

  return "";
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

function existingImageKey(productId, slot) {
  return `${productId}\0${slot}`;
}

function isCloudinaryImage(image) {
  return Boolean(
    image?.cloudinary_public_id ||
    /(^|\/\/)res\.cloudinary\.com\//i.test(String(image?.src || "")) ||
    /cloudinary\.com/i.test(String(image?.src || ""))
  );
}

function parseProductImages(fileName) {
  const productId = productIdFromFile(fileName);
  const html = fs.readFileSync(path.join(contentRoot, "products", fileName), "utf8");
  const domBase = productId.replace(/[^a-z0-9]+/gi, "_");
  const images = [];
  const skipped = [];

  for (const [suffix, slot] of Object.entries(imageSlots)) {
    const pattern = new RegExp(`<img\\b[^>]*data-backend-image-id=["']products_${domBase}_${suffix}["'][^>]*>`, "i");
    const imageTag = html.match(pattern)?.[0] || "";
    const src = getAttributeValue(imageTag, "src");
    if (!src) continue;
    const filePath = resolveAssetPath(src);
    if (!filePath) {
      skipped.push({ productId, slot, src, reason: "local file not found" });
      continue;
    }
    images.push({
      productId,
      slot,
      filePath,
      alt: getAttributeValue(imageTag, "alt") || "",
    });
  }

  return { images, skipped };
}

async function upsertProductImage({ productId, slot, uploaded, alt }) {
  await getDbQuery()(`
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

async function listExistingProductImages(productIds) {
  if (!productIds.length) return new Map();

  const result = await getDbQuery()(`
    select product_id, slot, src, cloudinary_public_id
    from product_images
    where product_id = any($1::text[])
  `, [productIds]);

  return new Map(
    result.rows.map(row => [existingImageKey(row.product_id, row.slot), row])
  );
}

async function listExistingProductIds(productIds) {
  if (!productIds.length) return new Set();

  const result = await getDbQuery()(`
    select id
    from products
    where id = any($1::text[])
  `, [productIds]);

  return new Set(result.rows.map(row => row.id));
}

async function main() {
  assertConfigured();
  const productsDir = path.join(contentRoot, "products");
  const productFiles = fs.readdirSync(productsDir)
    .filter(file => file.endsWith(".html") && file !== "index.html")
    .sort();
  const parsed = productFiles.map(parseProductImages);
  const images = parsed.flatMap(item => item.images);
  const skipped = parsed.flatMap(item => item.skipped);
  const shouldCheckDatabase = !dryRun || checkDatabaseInDryRun;
  const productIds = [...new Set(images.map(image => image.productId))];
  const existingProductIds = shouldCheckDatabase
    ? await listExistingProductIds(productIds)
    : new Set(productIds);
  const existingImages = shouldCheckDatabase
    ? await listExistingProductImages(productIds)
    : new Map();
  const missingProductImages = [];
  const existingCloudinaryImages = [];
  const uploadCandidates = images.filter(image => {
    if (!existingProductIds.has(image.productId)) {
      missingProductImages.push(image);
      return false;
    }

    const existingImage = existingImages.get(existingImageKey(image.productId, image.slot));
    if (!overwriteExistingCloudinary && isCloudinaryImage(existingImage)) {
      existingCloudinaryImages.push({
        productId: image.productId,
        slot: image.slot,
        src: existingImage.src,
      });
      return false;
    }
    return true;
  });

  console.log(`Using product asset root(s): ${assetsRoots.join(", ")}`);
  if (!overwriteExistingCloudinary) {
    console.log("Existing Cloudinary images will be kept. Set PRODUCT_IMAGE_SYNC_OVERWRITE_CLOUDINARY=true to replace them.");
  }
  if (skipped.length) {
    console.log(`Skipped ${skipped.length} product image(s):`);
    skipped.slice(0, logLimit).forEach(item => {
      console.log(`Skipped ${item.productId}/${item.slot}: ${item.src} (${item.reason})`);
    });
    if (skipped.length > logLimit) {
      console.log(`...and ${skipped.length - logLimit} more skipped image(s).`);
    }
  }
  if (missingProductImages.length) {
    const missingProductIds = [...new Set(missingProductImages.map(item => item.productId))];
    console.log(`Skipped ${missingProductImages.length} image(s) for product page(s) missing from PostgreSQL: ${missingProductIds.join(", ")}`);
  }
  if (existingCloudinaryImages.length) {
    console.log(`Kept ${existingCloudinaryImages.length} existing Cloudinary image(s):`);
    existingCloudinaryImages.slice(0, logLimit).forEach(item => {
      console.log(`Kept ${item.productId}/${item.slot}: ${item.src}`);
    });
    if (existingCloudinaryImages.length > logLimit) {
      console.log(`...and ${existingCloudinaryImages.length - logLimit} more existing Cloudinary image(s).`);
    }
  }

  if (dryRun) {
    if (!checkDatabaseInDryRun) {
      console.log("Dry run did not check the database, so existing Cloudinary rows are not counted here.");
    }
    console.log(`Dry run found ${uploadCandidates.length} uploadable product image(s).`);
    uploadCandidates.slice(0, logLimit).forEach(item => {
      console.log(`Would upload ${item.productId}/${item.slot}: ${item.filePath}`);
    });
    if (uploadCandidates.length > logLimit) {
      console.log(`...and ${uploadCandidates.length - logLimit} more uploadable image(s).`);
    }
    return;
  }

  let uploadedCount = 0;
  for (const image of uploadCandidates) {
    const uploaded = await uploadImage(image);
    await upsertProductImage({ ...image, uploaded });
    uploadedCount += 1;
    console.log(`Uploaded ${image.productId}/${image.slot}: ${uploaded.secure_url}`);
  }

  console.log(`Synced ${uploadedCount} product image(s) to Cloudinary.`);
  console.log(`Kept ${existingCloudinaryImages.length} existing Cloudinary image(s).`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
