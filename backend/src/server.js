const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { URL } = require("node:url");
const { getHomepagePayload, getPagePayload, listCountries } = require("./content-loader");
const { getPageOverrides, savePageOverrides } = require("./content-overrides");

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";
const adminRoot = path.resolve(__dirname, "..", "..", "admin");
const adminLogin = process.env.ADMIN_LOGIN || process.env.ADMIN_USERNAME || "andrewyemtsev";
const adminPassword = process.env.ADMIN_PASSWORD || "StadaAdmin67";
const adminSessionTtlMs = Number(process.env.ADMIN_SESSION_TTL_MS || 8 * 60 * 60 * 1000);
const adminSessions = new Map();
const hiddenTextKeys = new Set(["hero_kicker", "site_name"]);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
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
      if (body.length > 1024 * 1024) {
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
    || /^hero_caption_/i.test(key)
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
  const sectionLookup = makeSectionLookup(basePayload);

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

  return {
    country: currentPayload.country,
    language: currentPayload.language,
    requestedLanguage: currentPayload.requestedLanguage,
    page: currentPayload.page,
    overrides: getPageOverrides(currentPayload.country.id, currentPayload.language, currentPayload.page.path),
    sections: [
      ...new Map(
        [...textItems, ...domTextItems].map(item => [item.sectionId, { id: item.sectionId, label: item.sectionLabel }])
      ).values(),
    ],
    items: [...textItems, ...domTextItems],
  };
}

function normalizeSubmittedMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, itemValue]) => [key, String(itemValue ?? "")])
  );
}

function buildChangedOverrides(basePayload, body) {
  const baseText = basePayload.content?.text || {};
  const sectionLookup = makeSectionLookup(basePayload);
  const baseDomText = Object.fromEntries((basePayload.content?.dom?.text || []).map(item => [item.id, item.value || ""]));
  const submittedText = normalizeSubmittedMap(body.text);
  const submittedDomText = normalizeSubmittedMap(body.domText);
  const text = {};
  const domText = {};

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

  return { text, domText };
}

function routeCountryFromHomepagePath(pathname) {
  const match = pathname.match(/^\/api\/homepage\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function routeCountryFromPagePath(pathname) {
  const match = pathname.match(/^\/api\/page\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
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
      const page = requestUrl.searchParams.get("page") || "index.html";
      const basePayload = getPagePayload({ country, lang, page, applyOverrides: false });
      const currentPayload = getPagePayload({ country, lang: basePayload.language, page: basePayload.page.path });

      sendJson(response, 200, {
        countries: listCountries(),
        editable: buildEditableContent(basePayload, currentPayload),
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/content") {
      requireAdmin(request);
      const body = await readJsonBody(request);
      const page = body.page || body.path || "index.html";
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
        editable: buildEditableContent(basePayload, currentPayload),
      });
      return;
    }

    if (request.method === "GET" && pathname === "/api/countries") {
      sendJson(response, 200, { countries: listCountries() });
      return;
    }

    if (request.method === "GET" && (pathname === "/api/homepage" || pathname.startsWith("/api/homepage/"))) {
      const payload = getHomepagePayload({
        country: routeCountryFromHomepagePath(pathname) || requestUrl.searchParams.get("country"),
        lang: requestUrl.searchParams.get("lang") || requestUrl.searchParams.get("language"),
      });
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "GET" && (pathname === "/api/page" || pathname.startsWith("/api/page/"))) {
      const payload = getPagePayload({
        country: routeCountryFromPagePath(pathname) || requestUrl.searchParams.get("country"),
        lang: requestUrl.searchParams.get("lang") || requestUrl.searchParams.get("language"),
        page: requestUrl.searchParams.get("page") || requestUrl.searchParams.get("path"),
      });
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && pathname === "/api/homepage") {
      const body = await readJsonBody(request);
      const payload = getHomepagePayload({
        country: body.country || body.countryId,
        lang: body.lang || body.language,
      });
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && pathname === "/api/page") {
      const body = await readJsonBody(request);
      const payload = getPagePayload({
        country: body.country || body.countryId,
        lang: body.lang || body.language,
        page: body.page || body.path,
      });
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "GET" && pathname === "/") {
      sendJson(response, 200, {
        service: "stada-country-content-backend",
        endpoints: [
          "GET /health",
          "GET /api/countries",
          "GET /api/homepage?country=kazakhstan&lang=ru",
          "GET /api/homepage/kazakhstan?lang=kz",
          "GET /api/homepage/kyrgyzstan?lang=kg",
          "GET /api/page/kg?lang=kg&page=products/coldrex.html",
          "POST /api/homepage { country, lang }",
          "POST /api/page { country, lang, page }",
          "GET /admin",
          "POST /api/admin/login { login, password }",
          "GET /api/admin/content?country=kazakhstan&lang=ru&page=index.html",
          "POST /api/admin/content { country, lang, page, text, domText }",
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
    console.log(`STADA country content backend listening at http://${host}:${port}`);
  });
}

module.exports = { server };
