const assert = require("node:assert/strict");
const net = require("node:net");
const test = require("node:test");

process.env.NODE_ENV = "production";
process.env.MAX_JSON_BODY_BYTES = "64";
process.env.SERVER_REQUEST_TIMEOUT_MS = "20000";
process.env.SERVER_HEADERS_TIMEOUT_MS = "10000";
process.env.SERVER_KEEP_ALIVE_TIMEOUT_MS = "3000";
process.env.SERVER_MAX_REQUESTS_PER_SOCKET = "25";

const databaseClientPath = require.resolve("../src/db/client");
require.cache[databaseClientPath] = {
  id: databaseClientPath,
  filename: databaseClientPath,
  loaded: true,
  exports: {
    checkDatabaseConnection: async () => {
      throw new Error("database password and internal hostname must stay private");
    },
    query: async () => ({ rows: [], rowCount: 0 }),
    withClient: async callback => callback({
      query: async text => {
        if (/select source from content_override_imports/i.test(text)) {
          return { rows: [{ source: "data/content-overrides.json" }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      },
    }),
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

test("unexpected errors are redacted and correlated with a request ID", async t => {
  const baseUrl = await startServer();
  t.after(stopServer);

  const loggedErrors = [];
  const originalConsoleError = console.error;
  let response;
  let payload;
  console.error = (...args) => loggedErrors.push(args);
  try {
    response = await fetch(`${baseUrl}/health/db`);
    payload = await response.json();
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(response.status, 500);
  assert.equal(payload.error.code, "SERVER_ERROR");
  assert.equal(payload.error.message, "An unexpected server error occurred.");
  assert.doesNotMatch(JSON.stringify(payload), /password|internal hostname/i);
  assert.match(payload.error.requestId, /^[0-9a-f-]{36}$/i);
  assert.equal(response.headers.get("x-request-id"), payload.error.requestId);
  assert.equal(loggedErrors.length, 1);
  assert.equal(loggedErrors[0][1].requestId, payload.error.requestId);
});

test("JSON endpoints reject unsupported content types and oversized bodies", async t => {
  const baseUrl = await startServer();
  t.after(stopServer);

  const wrongType = await fetch(`${baseUrl}/api/page`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "{}",
  });
  assert.equal(wrongType.status, 415);
  assert.equal((await wrongType.json()).error.code, "JSON_CONTENT_TYPE_REQUIRED");

  const oversized = await fetch(`${baseUrl}/api/page`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ padding: "x".repeat(100) }),
  });
  assert.equal(oversized.status, 413);
  assert.equal((await oversized.json()).error.code, "REQUEST_BODY_TOO_LARGE");

  const nonObject = await fetch(`${baseUrl}/api/page`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "null",
  });
  assert.equal(nonObject.status, 400);
  assert.equal((await nonObject.json()).error.code, "JSON_OBJECT_REQUIRED");
});

test("malformed HTTP requests receive a bounded client error without reaching the handler", async t => {
  await startServer();
  t.after(stopServer);

  const response = await new Promise((resolve, reject) => {
    const socket = net.createConnection(server.address().port, "127.0.0.1");
    let raw = "";
    socket.setEncoding("utf8");
    socket.on("connect", () => socket.write("NOT HTTP\r\n\r\n"));
    socket.on("data", chunk => { raw += chunk; });
    socket.on("end", () => resolve(raw));
    socket.on("error", reject);
  });

  assert.match(response, /^HTTP\/1\.1 400 Bad Request/);
  assert.match(response, /"code":"BAD_REQUEST"/);
});

test("the HTTP server applies explicit production limits", () => {
  assert.equal(server.requestTimeout, 20000);
  assert.equal(server.headersTimeout, 10000);
  assert.equal(server.keepAliveTimeout, 3000);
  assert.equal(server.maxRequestsPerSocket, 25);
  assert.equal(server.maxHeadersCount, 100);
});
