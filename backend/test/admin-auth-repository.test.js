const assert = require("node:assert/strict");
const test = require("node:test");

const databaseClientPath = require.resolve("../src/db/client");
const calls = [];
let attemptRow = null;

require.cache[databaseClientPath] = {
  id: databaseClientPath,
  filename: databaseClientPath,
  loaded: true,
  exports: {
    query: async (text, params = []) => {
      calls.push({ text, params });
      return { rows: [], rowCount: 0 };
    },
    withClient: async callback => callback({
      query: async (text, params = []) => {
        if (/select failed_count[\s\S]*for update/i.test(text)) {
          return { rows: attemptRow ? [attemptRow] : [], rowCount: attemptRow ? 1 : 0 };
        }
        if (/insert into admin_login_attempts/i.test(text)) {
          attemptRow = {
            failed_count: params[1],
            first_attempt_at: params[2],
            blocked_until: params[3],
          };
          return { rows: [], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      },
    }),
  },
};

const {
  createAdminSession,
  loginAttemptKey,
  recordLoginFailure,
  sessionTokenHash,
} = require("../src/admin/auth-repository");

test("database sessions store a one-way token hash instead of the cookie token", async () => {
  calls.length = 0;
  const token = "raw-cookie-token-that-must-not-be-stored";
  await createAdminSession({
    token,
    csrfToken: "csrf-token",
    account: { login: "admin", countryIds: ["georgia"] },
    expiresAt: "2026-07-14T10:00:00.000Z",
    ipAddress: "192.0.2.10",
    userAgent: "test-agent",
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].params.includes(token), false);
  assert.equal(calls[0].params[0], sessionTokenHash(token));
  assert.match(calls[0].params[0], /^[a-f0-9]{64}$/);
});

test("login-attempt identifiers do not expose the login or IP address", () => {
  const key = loginAttemptKey("192.0.2.10", "Admin@example.com");
  assert.match(key, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(key, /admin|192\.0\.2\.10/i);
});

test("login failures persist and block at the configured threshold", async () => {
  attemptRow = null;
  const options = {
    ipAddress: "192.0.2.10",
    login: "admin",
    windowMs: 15 * 60 * 1000,
    maxAttempts: 2,
  };

  const first = await recordLoginFailure(options);
  const second = await recordLoginFailure(options);

  assert.equal(first.failedCount, 1);
  assert.equal(first.blockedUntil, null);
  assert.equal(second.failedCount, 2);
  assert.ok(second.blockedUntil instanceof Date);
  assert.equal(attemptRow.failed_count, 2);
});
