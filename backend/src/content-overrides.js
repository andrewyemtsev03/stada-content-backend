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
    domImages: bucket?.domImages && typeof bucket.domImages === "object" ? bucket.domImages : {},
    updatedAt: bucket?.updatedAt || null,
  };
}

function getPageOverrides(countryId, language, pagePath) {
  const overrides = readContentOverrides();
  const countryPages = overrides.pages?.[countryId] || {};
  const languageBucket = normalizeBucket(countryPages?.[language]?.[pagePath]);
  const globalBucket = normalizeBucket(countryPages?._all?.[pagePath]);
  const fallbackBucket = normalizeBucket(
    Object.entries(countryPages)
      .filter(([candidateLanguage]) => candidateLanguage !== "_all" && candidateLanguage !== language)
      .map(([, pages]) => pages?.[pagePath])
      .find(bucket => bucket?.domImages && Object.keys(bucket.domImages).length > 0)
  );

  return {
    text: languageBucket.text,
    domText: languageBucket.domText,
    domImages: {
      ...fallbackBucket.domImages,
      ...globalBucket.domImages,
      ...languageBucket.domImages,
    },
    updatedAt: languageBucket.updatedAt || globalBucket.updatedAt || fallbackBucket.updatedAt || null,
  };
}

function hasValues(value) {
  return value && typeof value === "object" && Object.keys(value).length > 0;
}

function pruneEmptyContainers(overrides, countryId, language, pagePath) {
  if (!hasValues(overrides.pages?.[countryId]?.[language]?.[pagePath]?.text)
    && !hasValues(overrides.pages?.[countryId]?.[language]?.[pagePath]?.domText)
    && !hasValues(overrides.pages?.[countryId]?.[language]?.[pagePath]?.domImages)) {
    delete overrides.pages[countryId][language][pagePath];
  }

  if (!hasValues(overrides.pages?.[countryId]?.[language])) {
    delete overrides.pages[countryId][language];
  }

  if (!hasValues(overrides.pages?.[countryId])) {
    delete overrides.pages[countryId];
  }
}

function prunePageContainer(overrides, countryId, language, pagePath) {
  pruneEmptyContainers(overrides, countryId, language, pagePath);
}

function writeContentOverrides(overrides) {
  fs.mkdirSync(path.dirname(overridesPath), { recursive: true });
  const tempPath = `${overridesPath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, overridesPath);
}

function omitKeys(source, keys) {
  const omitted = new Set(keys || []);
  return Object.fromEntries(
    Object.entries(source || {}).filter(([key]) => !omitted.has(key))
  );
}

function savePageOverrides({
  countryId,
  language,
  pagePath,
  text = {},
  domText = {},
  domImages = {},
  submittedTextKeys = null,
  submittedDomTextIds = null,
  submittedDomImageIds = null,
}) {
  const overrides = readContentOverrides();
  const existing = normalizeBucket(overrides.pages?.[countryId]?.[language]?.[pagePath]);
  const existingGlobal = normalizeBucket(overrides.pages?.[countryId]?._all?.[pagePath]);
  const nextText = submittedTextKeys ? { ...omitKeys(existing.text, submittedTextKeys), ...text } : text;
  const nextDomText = submittedDomTextIds ? { ...omitKeys(existing.domText, submittedDomTextIds), ...domText } : domText;
  const nextDomImages = submittedDomImageIds
    ? { ...omitKeys(existingGlobal.domImages, submittedDomImageIds), ...domImages }
    : domImages;
  const nextLanguageDomImages = submittedDomImageIds ? omitKeys(existing.domImages, submittedDomImageIds) : domImages;

  overrides.pages[countryId] ||= {};
  overrides.pages[countryId][language] ||= {};
  overrides.pages[countryId][language][pagePath] = {
    text: nextText,
    domText: nextDomText,
    domImages: nextLanguageDomImages,
    updatedAt: new Date().toISOString(),
  };

  if (submittedDomImageIds) {
    overrides.pages[countryId]._all ||= {};
    overrides.pages[countryId]._all[pagePath] = {
      text: {},
      domText: {},
      domImages: nextDomImages,
      updatedAt: new Date().toISOString(),
    };
    prunePageContainer(overrides, countryId, "_all", pagePath);
  }

  prunePageContainer(overrides, countryId, language, pagePath);
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
