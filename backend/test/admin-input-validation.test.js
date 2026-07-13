const assert = require("node:assert/strict");
const test = require("node:test");

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

const { normalizeProductPayload, normalizePublicUrl } = require("../src/server");

test("public URL normalization rejects executable and traversal URLs", () => {
  assert.equal(normalizePublicUrl("javascript:alert(1)"), "");
  assert.equal(normalizePublicUrl("data:text/html,<script>alert(1)</script>"), "");
  assert.equal(normalizePublicUrl("../../private.txt"), "");
  assert.equal(normalizePublicUrl("https://example.com/product"), "https://example.com/product");
});

test("product normalization removes unsafe purchase and image URLs", () => {
  const product = normalizeProductPayload({
    id: "safe-product",
    status: "published",
    translations: { en: { name: "Safe product" } },
    images: {
      card: { src: "javascript:alert(1)", alt: "Card" },
    },
    purchaseLinks: [
      { label: "Unsafe", url: "javascript:alert(1)" },
      { label: "Allowed", url: "https://shop.example/product" },
    ],
  }, "", "georgia");

  assert.equal(product.images.card.src, "");
  assert.deepEqual(product.purchaseLinks.map(link => link.label), ["Allowed"]);
});
