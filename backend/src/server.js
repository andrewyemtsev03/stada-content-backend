const crypto = require("node:crypto");
const childProcess = require("node:child_process");
const http = require("node:http");
const path = require("node:path");
const { URL } = require("node:url");
const { getHomepagePayload, getPagePayload, listCountries } = require("./content-loader");
const {
  getContentOverrideStorageStatus,
  getPageOverrides,
  initializeContentOverrides,
  refreshContentOverrides,
  savePageOverrides,
} = require("./content-overrides");
const { checkDatabaseConnection } = require("./db/client");
const {
  applyRequestHeaders,
  assertAllowedAdminOrigin,
  maxImageUploadBodyBytes,
  maxLoginBodyBytes,
  readJsonBody,
  sendJson,
  sendRequestError,
} = require("./http/request");
const { revokeAdminSession } = require("./admin/auth-repository");
const {
  adminCountriesForSession,
  adminSessionResponse,
  adminSessionTokenFromRequest,
  assertAdminCredentialsConfigured,
  assertAdminLoginAllowed,
  clearAdminLoginFailures,
  clearAdminSessionCookie,
  cleanupAdminSecurityState,
  findMatchingAdminAccount,
  issueAdminSession,
  recordAdminLoginFailure,
  requireAdmin,
  requireAdminCountry,
} = require("./admin/auth-service");
const { importProductsFromSite, parseProductDetailContent, parseProductPurchaseLinks } = require("./products/import-from-site");
const { deleteProduct, getProduct, listProducts, listTherapeuticAreas, upsertProduct } = require("./products/repository");
const {
  adminEditablePagePath,
  buildChangedOverrides,
  buildEditableContent,
} = require("./content/editable");
const { uploadImageToCloudinary } = require("./media/cloudinary");
const {
  applyDatabaseProductsToPayload,
  buildTherapeuticAreaLabelMap,
  contentProductFromDatabaseProduct,
  getProductPayloadTranslation,
  mergeProductContentWithFallback,
  productDetailPayloadFromDatabaseProduct,
} = require("./products/content");
const {
  normalizeProductPayload,
  normalizePublicUrl,
} = require("./products/validation");

const port = Number(process.env.PORT || 10000);
const host = "0.0.0.0";
const serverRequestTimeoutMs = positiveNumber(process.env.SERVER_REQUEST_TIMEOUT_MS, 30 * 1000);
const serverHeadersTimeoutMs = Math.min(
  serverRequestTimeoutMs,
  positiveNumber(process.env.SERVER_HEADERS_TIMEOUT_MS, 15 * 1000)
);
const serverKeepAliveTimeoutMs = positiveNumber(process.env.SERVER_KEEP_ALIVE_TIMEOUT_MS, 5 * 1000);
const serverMaxRequestsPerSocket = positiveNumber(process.env.SERVER_MAX_REQUESTS_PER_SOCKET, 100);
const productImageSyncTimeoutMs = positiveNumber(process.env.PRODUCT_IMAGE_SYNC_TIMEOUT_MS, 5 * 60 * 1000);

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

async function listTherapeuticAreasOrEmpty() {
  try {
    return await listTherapeuticAreas();
  } catch (error) {
    if (error.code !== "DATABASE_URL_MISSING") throw error;
    return [];
  }
}

function legacyProductSlugFromPagePath(pagePath) {
  const match = String(pagePath || "")
    .replace(/\\/g, "/")
    .match(/^products\/([^/]+)\.html$/i);
  if (!match || ["index", "product"].includes(match[1].toLowerCase())) return "";
  return match[1];
}

async function requirePublishedProductPage(payload) {
  const slug = legacyProductSlugFromPagePath(payload?.page?.path);
  if (!slug) return;

  const country = payload?.country?.id || "kazakhstan";
  const product = await getProduct(slug, country, { publishedOnly: true });
  if (product?.status === "published") return;

  throw Object.assign(new Error("Product was not found."), {
    statusCode: 404,
    code: "PRODUCT_NOT_FOUND",
  });
}

async function attachDatabaseProductsToPayload(payload, { publishedOnly = true } = {}) {
  try {
    const country = payload.country?.id || "kazakhstan";
    const [products, therapeuticAreas] = await Promise.all([
      listProducts(country, { publishedOnly }),
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
    const country = editable.country?.id || "kazakhstan";
    const [products, therapeuticAreas] = await Promise.all([
      listProducts(country),
      listTherapeuticAreas(),
    ]);
    const areaLabels = buildTherapeuticAreaLabelMap(therapeuticAreas, editable.language);
    editable.productCatalog = products
      .filter(product => product.status !== "archived")
      .map(product => contentProductFromDatabaseProduct(product, editable.language, areaLabels));
  } catch (error) {
    if (error.code !== "DATABASE_URL_MISSING") throw error;
  }
  return editable;
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
  const requestId = crypto.randomUUID();

  try {
    response.setHeader("X-Request-ID", requestId);
    const requestUrl = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
    const pathname = requestUrl.pathname.replace(/\/+$/, "") || "/";
    applyRequestHeaders(request, response, pathname);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    if (
      pathname.startsWith("/api/page")
      || pathname.startsWith("/api/homepage")
      || pathname.startsWith("/api/products/")
      || pathname === "/api/admin/content"
    ) {
      await refreshContentOverrides();
    }

    if (request.method === "GET" && pathname === "/health") {
      sendJson(response, 200, {
        status: "ok",
        contentOverrides: getContentOverrideStorageStatus(),
        adminSecurity: {
          sessionProvider: "postgresql",
          csrfProtection: true,
          httpOnlyCookie: true,
        },
      });
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

    if (request.method === "POST" && pathname === "/api/admin/login") {
      assertAllowedAdminOrigin(request);
      const body = await readJsonBody(request, { maxBytes: maxLoginBodyBytes });
      const submittedLogin = body.login || body.username;
      assertAdminCredentialsConfigured();
      await assertAdminLoginAllowed(request, submittedLogin);

      const account = findMatchingAdminAccount(submittedLogin, body.password);

      if (!account) {
        await recordAdminLoginFailure(request, submittedLogin);
        sendJson(response, 401, {
          error: {
            code: "INVALID_ADMIN_CREDENTIALS",
            message: "Invalid admin login or password.",
          },
        });
        return;
      }

      await clearAdminLoginFailures(request, submittedLogin);
      await cleanupAdminSecurityState();
      sendJson(response, 200, {
        status: "ok",
        session: await issueAdminSession(account, request, response),
      });
      return;
    }

    if (request.method === "GET" && pathname === "/api/admin/session") {
      const session = await requireAdmin(request);
      sendJson(response, 200, {
        status: "ok",
        session: adminSessionResponse(session),
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/logout") {
      assertAllowedAdminOrigin(request);
      const token = adminSessionTokenFromRequest(request);
      if (token) await revokeAdminSession(token);
      clearAdminSessionCookie(response);
      sendJson(response, 200, { status: "signed-out" });
      return;
    }

    if (request.method === "GET" && pathname === "/api/admin/countries") {
      const session = await requireAdmin(request);
      sendJson(response, 200, {
        countries: adminCountriesForSession(session),
        account: session.account,
      });
      return;
    }

    if (request.method === "GET" && pathname === "/api/admin/content") {
      const session = await requireAdmin(request);
      const country = requireAdminCountry(session, requestUrl.searchParams.get("country"));
      const lang = requestUrl.searchParams.get("lang") || requestUrl.searchParams.get("language");
      const page = adminEditablePagePath;
      const basePayload = getPagePayload({ country, lang, page, applyOverrides: false });
      const currentPayload = getPagePayload({ country, lang: basePayload.language, page: basePayload.page.path });
      await Promise.all([
        attachDatabaseProductsToPayload(basePayload, { publishedOnly: false }),
        attachDatabaseProductsToPayload(currentPayload, { publishedOnly: false }),
      ]);
      const editable = buildEditableContent(basePayload, currentPayload);
      await attachEditableProductCatalog(editable);

      sendJson(response, 200, {
        countries: adminCountriesForSession(session),
        account: session.account,
        editable,
      });
      return;
    }

    if (request.method === "GET" && pathname === "/api/admin/products") {
      const session = await requireAdmin(request);
      const country = requireAdminCountry(session, requestUrl.searchParams.get("country") || requestUrl.searchParams.get("countryId"));
      sendJson(response, 200, {
        products: await listProducts(country),
        therapeuticAreas: await listTherapeuticAreas(),
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/products/import-from-site") {
      const session = await requireAdmin(request, { csrf: true });
      requireAdminCountry(session, "kazakhstan");
      const result = await importProductsFromSite();
      sendJson(response, 200, {
        status: "imported",
        ...result,
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/products/sync-cloudinary-images") {
      const session = await requireAdmin(request, { csrf: true });
      requireAdminCountry(session, "kazakhstan");
      const result = await runProductImageCloudinarySync();
      sendJson(response, 200, {
        status: "synced",
        ...result,
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/products") {
      const session = await requireAdmin(request, { csrf: true });
      const body = await readJsonBody(request);
      const country = requireAdminCountry(session, body.country || body.countryId);
      const product = await upsertProduct(normalizeProductPayload(body, "", country));
      sendJson(response, 201, {
        status: "saved",
        product,
      });
      return;
    }

    if (request.method === "PUT" && pathname.startsWith("/api/admin/products/")) {
      const session = await requireAdmin(request, { csrf: true });
      const body = await readJsonBody(request);
      const country = requireAdminCountry(session, body.country || body.countryId);
      const product = await upsertProduct(normalizeProductPayload(body, routeProductSlugFromAdminPath(pathname), country));
      sendJson(response, 200, {
        status: "saved",
        product,
      });
      return;
    }

    if (request.method === "DELETE" && pathname.startsWith("/api/admin/products/")) {
      const session = await requireAdmin(request, { csrf: true });
      const country = requireAdminCountry(session, requestUrl.searchParams.get("country") || requestUrl.searchParams.get("countryId"));
      const deleted = await deleteProduct(routeProductSlugFromAdminPath(pathname), country);
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
      const session = await requireAdmin(request);
      const country = requireAdminCountry(session, requestUrl.searchParams.get("country") || requestUrl.searchParams.get("countryId"));
      const product = await getProduct(routeProductSlugFromAdminPath(pathname), country);
      if (!product) {
        sendJson(response, 404, {
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product was not found.",
          },
        });
        return;
      }
      sendJson(response, 200, {
        product,
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/upload-image") {
      const session = await requireAdmin(request, { csrf: true });
      const body = await readJsonBody(request, { maxBytes: maxImageUploadBodyBytes });
      const country = requireAdminCountry(session, body.country || body.countryId);
      const image = await uploadImageToCloudinary({
        dataUrl: body.dataUrl,
        fileName: body.fileName,
        imageId: body.imageId,
        country,
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
      const session = await requireAdmin(request, { csrf: true });
      const body = await readJsonBody(request);
      const page = adminEditablePagePath;
      const country = requireAdminCountry(session, body.country || body.countryId);
      const basePayload = getPagePayload({
        country,
        lang: body.lang || body.language,
        page,
        applyOverrides: false,
      });
      await attachDatabaseProductsToPayload(basePayload, { publishedOnly: false });
      const overrides = buildChangedOverrides(basePayload, body);
      const savedOverrides = await savePageOverrides({
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
      await attachDatabaseProductsToPayload(currentPayload, { publishedOnly: false });

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
      let product = null;
      let productLookupError = null;
      try {
        product = await getProduct(slug, country, { publishedOnly: true });
      } catch (error) {
        productLookupError = error;
        if (error.code !== "DATABASE_URL_MISSING") throw error;
      }

      if (!product || product.status !== "published") {
        if (productLookupError && productLookupError.code !== "DATABASE_URL_MISSING") throw productLookupError;
        sendJson(response, 404, {
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product was not found.",
          },
        });
        return;
      }

      const countryPayload = getPagePayload({ country, lang, page: "index.html" });
      let staticDetail = null;
      let staticPurchaseLinks = [];
      try {
        const staticProductPayload = getPagePayload({
          country,
          lang,
          page: `products/${product.slug || product.id}.html`,
          applyOverrides: false,
        });
        staticDetail = parseProductDetailContent(
          product.id,
          staticProductPayload,
          getProductPayloadTranslation(product, lang)
        );
        staticPurchaseLinks = parseProductPurchaseLinks(staticProductPayload);
      } catch (error) {
        if (error.code !== "PAGE_NOT_FOUND") throw error;
      }
      const productWithPurchaseFallback = {
        ...product,
        purchaseLinks: Array.isArray(product.purchaseLinks) && product.purchaseLinks.length
          ? product.purchaseLinks
          : staticPurchaseLinks,
      };

      sendJson(response, 200, productDetailPayloadFromDatabaseProduct(
        productWithPurchaseFallback,
        await listTherapeuticAreasOrEmpty(),
        countryPayload.country,
        lang,
        staticDetail
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
      await requirePublishedProductPage(payload);
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
      await requirePublishedProductPage(payload);
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
          "GET /api/homepage/azerbaijan?lang=az",
          "GET /api/homepage/armenia?lang=hy",
          "GET /api/homepage/moldova?lang=ro",
          "GET /api/page/kg?lang=kg&page=products/coldrex.html",
          "GET /api/products/coldrex?country=kazakhstan&lang=ru",
          "POST /api/homepage { country, lang }",
          "POST /api/page { country, lang, page }",
          "POST /api/admin/login { login, password }",
          "GET /api/admin/session",
          "POST /api/admin/logout",
          "GET /api/admin/countries",
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
    sendRequestError(response, error, requestId);
  }
}

const server = http.createServer((request, response) => {
  void handleRequest(request, response).catch(error => {
    const requestId = String(response.getHeader("X-Request-ID") || crypto.randomUUID());
    try {
      sendRequestError(response, error, requestId);
    } catch (sendError) {
      console.error("Unable to send the backend error response.", { requestId, error: sendError });
      response.destroy();
    }
  });
});

server.requestTimeout = Math.floor(serverRequestTimeoutMs);
server.headersTimeout = Math.floor(serverHeadersTimeoutMs);
server.keepAliveTimeout = Math.floor(serverKeepAliveTimeoutMs);
server.maxRequestsPerSocket = Math.floor(serverMaxRequestsPerSocket);
server.maxHeadersCount = 100;

server.on("clientError", (error, socket) => {
  if (error.code === "ECONNRESET" || !socket.writable) return;
  const statusCode = error.code === "HPE_HEADER_OVERFLOW" ? 431 : 400;
  const payload = JSON.stringify({
    error: {
      code: statusCode === 431 ? "REQUEST_HEADERS_TOO_LARGE" : "BAD_REQUEST",
      message: statusCode === 431 ? "Request headers are too large." : "Malformed HTTP request.",
    },
  });
  socket.end([
    `HTTP/1.1 ${statusCode} ${statusCode === 431 ? "Request Header Fields Too Large" : "Bad Request"}`,
    "Connection: close",
    "Content-Type: application/json; charset=utf-8",
    "Cache-Control: no-store",
    "X-Content-Type-Options: nosniff",
    `Content-Length: ${Buffer.byteLength(payload)}`,
    "",
    payload,
  ].join("\r\n"));
});

if (require.main === module) {
  initializeContentOverrides()
    .then(() => {
      server.listen(port, host, () => {
        console.log(`STADA country content backend listening on port ${port}`);
      });
    })
    .catch(error => {
      console.error("Content override storage initialization failed.");
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  server,
  mergeProductContentWithFallback,
  normalizeProductPayload,
  normalizePublicUrl,
  productDetailPayloadFromDatabaseProduct,
};
