const crypto = require("node:crypto");
const { allCountryIds, findCountryByInput } = require("../countries");
const { listCountries } = require("../content-loader");
const { assertAllowedAdminOrigin } = require("../http/request");
const {
  clearAccountLoginFailures,
  clearLoginFailures,
  createAdminSession,
  getAccountLoginAttempt,
  getAdminSession,
  getLoginAttempt,
  recordAccountLoginFailure,
  recordLoginFailure,
  removeExpiredAdminSessions,
  removeStaleLoginAttempts,
  revokeAdminSession,
} = require("./auth-repository");

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

const isProductionRuntime = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
const adminLogin = String(process.env.ADMIN_LOGIN || process.env.ADMIN_USERNAME || "").trim();
const adminPassword = String(process.env.ADMIN_PASSWORD || "").trim();
const adminKzLogin = String(process.env.ADMIN_KZ_LOGIN || "").trim();
const adminKgLogin = String(process.env.ADMIN_KG_LOGIN || "").trim();
const adminGeLogin = String(process.env.ADMIN_GE_LOGIN || "").trim();
const adminAzLogin = String(process.env.ADMIN_AZ_LOGIN || "").trim();
const adminMdLogin = String(process.env.ADMIN_MD_LOGIN || "").trim();
const adminUzLogin = String(process.env.ADMIN_UZ_LOGIN || "").trim();
const adminAmLogin = String(process.env.ADMIN_AM_LOGIN || "").trim();
const adminKzPassword = String(process.env.ADMIN_KZ_PASSWORD || "").trim();
const adminKgPassword = String(process.env.ADMIN_KG_PASSWORD || "").trim();
const adminGePassword = String(process.env.ADMIN_GE_PASSWORD || "").trim();
const adminAzPassword = String(process.env.ADMIN_AZ_PASSWORD || "").trim();
const adminMdPassword = String(process.env.ADMIN_MD_PASSWORD || "").trim();
const adminUzPassword = String(process.env.ADMIN_UZ_PASSWORD || "").trim();
const adminAmPassword = String(process.env.ADMIN_AM_PASSWORD || "").trim();
const adminSessionTtlMs = positiveNumber(process.env.ADMIN_SESSION_TTL_MS, 8 * 60 * 60 * 1000);
const adminLoginWindowMs = positiveNumber(process.env.ADMIN_LOGIN_WINDOW_MS, 15 * 60 * 1000);
const adminLoginMaxAttempts = positiveNumber(process.env.ADMIN_LOGIN_MAX_ATTEMPTS, 8);
const adminAccountLoginMaxAttempts = positiveNumber(
  process.env.ADMIN_ACCOUNT_LOGIN_MAX_ATTEMPTS,
  Math.max(adminLoginMaxAttempts * 3, 20)
);
const adminAccounts = buildAdminAccounts();
const adminSessionCookieName = normalizeCookieName(process.env.ADMIN_SESSION_COOKIE_NAME || "stada_admin_session");
const adminCookieSameSite = normalizeSameSite(process.env.ADMIN_COOKIE_SAME_SITE || (isProductionRuntime ? "None" : "Lax"));
const adminCookieSecure = isProductionRuntime
  || process.env.ADMIN_COOKIE_SECURE === "true"
  || (process.env.ADMIN_COOKIE_SECURE !== "false" && adminCookieSameSite === "None");
const adminCookieDomain = String(process.env.ADMIN_COOKIE_DOMAIN || "").trim();

function normalizeSameSite(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "strict") return "Strict";
  if (normalized === "none") return "None";
  return "Lax";
}

function normalizeCookieName(value) {
  const name = String(value || "").trim();
  return /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name) ? name : "stada_admin_session";
}

function normalizeAdminCountryIds(countryIds) {
  const submitted = Array.isArray(countryIds) ? countryIds : String(countryIds || "").split(",");
  const normalized = submitted
    .map(countryId => {
      const raw = String(countryId || "").trim();
      if (raw === "*" || raw.toLowerCase() === "all") return "*";
      return findCountryByInput(raw)?.id || "";
    })
    .filter(Boolean);

  if (normalized.includes("*")) return allCountryIds();
  return [...new Set(normalized)];
}

function addAdminAccount(accounts, account) {
  const login = String(account.login || "").trim();
  const password = String(account.password || "").trim();
  const countryIds = normalizeAdminCountryIds(account.countryIds || account.countries);

  if (!login || !password || !countryIds.length) return;
  if (accounts.some(candidate => candidate.login.toLowerCase() === login.toLowerCase())) return;

  accounts.push({ login, password, countryIds });
}

function buildAdminAccounts() {
  const accounts = [];

  addAdminAccount(accounts, {
    login: adminKzLogin,
    password: adminKzPassword,
    countryIds: ["kazakhstan"],
  });
  addAdminAccount(accounts, {
    login: adminKgLogin,
    password: adminKgPassword,
    countryIds: ["kyrgyzstan"],
  });
  addAdminAccount(accounts, {
    login: adminGeLogin,
    password: adminGePassword,
    countryIds: ["georgia"],
  });
  addAdminAccount(accounts, {
    login: adminAzLogin,
    password: adminAzPassword,
    countryIds: ["azerbaijan"],
  });
  addAdminAccount(accounts, {
    login: adminMdLogin,
    password: adminMdPassword,
    countryIds: ["moldova"],
  });
  addAdminAccount(accounts, {
    login: adminUzLogin,
    password: adminUzPassword,
    countryIds: ["uzbekistan"],
  });
  addAdminAccount(accounts, {
    login: adminAmLogin,
    password: adminAmPassword,
    countryIds: ["armenia"],
  });
  addAdminAccount(accounts, {
    login: adminLogin,
    password: adminPassword,
    countryIds: allCountryIds(),
  });

  return accounts;
}

function timingSafeEqualText(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function publicAdminAccount(account) {
  const countryIds = account?.countryIds?.length ? account.countryIds : allCountryIds();
  const countries = listCountries().filter(country => countryIds.includes(country.id));
  return {
    login: account?.login || "",
    countryIds,
    countries,
  };
}

function parseCookies(request) {
  return String(request.headers.cookie || "")
    .split(";")
    .map(part => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separator = part.indexOf("=");
      if (separator <= 0) return cookies;
      const name = part.slice(0, separator).trim();
      const value = part.slice(separator + 1).trim();
      try {
        cookies[name] = decodeURIComponent(value);
      } catch (error) {
        cookies[name] = value;
      }
      return cookies;
    }, {});
}

function adminSessionTokenFromRequest(request) {
  return parseCookies(request)[adminSessionCookieName] || "";
}

function adminCookieAttributes(maxAgeSeconds) {
  const maxAge = Math.max(0, Math.floor(maxAgeSeconds));
  const attributes = [
    "Path=/api/admin",
    "HttpOnly",
    `SameSite=${adminCookieSameSite}`,
    `Max-Age=${maxAge}`,
  ];
  if (maxAge === 0) attributes.push("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  if (adminCookieSecure) attributes.push("Secure");
  if (adminCookieDomain && /^[A-Za-z0-9.-]+$/.test(adminCookieDomain)) {
    attributes.push(`Domain=${adminCookieDomain}`);
  }
  return attributes.join("; ");
}

function setAdminSessionCookie(response, token) {
  response.setHeader(
    "Set-Cookie",
    `${adminSessionCookieName}=${encodeURIComponent(token)}; ${adminCookieAttributes(adminSessionTtlMs / 1000)}`
  );
}

function clearAdminSessionCookie(response) {
  response.setHeader(
    "Set-Cookie",
    `${adminSessionCookieName}=; ${adminCookieAttributes(0)}`
  );
}

function adminSessionResponse(session) {
  return {
    expiresAt: session.expiresAt,
    csrfToken: session.csrfToken,
    account: publicAdminAccount(session.account),
  };
}

async function issueAdminSession(account, request, response) {
  const token = crypto.randomBytes(32).toString("hex");
  const csrfToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + adminSessionTtlMs).toISOString();
  const publicAccount = publicAdminAccount(account);
  await createAdminSession({
    token,
    csrfToken,
    account: publicAccount,
    expiresAt,
    ipAddress: requestIp(request),
    userAgent: request.headers["user-agent"],
  });
  setAdminSessionCookie(response, token);
  return adminSessionResponse({ expiresAt, csrfToken, account: publicAccount });
}

async function requireAdmin(request, { csrf = false } = {}) {
  const token = adminSessionTokenFromRequest(request);
  const storedSession = await getAdminSession(token);
  const activeAccount = storedSession ? findAdminAccountByLogin(storedSession.account?.login) : null;

  if (!storedSession || !activeAccount) {
    if (storedSession && token) await revokeAdminSession(token);
    throw Object.assign(new Error("Admin authorization is required."), {
      statusCode: 401,
      code: "ADMIN_UNAUTHORIZED",
    });
  }

  const session = {
    ...storedSession,
    token,
    account: publicAdminAccount(activeAccount),
  };
  if (csrf) {
    assertAllowedAdminOrigin(request);
    const submittedCsrfToken = String(request.headers["x-csrf-token"] || "");
    if (!timingSafeEqualText(submittedCsrfToken, session.csrfToken)) {
      throw Object.assign(new Error("The admin security token is missing or invalid."), {
        statusCode: 403,
        code: "ADMIN_CSRF_INVALID",
      });
    }
  }
  return session;
}

function assertAdminCredentialsConfigured() {
  if (adminAccounts.length) return;
  throw Object.assign(new Error("Admin credentials are not configured on the backend."), {
    statusCode: 500,
    code: "ADMIN_CREDENTIALS_NOT_CONFIGURED",
  });
}

function findMatchingAdminAccount(login, password) {
  let matchedAccount = null;

  for (const account of adminAccounts) {
    const isValidLogin = timingSafeEqualText(login, account.login);
    const isValidPassword = timingSafeEqualText(password, account.password);
    if (isValidLogin && isValidPassword) matchedAccount = account;
  }

  return matchedAccount;
}

function findAdminAccountByLogin(login) {
  let matchedAccount = null;
  for (const account of adminAccounts) {
    if (timingSafeEqualText(login, account.login)) matchedAccount = account;
  }
  return matchedAccount;
}

function requireAdminCountry(session, countryInput) {
  const allowedCountryIds = session?.account?.countryIds?.length ? session.account.countryIds : allCountryIds();
  const requestedCountry = countryInput
    ? findCountryByInput(countryInput)
    : findCountryByInput(allowedCountryIds[0]);

  if (!requestedCountry) {
    throw Object.assign(new Error(`Country "${countryInput}" is not configured for this backend yet.`), {
      statusCode: 404,
      code: "COUNTRY_NOT_CONFIGURED",
      knownCountries: allCountryIds(),
    });
  }

  if (!allowedCountryIds.includes(requestedCountry.id)) {
    throw Object.assign(new Error("This admin account cannot edit the requested country."), {
      statusCode: 403,
      code: "ADMIN_COUNTRY_FORBIDDEN",
    });
  }

  return requestedCountry.id;
}

function adminCountriesForSession(session) {
  const allowedCountryIds = session?.account?.countryIds?.length ? session.account.countryIds : allCountryIds();
  return listCountries().filter(country => allowedCountryIds.includes(country.id));
}

function requestIp(request) {
  // Render terminates TLS and appends the connecting client to X-Forwarded-For.
  // Use its right-most value, rather than the attacker-controlled first value.
  const forwardedFor = String(request.headers["x-forwarded-for"] || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);
  return forwardedFor.at(-1) || request.socket?.remoteAddress || "unknown";
}

async function assertAdminLoginAllowed(request, login) {
  const [ipAttempt, accountAttempt] = await Promise.all([
    getLoginAttempt(requestIp(request), login),
    getAccountLoginAttempt(login),
  ]);
  const isBlocked = attempt => {
    const blockedUntil = attempt?.blocked_until ? new Date(attempt.blocked_until).getTime() : 0;
    return blockedUntil > Date.now();
  };
  if (!isBlocked(ipAttempt) && !isBlocked(accountAttempt)) return;

  throw Object.assign(new Error("Too many failed login attempts. Try again later."), {
    statusCode: 429,
    code: "ADMIN_LOGIN_RATE_LIMITED",
  });
}

async function recordAdminLoginFailure(request, login) {
  return Promise.all([
    recordLoginFailure({
      ipAddress: requestIp(request),
      login,
      windowMs: adminLoginWindowMs,
      maxAttempts: adminLoginMaxAttempts,
    }),
    recordAccountLoginFailure({
      login,
      windowMs: adminLoginWindowMs,
      maxAttempts: adminAccountLoginMaxAttempts,
    }),
  ]);
}

async function clearAdminLoginFailures(request, login) {
  return Promise.all([
    clearLoginFailures(requestIp(request), login),
    clearAccountLoginFailures(login),
  ]);
}

async function cleanupAdminSecurityState() {
  await Promise.all([
    removeExpiredAdminSessions(),
    removeStaleLoginAttempts(adminLoginWindowMs),
  ]);
}

module.exports = {
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
};
