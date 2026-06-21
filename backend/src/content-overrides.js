const fs = require("node:fs");
const path = require("node:path");

const backendRoot = path.resolve(__dirname, "..");
const overridesPath = path.join(backendRoot, "data", "content-overrides.json");

function emptyOverrides() {
  return {
    version: 1,
    updatedAt: null,
    pages: {},
  };
}

function readContentOverrides() {
  if (!fs.existsSync(overridesPath)) return emptyOverrides();

  const parsed = JSON.parse(fs.readFileSync(overridesPath, "utf8"));
  if (!parsed || typeof parsed !== "object") return emptyOverrides();

  return {
    version: 1,
    updatedAt: parsed.updatedAt || null,
    pages: parsed.pages && typeof parsed.pages === "object" ? parsed.pages : {},
  };
}

function normalizeBucket(bucket) {
  return {
    text: bucket?.text && typeof bucket.text === "object" ? bucket.text : {},
    domText: bucket?.domText && typeof bucket.domText === "object" ? bucket.domText : {},
    updatedAt: bucket?.updatedAt || null,
  };
}

function getPageOverrides(countryId, language, pagePath) {
  const overrides = readContentOverrides();
  return normalizeBucket(overrides.pages?.[countryId]?.[language]?.[pagePath]);
}

function hasValues(value) {
  return value && typeof value === "object" && Object.keys(value).length > 0;
}

function pruneEmptyContainers(overrides, countryId, language, pagePath) {
  if (!hasValues(overrides.pages?.[countryId]?.[language]?.[pagePath]?.text)
    && !hasValues(overrides.pages?.[countryId]?.[language]?.[pagePath]?.domText)) {
    delete overrides.pages[countryId][language][pagePath];
  }

  if (!hasValues(overrides.pages?.[countryId]?.[language])) {
    delete overrides.pages[countryId][language];
  }

  if (!hasValues(overrides.pages?.[countryId])) {
    delete overrides.pages[countryId];
  }
}

function writeContentOverrides(overrides) {
  fs.mkdirSync(path.dirname(overridesPath), { recursive: true });
  const tempPath = `${overridesPath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, overridesPath);
}

function savePageOverrides({ countryId, language, pagePath, text = {}, domText = {} }) {
  const overrides = readContentOverrides();
  overrides.pages[countryId] ||= {};
  overrides.pages[countryId][language] ||= {};
  overrides.pages[countryId][language][pagePath] = {
    text,
    domText,
    updatedAt: new Date().toISOString(),
  };
  pruneEmptyContainers(overrides, countryId, language, pagePath);
  overrides.updatedAt = new Date().toISOString();
  writeContentOverrides(overrides);
  return getPageOverrides(countryId, language, pagePath);
}

module.exports = {
  getPageOverrides,
  overridesPath,
  readContentOverrides,
  savePageOverrides,
};
