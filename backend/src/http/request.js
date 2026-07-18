const fs = require("node:fs");
const path = require("node:path");
const { listCountries } = require("../content-loader");

const isProductionRuntime = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

const maxJsonBodyBytes = positiveNumber(process.env.MAX_JSON_BODY_BYTES, 1024 * 1024);
const maxImageUploadBodyBytes = positiveNumber(process.env.MAX_IMAGE_UPLOAD_BODY_BYTES, 12 * 1024 * 1024);
const maxLoginBodyBytes = positiveNumber(process.env.MAX_LOGIN_BODY_BYTES, 16 * 1024);

const allowedCorsOrigins = parseOriginList(process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || "");
const allowedAdminCorsOrigins = parseOriginList(process.env.ADMIN_CORS_ORIGINS || process.env.ADMIN_ORIGINS || "");
const defaultAdminCorsOrigins = new Set(["https://admin.stada.kz"]);
const allowLocalAdminCorsOrigins = !isProductionRuntime
  || String(process.env.ALLOW_LOCAL_ADMIN_ORIGINS || "").trim().toLowerCase() === "true";
const allowAnyCorsOrigin = allowedCorsOrigins.length === 0 && allowedAdminCorsOrigins.length === 0 && !isProductionRuntime;
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
  ].join("; "),
};

function parseOriginList(value) {
  return String(value || "")
    .split(",")
    .map(origin => {
      try {
        return new URL(origin.trim()).origin;
      } catch (error) {
        return "";
      }
    })
    .filter(Boolean);
}

function appendVaryHeader(response, value) {
  const current = response.getHeader("Vary");
  const values = String(current || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
  if (!values.includes(value)) values.push(value);
  response.setHeader("Vary", values.join(", "));
}

function isDefaultPublicCorsOrigin(origin) {
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === "https:" && (
      hostname === "stada.kz"
      || hostname.endsWith(".stada.kz")
      || hostname === "stada.kg"
      || hostname.endsWith(".stada.kg")
      || hostname === "stada.ge"
      || hostname.endsWith(".stada.ge")
      || hostname === "stada.az"
      || hostname.endsWith(".stada.az")
      || hostname === "stada.md"
      || hostname.endsWith(".stada.md")
      || hostname === "stada.uz"
      || hostname.endsWith(".stada.uz")
      || hostname === "stada.am"
      || hostname.endsWith(".stada.am")
    );
  } catch (error) {
    return false;
  }
}

function isLocalAdminDevCorsOrigin(origin) {
  try {
    const { hostname, protocol } = new URL(origin);
    return ["http:", "https:"].includes(protocol)
      && ["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch (error) {
    return false;
  }
}

function isDefaultAdminCorsOrigin(origin) {
  return defaultAdminCorsOrigins.has(origin);
}

function isAdminApiPath(pathname) {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

function normalizeRequestOrigin(request) {
  const origin = String(request.headers.origin || "").trim();
  if (!origin) return "";
  try {
    return new URL(origin).origin;
  } catch (error) {
    return "";
  }
}

function isAllowedAdminCorsOrigin(origin) {
  return Boolean(origin) && (
    allowedAdminCorsOrigins.includes(origin)
    || isDefaultAdminCorsOrigin(origin)
    || (allowLocalAdminCorsOrigins && isLocalAdminDevCorsOrigin(origin))
  );
}

function isAllowedCorsOrigin(origin, pathname) {
  if (isAdminApiPath(pathname)) return isAllowedAdminCorsOrigin(origin);

  return Boolean(origin) && (
    allowAnyCorsOrigin
    || allowedCorsOrigins.includes(origin)
    || allowedAdminCorsOrigins.includes(origin)
    || isDefaultAdminCorsOrigin(origin)
    || isDefaultPublicCorsOrigin(origin)
    || (allowLocalAdminCorsOrigins && isLocalAdminDevCorsOrigin(origin))
  );
}

function assertAllowedAdminOrigin(request) {
  const origin = normalizeRequestOrigin(request);
  const allowed = isAllowedAdminCorsOrigin(origin);
  if (allowed || (!origin && !isProductionRuntime)) return;

  throw Object.assign(new Error("This origin is not allowed to use the admin API."), {
    statusCode: 403,
    code: "ADMIN_ORIGIN_FORBIDDEN",
  });
}

function applyRequestHeaders(request, response, pathname) {
  Object.entries(securityHeaders).forEach(([header, value]) => response.setHeader(header, value));

  const origin = normalizeRequestOrigin(request);
  if (!isAllowedCorsOrigin(origin, pathname)) return;

  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.setHeader("Access-Control-Max-Age", "600");
  appendVaryHeader(response, "Origin");
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(statusCode === 204 ? "" : JSON.stringify(payload, null, 2));
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

function isJsonContentType(value) {
  return /^application\/(?:[a-z0-9!#$&^_.+-]+\+)?json(?:\s*;|$)/i.test(String(value || "").trim());
}

function requestBodyError(message, statusCode, code) {
  return Object.assign(new Error(message), { statusCode, code });
}

function readJsonBody(request, { maxBytes = maxJsonBodyBytes } = {}) {
  return new Promise((resolve, reject) => {
    const contentType = request.headers["content-type"];
    if (!isJsonContentType(contentType)) {
      request.resume();
      reject(requestBodyError("Content-Type must be application/json.", 415, "JSON_CONTENT_TYPE_REQUIRED"));
      return;
    }

    const rawContentLength = String(request.headers["content-length"] || "").trim();
    if (rawContentLength && !/^\d+$/.test(rawContentLength)) {
      request.resume();
      reject(requestBodyError("Content-Length must be a non-negative integer.", 400, "CONTENT_LENGTH_INVALID"));
      return;
    }
    if (rawContentLength && Number(rawContentLength) > maxBytes) {
      request.resume();
      reject(requestBodyError("Request body is too large.", 413, "REQUEST_BODY_TOO_LARGE"));
      return;
    }

    let settled = false;
    let receivedBytes = 0;
    let chunks = [];

    const cleanup = () => {
      request.removeListener("data", onData);
      request.removeListener("end", onEnd);
      request.removeListener("error", onError);
      request.removeListener("aborted", onAborted);
    };
    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback(value);
    };
    const onData = chunk => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      receivedBytes += buffer.length;
      if (receivedBytes > maxBytes) {
        chunks = [];
        settle(reject, requestBodyError("Request body is too large.", 413, "REQUEST_BODY_TOO_LARGE"));
        request.resume();
        return;
      }
      chunks.push(buffer);
    };
    const onEnd = () => {
      const body = Buffer.concat(chunks, receivedBytes).toString("utf8");
      if (!body.trim()) {
        settle(resolve, {});
        return;
      }
      try {
        const parsed = JSON.parse(body);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          settle(reject, requestBodyError("Request body must be a JSON object.", 400, "JSON_OBJECT_REQUIRED"));
          return;
        }
        settle(resolve, parsed);
      } catch (error) {
        settle(reject, requestBodyError("Request body must be valid JSON.", 400, "JSON_BODY_INVALID"));
      }
    };
    const onError = error => settle(reject, error);
    const onAborted = () => settle(
      reject,
      requestBodyError("The request body was interrupted.", 400, "REQUEST_BODY_ABORTED")
    );

    request.on("data", onData);
    request.on("end", onEnd);
    request.on("error", onError);
    request.on("aborted", onAborted);
  });
}

function requestErrorStatus(error) {
  const statusCode = Number(error?.statusCode);
  return Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599 ? statusCode : 500;
}

function sendRequestError(response, error, requestId) {
  const statusCode = requestErrorStatus(error);
  const isUnexpected = statusCode >= 500;

  if (isUnexpected) {
    console.error("Backend request failed.", {
      requestId,
      code: error?.code || "SERVER_ERROR",
      error,
    });
  }

  if (response.destroyed || response.writableEnded) return;
  if (response.headersSent) {
    response.end();
    return;
  }

  sendJson(response, statusCode, {
    error: {
      code: isUnexpected ? "SERVER_ERROR" : error?.code || "REQUEST_FAILED",
      message: isUnexpected ? "An unexpected server error occurred." : error?.message || "Request failed.",
      requestId,
      ...(!isUnexpected && error?.knownCountries ? { knownCountries: error.knownCountries } : {}),
    },
  });
}

module.exports = {
  applyRequestHeaders,
  assertAllowedAdminOrigin,
  maxImageUploadBodyBytes,
  maxLoginBodyBytes,
  readJsonBody,
  sendFile,
  sendJson,
  sendRequestError,
};
