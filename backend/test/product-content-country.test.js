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

const { getPagePayload } = require("../src/content-loader");
const { applyDatabaseProductsToPayload } = require("../src/products/content");

test("homepage composition supports countries without database products", () => {
  const locales = [
    ["kyrgyzstan", "ru"],
    ["georgia", "ge"],
    ["moldova", "ro"],
  ];

  for (const [country, lang] of locales) {
    const payload = getPagePayload({
      country,
      lang,
      page: "index.html",
      applyOverrides: false,
    });

    assert.doesNotThrow(() => applyDatabaseProductsToPayload(payload, [], []));
    assert.equal(payload.country.id, country);
  }
});
