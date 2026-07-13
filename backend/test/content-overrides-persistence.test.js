const assert = require("node:assert/strict");
const test = require("node:test");

const databaseClientPath = require.resolve("../src/db/client");

let rows = [{
  country_id: "georgia",
  language: "en",
  page_path: "index.html",
  text: { footer_name: "STADA Georgia" },
  dom_text: {},
  dom_images: {},
  settings: {},
  updated_at: new Date("2026-07-13T08:00:00.000Z"),
}];

function cloneRows() {
  return rows.map(row => ({
    ...row,
    text: { ...row.text },
    dom_text: { ...row.dom_text },
    dom_images: { ...row.dom_images },
    settings: { ...row.settings },
  }));
}

async function clientQuery(text, params = []) {
  if (/select source from content_override_imports/i.test(text)) {
    return { rows: [{ source: "data/content-overrides.json" }], rowCount: 1 };
  }

  if (/from content_overrides[\s\S]*for update/i.test(text)) {
    const [countryId, pagePath] = params;
    const matchingRows = cloneRows().filter(row => (
      row.country_id === countryId && row.page_path === pagePath
    ));
    return { rows: matchingRows, rowCount: matchingRows.length };
  }

  if (/insert into content_overrides/i.test(text)) {
    const [countryId, language, pagePath, rawText, rawDomText, rawDomImages, rawSettings] = params;
    const nextRow = {
      country_id: countryId,
      language,
      page_path: pagePath,
      text: JSON.parse(rawText),
      dom_text: JSON.parse(rawDomText),
      dom_images: JSON.parse(rawDomImages),
      settings: JSON.parse(rawSettings),
      updated_at: new Date("2026-07-13T09:00:00.000Z"),
    };
    rows = rows.filter(row => !(
      row.country_id === countryId
      && row.language === language
      && row.page_path === pagePath
    ));
    rows.push(nextRow);
    return { rows: [], rowCount: 1 };
  }

  if (/delete from content_overrides/i.test(text)) {
    const [countryId, language, pagePath] = params;
    const previousLength = rows.length;
    rows = rows.filter(row => !(
      row.country_id === countryId
      && row.language === language
      && row.page_path === pagePath
    ));
    return { rows: [], rowCount: previousLength - rows.length };
  }

  return { rows: [], rowCount: 0 };
}

require.cache[databaseClientPath] = {
  id: databaseClientPath,
  filename: databaseClientPath,
  loaded: true,
  exports: {
    query: async text => {
      if (/from content_overrides/i.test(text)) {
        return { rows: cloneRows(), rowCount: rows.length };
      }
      return { rows: [], rowCount: 0 };
    },
    withClient: async callback => callback({ query: clientQuery }),
  },
};

const {
  getContentOverrideStorageStatus,
  getPageOverrides,
  initializeContentOverrides,
  savePageOverrides,
} = require("../src/content-overrides");

test("content overrides are loaded from PostgreSQL and persist after a reload", async () => {
  await initializeContentOverrides();

  assert.equal(
    getPageOverrides("georgia", "en", "index.html").text.footer_name,
    "STADA Georgia"
  );
  assert.equal(getContentOverrideStorageStatus().provider, "postgresql");

  await savePageOverrides({
    countryId: "georgia",
    language: "en",
    pagePath: "index.html",
    text: { footer_name: "STADA Sakartvelo" },
  });

  assert.equal(
    getPageOverrides("georgia", "en", "index.html").text.footer_name,
    "STADA Sakartvelo"
  );
  assert.equal(rows[0].text.footer_name, "STADA Sakartvelo");
});
