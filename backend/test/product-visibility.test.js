const assert = require("node:assert/strict");
const test = require("node:test");

const databaseClientPath = require.resolve("../src/db/client");
const capturedQueries = [];

require.cache[databaseClientPath] = {
  id: databaseClientPath,
  filename: databaseClientPath,
  loaded: true,
  exports: {
    query: async (text, params = []) => {
      capturedQueries.push({ text, params });
      return { rows: [], rowCount: 0 };
    },
    withClient: async () => {
      throw new Error("withClient is not expected in product visibility tests");
    },
  },
};

const { getProduct, listProducts } = require("../src/products/repository");

function latestProductQuery() {
  const entry = [...capturedQueries]
    .reverse()
    .find(candidate => /from products p/i.test(candidate.text));
  assert.ok(entry, "Expected a products query to be executed");
  return entry.text;
}

test("public catalogue queries include only published products", async () => {
  capturedQueries.length = 0;
  await listProducts("kazakhstan", { publishedOnly: true });
  assert.match(latestProductQuery(), /p\.status\s*=\s*'published'/i);
});

test("admin catalogue queries retain access to every product status", async () => {
  capturedQueries.length = 0;
  await listProducts("kazakhstan");
  assert.doesNotMatch(latestProductQuery(), /p\.status\s*=\s*'published'/i);
});

test("public direct-product queries include only published products", async () => {
  capturedQueries.length = 0;
  await getProduct("example-product", "kazakhstan", { publishedOnly: true });
  assert.match(latestProductQuery(), /p\.status\s*=\s*'published'/i);
});

test("admin direct-product queries retain access to drafts", async () => {
  capturedQueries.length = 0;
  await getProduct("example-product", "kazakhstan");
  assert.doesNotMatch(latestProductQuery(), /p\.status\s*=\s*'published'/i);
});
