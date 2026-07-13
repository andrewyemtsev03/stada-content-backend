const assert = require("node:assert/strict");
const test = require("node:test");

const {
  assertNoConnectionStringSslOverrides,
  getDatabaseSslConfig,
  normalizeCertificate,
  resolveSslMode,
} = require("../src/db/tls");

test("connection-string SSL parameters cannot override verified TLS configuration", () => {
  assert.doesNotThrow(() => assertNoConnectionStringSslOverrides(
    "postgresql://user:pass@db.example.com:5432/app?application_name=stada"
  ));
  assert.throws(
    () => assertNoConnectionStringSslOverrides(
      "postgresql://user:pass@db.example.com:5432/app?sslmode=require"
    ),
    error => error.code === "DATABASE_URL_SSL_CONFLICT"
  );
});

test("local PostgreSQL connections disable TLS by default", () => {
  assert.equal(resolveSslMode("postgresql://user:pass@localhost:5432/app", {}), "disable");
  assert.equal(getDatabaseSslConfig("postgresql://user:pass@127.0.0.1:5432/app", {}), false);
});

test("legacy TLS enablement now opts into verified TLS", () => {
  assert.equal(resolveSslMode("postgresql://user:pass@localhost:5432/app", {
    DATABASE_SSL: "true",
  }), "verify-full");
  assert.equal(resolveSslMode("postgresql://user:pass@localhost:5432/app", {
    DATABASE_SSL_REJECT_UNAUTHORIZED: "true",
  }), "verify-full");
});

test("remote PostgreSQL connections verify certificates by default", () => {
  assert.equal(resolveSslMode("postgresql://user:pass@db.example.com:5432/app", {}), "verify-full");
  assert.deepEqual(
    getDatabaseSslConfig("postgresql://user:pass@db.example.com:5432/app", {}),
    { rejectUnauthorized: true }
  );
});

test("a configured database CA is passed to the TLS verifier", () => {
  const certificate = "-----BEGIN CERTIFICATE-----\\nexample\\n-----END CERTIFICATE-----";
  assert.equal(normalizeCertificate(certificate).includes("\\n"), false);
  assert.deepEqual(
    getDatabaseSslConfig("postgresql://user:pass@db.example.com:5432/app", {
      DATABASE_SSL_MODE: "verify-full",
      DATABASE_CA_CERT: certificate,
    }),
    {
      rejectUnauthorized: true,
      ca: "-----BEGIN CERTIFICATE-----\nexample\n-----END CERTIFICATE-----",
    }
  );
});

test("TLS encryption without identity verification requires an explicit compatibility mode", () => {
  assert.deepEqual(
    getDatabaseSslConfig("postgresql://user:pass@db.example.com:5432/app", {
      DATABASE_SSL_MODE: "require",
    }),
    { rejectUnauthorized: false }
  );
});

test("verify-ca keeps certificate verification while explicitly skipping hostname matching", () => {
  const config = getDatabaseSslConfig("postgresql://user:pass@db.example.com:5432/app", {
    DATABASE_SSL_MODE: "verify-ca",
  });
  assert.equal(config.rejectUnauthorized, true);
  assert.equal(typeof config.checkServerIdentity, "function");
  assert.equal(config.checkServerIdentity(), undefined);
});

test("unsupported database TLS modes fail closed", () => {
  assert.throws(
    () => getDatabaseSslConfig("postgresql://user:pass@db.example.com:5432/app", {
      DATABASE_SSL_MODE: "prefer",
    }),
    error => error.code === "DATABASE_SSL_MODE_INVALID"
  );
});
