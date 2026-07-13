const assert = require("node:assert/strict");
const test = require("node:test");

process.env.NODE_ENV = "production";
process.env.CORS_ORIGINS = "http://127.0.0.1:5500";
process.env.ADMIN_LOGIN = "phase2-admin";
process.env.ADMIN_PASSWORD = "a-long-random-test-password";

const databaseClientPath = require.resolve("../src/db/client");
require.cache[databaseClientPath] = {
  id: databaseClientPath,
  filename: databaseClientPath,
  loaded: true,
  exports: {
    checkDatabaseConnection: async () => ({ connected: true }),
    query: async () => ({ rows: [], rowCount: 0 }),
    withClient: async callback => callback({ query: async () => ({ rows: [], rowCount: 0 }) }),
  },
};

const authRepositoryPath = require.resolve("../src/admin/auth-repository");
let storedSession = null;
let storedToken = "";
let revoked = false;

require.cache[authRepositoryPath] = {
  id: authRepositoryPath,
  filename: authRepositoryPath,
  loaded: true,
  exports: {
    clearLoginFailures: async () => {},
    createAdminSession: async ({ token, csrfToken, account, expiresAt }) => {
      storedToken = token;
      storedSession = { csrfToken, account, expiresAt };
      revoked = false;
    },
    getAdminSession: async token => token === storedToken && !revoked ? storedSession : null,
    getLoginAttempt: async () => null,
    recordLoginFailure: async () => {},
    removeExpiredAdminSessions: async () => {},
    removeStaleLoginAttempts: async () => {},
    revokeAdminSession: async token => {
      if (token === storedToken) revoked = true;
      return revoked;
    },
  },
};

const { server } = require("../src/server");

async function startServer() {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return `http://127.0.0.1:${server.address().port}`;
}

async function stopServer() {
  if (!server.listening) return;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

test("admin login uses an HttpOnly cookie, requires CSRF, and logout revokes the session", async t => {
  const baseUrl = await startServer();
  t.after(stopServer);

  const origin = "http://127.0.0.1:5500";
  const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ login: "phase2-admin", password: "a-long-random-test-password" }),
  });
  assert.equal(loginResponse.status, 200);
  assert.equal(loginResponse.headers.get("access-control-allow-credentials"), "true");
  const setCookie = loginResponse.headers.get("set-cookie");
  assert.match(setCookie, /stada_admin_session=/i);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=None/i);

  const loginPayload = await loginResponse.json();
  assert.equal(Object.hasOwn(loginPayload.session, "token"), false);
  assert.equal(loginPayload.session.account.login, "phase2-admin");
  assert.ok(loginPayload.session.csrfToken);
  const cookie = setCookie.split(";", 1)[0];

  const sessionResponse = await fetch(`${baseUrl}/api/admin/session`, {
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.equal(sessionResponse.status, 200);

  const rejectedLogout = await fetch(`${baseUrl}/api/admin/logout`, {
    method: "POST",
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.equal(rejectedLogout.status, 403);
  assert.equal((await rejectedLogout.json()).error.code, "ADMIN_CSRF_INVALID");

  const logoutResponse = await fetch(`${baseUrl}/api/admin/logout`, {
    method: "POST",
    headers: {
      Cookie: cookie,
      Origin: origin,
      "X-CSRF-Token": loginPayload.session.csrfToken,
    },
  });
  assert.equal(logoutResponse.status, 200);
  assert.match(logoutResponse.headers.get("set-cookie"), /Max-Age=0/i);
  assert.equal(revoked, true);

  const expiredSessionResponse = await fetch(`${baseUrl}/api/admin/session`, {
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.equal(expiredSessionResponse.status, 401);
});
