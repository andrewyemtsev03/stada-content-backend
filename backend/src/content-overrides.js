const fs = require("node:fs");
const path = require("node:path");
const { query, withClient } = require("./db/client");

const backendRoot = path.resolve(__dirname, "..");
const overridesPath = path.join(backendRoot, "data", "content-overrides.json");
const refreshIntervalMs = 5000;

let overridesCache = readLegacyContentOverrides();
let storageInitialized = false;
let lastRefreshAt = 0;
let refreshPromise = null;
let saveQueue = Promise.resolve();

function emptyOverrides() {
  return {
    version: 1,
    updatedAt: null,
    pages: {},
  };
}

function readLegacyContentOverrides() {
  if (!fs.existsSync(overridesPath)) return emptyOverrides();

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(overridesPath, "utf8"));
  } catch (error) {
    throw Object.assign(new Error(`Invalid backend JSON file ${path.relative(backendRoot, overridesPath)}: ${error.message}`), {
      statusCode: 500,
      code: "INVALID_BACKEND_JSON",
    });
  }
  if (!parsed || typeof parsed !== "object") return emptyOverrides();

  return {
    version: 1,
    updatedAt: parsed.updatedAt || null,
    pages: parsed.pages && typeof parsed.pages === "object" ? parsed.pages : {},
  };
}

function normalizeBucket(bucket) {
  return {
    text: bucket?.text && typeof bucket.text === "object" && !Array.isArray(bucket.text) ? bucket.text : {},
    domText: bucket?.domText && typeof bucket.domText === "object" && !Array.isArray(bucket.domText) ? bucket.domText : {},
    domImages: bucket?.domImages && typeof bucket.domImages === "object" && !Array.isArray(bucket.domImages) ? bucket.domImages : {},
    settings: bucket?.settings && typeof bucket.settings === "object" && !Array.isArray(bucket.settings) ? bucket.settings : {},
    updatedAt: bucket?.updatedAt || null,
  };
}

function hasValues(value) {
  return value && typeof value === "object" && Object.keys(value).length > 0;
}

function bucketHasValues(bucket) {
  const normalized = normalizeBucket(bucket);
  return hasValues(normalized.text)
    || hasValues(normalized.domText)
    || hasValues(normalized.domImages)
    || hasValues(normalized.settings);
}

function rowsToContentOverrides(rows) {
  const overrides = emptyOverrides();
  let newestUpdatedAt = null;

  for (const row of rows || []) {
    const countryId = String(row.country_id || "").trim();
    const language = String(row.language || "").trim();
    const pagePath = String(row.page_path || "").trim();
    if (!countryId || !language || !pagePath) continue;

    const updatedAt = row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : row.updated_at
        ? new Date(row.updated_at).toISOString()
        : null;
    overrides.pages[countryId] ||= {};
    overrides.pages[countryId][language] ||= {};
    overrides.pages[countryId][language][pagePath] = normalizeBucket({
      text: row.text,
      domText: row.dom_text,
      domImages: row.dom_images,
      settings: row.settings,
      updatedAt,
    });

    if (updatedAt && (!newestUpdatedAt || updatedAt > newestUpdatedAt)) {
      newestUpdatedAt = updatedAt;
    }
  }

  overrides.updatedAt = newestUpdatedAt;
  return overrides;
}

function contentOverrideRows(overrides) {
  const rows = [];
  for (const [countryId, languages] of Object.entries(overrides?.pages || {})) {
    for (const [language, pages] of Object.entries(languages || {})) {
      for (const [pagePath, rawBucket] of Object.entries(pages || {})) {
        const bucket = normalizeBucket(rawBucket);
        if (!bucketHasValues(bucket)) continue;
        rows.push({ countryId, language, pagePath, bucket });
      }
    }
  }
  return rows;
}

async function importLegacyOverrides(client) {
  const source = "data/content-overrides.json";
  await client.query("select pg_advisory_xact_lock(hashtext($1))", ["content-overrides:legacy-import"]);
  const existingImport = await client.query(
    "select source from content_override_imports where source = $1",
    [source]
  );
  if (existingImport.rowCount) return 0;

  const rows = contentOverrideRows(readLegacyContentOverrides());
  for (const { countryId, language, pagePath, bucket } of rows) {
    await client.query(`
      insert into content_overrides (
        country_id,
        language,
        page_path,
        text,
        dom_text,
        dom_images,
        settings,
        updated_at
      )
      values ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, coalesce($8::timestamptz, now()))
      on conflict (country_id, language, page_path) do nothing
    `, [
      countryId,
      language,
      pagePath,
      JSON.stringify(bucket.text),
      JSON.stringify(bucket.domText),
      JSON.stringify(bucket.domImages),
      JSON.stringify(bucket.settings),
      bucket.updatedAt,
    ]);
  }

  await client.query(`
    insert into content_override_imports (source, imported_rows)
    values ($1, $2)
  `, [source, rows.length]);
  return rows.length;
}

async function loadDatabaseContentOverrides() {
  const result = await query(`
    select
      country_id,
      language,
      page_path,
      text,
      dom_text,
      dom_images,
      settings,
      updated_at
    from content_overrides
    order by country_id, language, page_path
  `);
  overridesCache = rowsToContentOverrides(result.rows);
  storageInitialized = true;
  lastRefreshAt = Date.now();
  return overridesCache;
}

async function initializeContentOverrides() {
  if (storageInitialized) return overridesCache;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    await withClient(async client => {
      await client.query("begin");
      try {
        await importLegacyOverrides(client);
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    });
    return loadDatabaseContentOverrides();
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function refreshContentOverrides({ force = false } = {}) {
  if (!storageInitialized) return initializeContentOverrides();
  if (!force && Date.now() - lastRefreshAt < refreshIntervalMs) return overridesCache;
  if (refreshPromise) {
    await refreshPromise;
    if (!force) return overridesCache;
  }

  refreshPromise = loadDatabaseContentOverrides();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function readContentOverrides() {
  return overridesCache;
}

function getContentOverrideStorageStatus() {
  return {
    provider: storageInitialized ? "postgresql" : "legacy-json",
    initialized: storageInitialized,
    overrideBuckets: contentOverrideRows(overridesCache).length,
    lastRefreshAt: lastRefreshAt ? new Date(lastRefreshAt).toISOString() : null,
  };
}

function getPageOverrides(countryId, language, pagePath) {
  const countryPages = overridesCache.pages?.[countryId] || {};
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
    settings: {
      ...fallbackBucket.settings,
      ...globalBucket.settings,
      ...languageBucket.settings,
    },
    updatedAt: languageBucket.updatedAt || globalBucket.updatedAt || fallbackBucket.updatedAt || null,
  };
}

function omitKeys(source, keys) {
  const omitted = new Set(keys || []);
  return Object.fromEntries(
    Object.entries(source || {}).filter(([key]) => !omitted.has(key))
  );
}

async function persistBucket(client, countryId, language, pagePath, bucket) {
  const normalized = normalizeBucket(bucket);
  if (!bucketHasValues(normalized)) {
    await client.query(`
      delete from content_overrides
      where country_id = $1 and language = $2 and page_path = $3
    `, [countryId, language, pagePath]);
    return;
  }

  await client.query(`
    insert into content_overrides (
      country_id,
      language,
      page_path,
      text,
      dom_text,
      dom_images,
      settings,
      updated_at
    )
    values ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, now())
    on conflict (country_id, language, page_path) do update set
      text = excluded.text,
      dom_text = excluded.dom_text,
      dom_images = excluded.dom_images,
      settings = excluded.settings,
      updated_at = now()
  `, [
    countryId,
    language,
    pagePath,
    JSON.stringify(normalized.text),
    JSON.stringify(normalized.domText),
    JSON.stringify(normalized.domImages),
    JSON.stringify(normalized.settings),
  ]);
}

async function savePageOverridesNow({
  countryId,
  language,
  pagePath,
  text = {},
  domText = {},
  domImages = {},
  settings = {},
  languageSettings = {},
  submittedTextKeys = null,
  submittedDomTextIds = null,
  submittedDomImageIds = null,
  submittedSettingKeys = null,
  submittedLanguageSettingKeys = null,
}) {
  await initializeContentOverrides();

  await withClient(async client => {
    await client.query("begin");
    try {
      await client.query("select pg_advisory_xact_lock(hashtext($1))", [`${countryId}:${pagePath}`]);
      const result = await client.query(`
        select
          country_id,
          language,
          page_path,
          text,
          dom_text,
          dom_images,
          settings,
          updated_at
        from content_overrides
        where country_id = $1 and page_path = $2
        for update
      `, [countryId, pagePath]);
      const stored = rowsToContentOverrides(result.rows);
      const existing = normalizeBucket(stored.pages?.[countryId]?.[language]?.[pagePath]);
      const existingGlobal = normalizeBucket(stored.pages?.[countryId]?._all?.[pagePath]);
      const nextText = submittedTextKeys ? { ...omitKeys(existing.text, submittedTextKeys), ...text } : text;
      const nextDomText = submittedDomTextIds ? { ...omitKeys(existing.domText, submittedDomTextIds), ...domText } : domText;
      const nextDomImages = submittedDomImageIds
        ? { ...omitKeys(existingGlobal.domImages, submittedDomImageIds), ...domImages }
        : existingGlobal.domImages;
      const nextLanguageDomImages = submittedDomImageIds ? omitKeys(existing.domImages, submittedDomImageIds) : domImages;
      const nextSettings = submittedSettingKeys
        ? { ...omitKeys(existingGlobal.settings, submittedSettingKeys), ...settings }
        : existingGlobal.settings;
      const nextLanguageSettings = submittedLanguageSettingKeys
        ? { ...omitKeys(existing.settings, submittedLanguageSettingKeys), ...languageSettings }
        : submittedSettingKeys
          ? omitKeys(existing.settings, submittedSettingKeys)
          : settings;

      await persistBucket(client, countryId, language, pagePath, {
        text: nextText,
        domText: nextDomText,
        domImages: nextLanguageDomImages,
        settings: nextLanguageSettings,
      });

      if (submittedDomImageIds || submittedSettingKeys) {
        await persistBucket(client, countryId, "_all", pagePath, {
          text: existingGlobal.text,
          domText: existingGlobal.domText,
          domImages: nextDomImages,
          settings: nextSettings,
        });
      }

      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });

  await refreshContentOverrides({ force: true });
  return getPageOverrides(countryId, language, pagePath);
}

function savePageOverrides(options) {
  const operation = saveQueue.then(() => savePageOverridesNow(options));
  saveQueue = operation.catch(() => undefined);
  return operation;
}

module.exports = {
  getContentOverrideStorageStatus,
  getPageOverrides,
  initializeContentOverrides,
  overridesPath,
  readContentOverrides,
  refreshContentOverrides,
  savePageOverrides,
};
