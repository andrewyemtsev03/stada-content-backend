function normalizeSslMode(value) {
  const mode = String(value || "").trim().toLowerCase();
  if (["disable", "require", "verify-ca", "verify-full"].includes(mode)) return mode;
  if (!mode) return "";
  throw Object.assign(new Error(`Unsupported DATABASE_SSL_MODE "${value}".`), {
    code: "DATABASE_SSL_MODE_INVALID",
  });
}

function isLocalDatabaseUrl(databaseUrl) {
  try {
    const hostname = new URL(databaseUrl).hostname.toLowerCase();
    return ["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch (error) {
    return /localhost|127\.0\.0\.1|\[?::1\]?/i.test(String(databaseUrl || ""));
  }
}

function normalizeCertificate(value) {
  const certificate = String(value || "").trim();
  return certificate ? certificate.replace(/\\n/g, "\n") : "";
}

function assertNoConnectionStringSslOverrides(databaseUrl) {
  const conflictingParameters = new Set(["sslcert", "sslkey", "sslrootcert", "sslmode"]);
  let parameters = [];
  try {
    parameters = [...new URL(databaseUrl).searchParams.keys()];
  } catch (error) {
    const query = String(databaseUrl || "").split("?", 2)[1] || "";
    parameters = query.split("&").map(item => item.split("=", 1)[0]);
  }
  const conflicts = parameters
    .map(parameter => String(parameter || "").trim().toLowerCase())
    .filter(parameter => conflictingParameters.has(parameter));
  if (!conflicts.length) return;

  throw Object.assign(new Error(
    `DATABASE_URL must not contain ${[...new Set(conflicts)].join(", ")}; use DATABASE_SSL_MODE and DATABASE_CA_CERT instead.`
  ), {
    code: "DATABASE_URL_SSL_CONFLICT",
  });
}

function resolveSslMode(databaseUrl, env = process.env) {
  const configuredMode = normalizeSslMode(env.DATABASE_SSL_MODE);
  if (configuredMode) return configuredMode;

  const legacySsl = String(env.DATABASE_SSL || "").trim().toLowerCase();
  const legacyRejectUnauthorized = String(env.DATABASE_SSL_REJECT_UNAUTHORIZED || "").trim().toLowerCase();
  if (legacySsl === "false") return "disable";
  if (legacyRejectUnauthorized === "false") return "require";
  if (legacySsl === "true" || legacyRejectUnauthorized === "true") return "verify-full";
  return isLocalDatabaseUrl(databaseUrl) ? "disable" : "verify-full";
}

function getDatabaseSslConfig(databaseUrl, env = process.env) {
  const mode = resolveSslMode(databaseUrl, env);
  if (mode === "disable") return false;
  if (mode === "require") return { rejectUnauthorized: false };

  const ca = normalizeCertificate(env.DATABASE_CA_CERT || env.DATABASE_SSL_CA);
  return {
    rejectUnauthorized: true,
    ...(ca ? { ca } : {}),
    ...(mode === "verify-ca" ? { checkServerIdentity: () => undefined } : {}),
  };
}

module.exports = {
  assertNoConnectionStringSslOverrides,
  getDatabaseSslConfig,
  isLocalDatabaseUrl,
  normalizeCertificate,
  resolveSslMode,
};
