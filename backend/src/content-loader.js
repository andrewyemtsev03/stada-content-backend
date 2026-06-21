const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { getPageOverrides } = require("./content-overrides");

const backendRoot = path.resolve(__dirname, "..");
const configPath = path.join(backendRoot, "data", "site-config.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadConfig() {
  const config = readJson(configPath);
  if (!config.countries || typeof config.countries !== "object") {
    throw Object.assign(new Error("Backend country config must include a countries object."), {
      statusCode: 500,
      code: "INVALID_CONFIG",
    });
  }
  return config;
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[_.\s]+/g, "-")
    .replace(/\/+$/, "");
}

function unique(values) {
  return [...new Set(values.filter(value => value !== null && value !== undefined && value !== ""))];
}

function listCountries() {
  const config = loadConfig();
  return Object.values(config.countries).map(country => ({
    id: country.id,
    name: country.name,
    siteName: country.siteName,
    domain: country.domain,
    siteUrl: country.siteUrl,
    aliases: country.aliases || [],
    defaultLanguage: country.defaultLanguage,
    supportedLanguages: country.supportedLanguages || [],
  }));
}

function findCountryConfig(config, countryInput) {
  const requested = normalizeSlug(countryInput || config.defaultCountry);
  const countries = Object.values(config.countries);
  const country = countries.find(candidate => {
    const matchValues = unique([
      candidate.id,
      candidate.name,
      candidate.siteName,
      candidate.domain,
      ...(candidate.aliases || []),
    ]).map(normalizeSlug);
    return matchValues.includes(requested);
  });

  if (!country) {
    throw Object.assign(new Error(`Country "${countryInput}" is not configured for this backend yet.`), {
      statusCode: 404,
      code: "COUNTRY_NOT_CONFIGURED",
      knownCountries: countries.map(candidate => candidate.id),
    });
  }

  return country;
}

function resolveBackendPath(filePath) {
  if (!filePath) return "";
  return path.isAbsolute(filePath) ? filePath : path.resolve(backendRoot, filePath);
}

function normalizePagePath(pageInput) {
  const withoutHash = String(pageInput || "")
    .split("#")[0]
    .split("?")[0]
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .trim();

  if (!withoutHash || withoutHash === "." || withoutHash === "index") return "index.html";
  if (withoutHash.endsWith("/")) return `${withoutHash}index.html`;
  return path.posix.extname(withoutHash) ? withoutHash : `${withoutHash}.html`;
}

function resolveHtmlPath(homepageConfig, pageInput) {
  const homepagePath = resolveBackendPath(homepageConfig.htmlPath);
  const siteRoot = path.dirname(homepagePath);
  const pagePath = normalizePagePath(pageInput);

  if (pagePath.split("/").includes("..")) {
    throw Object.assign(new Error("Page path cannot include parent directory segments."), {
      statusCode: 400,
      code: "INVALID_PAGE_PATH",
    });
  }

  if (path.extname(pagePath).toLowerCase() !== ".html") {
    throw Object.assign(new Error("Only HTML pages can be loaded."), {
      statusCode: 400,
      code: "INVALID_PAGE_PATH",
    });
  }

  const resolvedPath = path.resolve(siteRoot, pagePath);
  const relativePath = path.relative(siteRoot, resolvedPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw Object.assign(new Error("Page path is outside the configured site root."), {
      statusCode: 400,
      code: "INVALID_PAGE_PATH",
    });
  }

  if (!fs.existsSync(resolvedPath)) {
    throw Object.assign(new Error(`Page "${pagePath}" was not found.`), {
      statusCode: 404,
      code: "PAGE_NOT_FOUND",
      page: pagePath,
    });
  }

  return {
    htmlPath: resolvedPath,
    pagePath: relativePath.replace(/\\/g, "/"),
  };
}

function extractBalancedLiteral(source, openIndex, openChar, closeChar, label) {
  let depth = 0;
  let quote = "";
  let escaping = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaping) {
        escaping = false;
        continue;
      }
      if (char === "\\") {
        escaping = true;
        continue;
      }
      if (char === quote) quote = "";
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex, index + 1);
    }
  }

  throw new Error(`Could not find closing "${closeChar}" for "${label}".`);
}

function extractJsLiteral(source, name, openChar, closeChar) {
  const assignmentPattern = new RegExp(`(?:export\\s+)?(?:const|let|var)\\s+${name}\\s*=`);
  const assignmentMatch = assignmentPattern.exec(source);
  if (!assignmentMatch) {
    throw new Error(`Could not find JavaScript literal "${name}".`);
  }

  const openIndex = source.indexOf(openChar, assignmentMatch.index + assignmentMatch[0].length);
  if (openIndex === -1) {
    throw new Error(`Could not find opening "${openChar}" for "${name}".`);
  }

  return extractBalancedLiteral(source, openIndex, openChar, closeChar, name);
}

function extractFunctionDeclaration(source, name) {
  const functionPattern = new RegExp(`function\\s+${name}\\s*\\(`);
  const functionMatch = functionPattern.exec(source);
  if (!functionMatch) {
    throw new Error(`Could not find JavaScript function "${name}".`);
  }

  const openIndex = source.indexOf("{", functionMatch.index);
  if (openIndex === -1) {
    throw new Error(`Could not find opening "{" for "${name}".`);
  }

  return source.slice(functionMatch.index, openIndex) + extractBalancedLiteral(source, openIndex, "{", "}", name);
}

function evaluateLiteral(literal, label) {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`globalThis.__value = (${literal});`, sandbox, {
    timeout: 1000,
    displayErrors: true,
    filename: `${label}.literal.js`,
  });
  return sandbox.__value;
}

function loadTranslations(scriptPath) {
  const source = fs.readFileSync(scriptPath, "utf8");
  const literal = extractJsLiteral(source, "translations", "{", "}");
  const translations = evaluateLiteral(literal, "translations");
  applyTranslationMutations(source, translations);
  return translations;
}

function loadProductFallbackTools(scriptPath) {
  const source = fs.readFileSync(scriptPath, "utf8");
  let productFallbacksLiteral;
  let productCopyOverridesLiteral = "{ ru: {}, kz: {} }";
  let getProductFallbackFunction;

  try {
    productFallbacksLiteral = extractJsLiteral(source, "productFallbacks", "{", "}");
    getProductFallbackFunction = extractFunctionDeclaration(source, "getProductFallback");
  } catch (error) {
    return {
      productFallbacks: {},
      getProductFallback: () => "",
    };
  }

  try {
    productCopyOverridesLiteral = extractJsLiteral(source, "productCopyOverrides", "{", "}");
  } catch (error) {
    // Product copy overrides are optional for older frontend bundles.
  }

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(
    `
      const productFallbacks = (${productFallbacksLiteral});
      const productCopyOverrides = (${productCopyOverridesLiteral});
      if (productCopyOverrides.ru) Object.assign(productFallbacks.ru ||= {}, productCopyOverrides.ru);
      if (productCopyOverrides.kz) Object.assign(productFallbacks.kz ||= {}, productCopyOverrides.kz);
      ${getProductFallbackFunction}
      globalThis.__productFallbacks = productFallbacks;
      globalThis.__getProductFallback = getProductFallback;
    `,
    sandbox,
    {
      timeout: 1000,
      displayErrors: true,
      filename: "product-fallbacks.literal.js",
    }
  );

  applyProductFallbackMutations(source, sandbox.__productFallbacks || {});

  return {
    productFallbacks: sandbox.__productFallbacks || {},
    getProductFallback: typeof sandbox.__getProductFallback === "function" ? sandbox.__getProductFallback : () => "",
  };
}

function applyProductFallbackMutations(source, productFallbacks) {
  const objectAssignPattern = /Object\.assign\s*\(\s*productFallbacks\.([a-zA-Z0-9_$]+)\s*,\s*{/g;
  let match;

  while ((match = objectAssignPattern.exec(source)) !== null) {
    const openIndex = source.lastIndexOf("{", objectAssignPattern.lastIndex - 1);
    if (openIndex === -1) continue;
    const objectLiteral = extractBalancedLiteral(
      source,
      openIndex,
      "{",
      "}",
      `Object.assign(productFallbacks.${match[1]})`
    );
    productFallbacks[match[1]] ||= {};
    Object.assign(
      productFallbacks[match[1]],
      evaluateLiteral(objectLiteral, `productFallbacks.${match[1]}`)
    );
    objectAssignPattern.lastIndex = openIndex + objectLiteral.length;
  }
}

function applyTranslationMutations(source, translations) {
  const mutations = [];
  const directAssignmentPattern = /translations\.([a-zA-Z0-9_$]+)\.([a-zA-Z0-9_$]+)\s*=\s*([^;]+);/g;
  let match;

  while ((match = directAssignmentPattern.exec(source)) !== null) {
    mutations.push({
      index: match.index,
      type: "direct",
      language: match[1],
      key: match[2],
      valueLiteral: match[3],
    });
  }

  const objectAssignPattern = /Object\.assign\s*\(\s*translations\.([a-zA-Z0-9_$]+)\s*,/g;
  while ((match = objectAssignPattern.exec(source)) !== null) {
    const openIndex = source.indexOf("{", objectAssignPattern.lastIndex);
    if (openIndex === -1) continue;
    const objectLiteral = extractBalancedLiteral(
      source,
      openIndex,
      "{",
      "}",
      `Object.assign(translations.${match[1]})`
    );
    mutations.push({
      index: match.index,
      type: "assign",
      language: match[1],
      objectLiteral,
    });
    objectAssignPattern.lastIndex = openIndex + objectLiteral.length;
  }

  mutations.sort((left, right) => left.index - right.index);

  for (const mutation of mutations) {
    translations[mutation.language] ||= {};
    if (mutation.type === "direct") {
      translations[mutation.language][mutation.key] = evaluateLiteral(
        mutation.valueLiteral,
        `translations.${mutation.language}.${mutation.key}`
      );
    } else {
      Object.assign(
        translations[mutation.language],
        evaluateLiteral(mutation.objectLiteral, `translations.${mutation.language}`)
      );
    }
  }
}

function loadWorldwideCountries(countriesDataPath) {
  if (!countriesDataPath || !fs.existsSync(countriesDataPath)) return [];
  const source = fs.readFileSync(countriesDataPath, "utf8");
  const literal = extractJsLiteral(source, "countriesData", "[", "]");
  return evaluateLiteral(literal, "countriesData");
}

function decodeHtml(value) {
  const namedEntities = {
    amp: "&",
    gt: ">",
    lt: "<",
    quot: "\"",
    apos: "'",
    nbsp: " ",
    copy: "\u00a9",
    lsaquo: "\u2039",
    rsaquo: "\u203a",
  };

  return String(value || "")
    .replace(/&(#x[a-f0-9]+|#\d+|[a-z]+);/gi, (match, entity) => {
      const lower = entity.toLowerCase();
      if (lower.startsWith("#x")) return String.fromCodePoint(parseInt(lower.slice(2), 16));
      if (lower.startsWith("#")) return String.fromCodePoint(parseInt(lower.slice(1), 10));
      return Object.prototype.hasOwnProperty.call(namedEntities, lower) ? namedEntities[lower] : match;
    })
    .replace(/\u00a0/g, " ");
}

function normalizeText(value) {
  return decodeHtml(value).replace(/\s+/g, " ").trim();
}

function parseAttributes(attributeSource) {
  const attributes = {};
  const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = attributePattern.exec(attributeSource)) !== null) {
    attributes[match[1]] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

function extractPageTitle(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? normalizeText(match[1]) : "";
}

function extractTranslationKeys(html) {
  const keys = [];
  const keyPattern = /data-(?:i18n-key|caption-key|title-key|lead-key)\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;
  let match;
  while ((match = keyPattern.exec(html)) !== null) {
    keys.push(match[1] || match[2]);
  }
  return unique(keys);
}

function extractStaticTexts(html) {
  const texts = [];
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, "");
  const textNodePattern = />\s*([^<>]+?)\s*</g;
  let match;

  while ((match = textNodePattern.exec(cleanHtml)) !== null) {
    const text = normalizeText(match[1]);
    if (!text || text === "/" || text === "--") continue;
    texts.push(text);
  }

  return unique(texts);
}

function extractBackendTextItems(html) {
  const items = [];
  const textPattern = /<([a-z][a-z0-9:-]*)\b([^>]*)\bdata-backend-text-id\s*=\s*(?:"([^"]+)"|'([^']+)')([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = textPattern.exec(html)) !== null) {
    const value = normalizeText(match[6]);
    if (!value) continue;
    items.push({
      id: match[3] || match[4],
      tag: match[1].toLowerCase(),
      value,
    });
  }

  return items;
}

function makeAssetUrl(src, assetsBaseUrl) {
  if (!src) return "";
  if (/^(?:https?:)?\/\//i.test(src) || /^data:/i.test(src)) return src;
  if (!assetsBaseUrl) return src;

  if (/^https?:\/\//i.test(assetsBaseUrl)) {
    return new URL(src.replace(/^\/+/, ""), assetsBaseUrl.endsWith("/") ? assetsBaseUrl : `${assetsBaseUrl}/`).href;
  }

  const base = assetsBaseUrl.endsWith("/") ? assetsBaseUrl : `${assetsBaseUrl}/`;
  return `${base}${src.replace(/^\/+/, "")}`;
}

function extractBackendImages(html, assetsBaseUrl) {
  const images = [];
  const imagePattern = /<img\b([^>]*)>/gi;
  let match;

  while ((match = imagePattern.exec(html)) !== null) {
    const attrs = parseAttributes(match[1]);
    const id = attrs["data-backend-image-id"];
    if (!id) continue;
    const src = attrs["data-backend-src"] || attrs.src;
    if (!src) continue;
    images.push({
      id,
      src,
      url: makeAssetUrl(src, assetsBaseUrl),
      alt: attrs.alt || "",
      loading: attrs.loading || "",
      srcset: attrs.srcset || "",
      sizes: attrs.sizes || "",
    });
  }

  return images;
}

function extractImages(html, sectionId, assetsBaseUrl) {
  const images = [];
  const imagePattern = /<img\b([^>]*)>/gi;
  let match;

  while ((match = imagePattern.exec(html)) !== null) {
    const attrs = parseAttributes(match[1]);
    const src = attrs["data-backend-src"] || attrs.src;
    if (!src) continue;
    images.push({
      section: sectionId,
      src,
      url: makeAssetUrl(src, assetsBaseUrl),
      alt: attrs.alt || "",
      loading: attrs.loading || "",
    });
  }

  return images;
}

function extractBlock(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, "i");
  const match = html.match(pattern);
  return match ? match[0] : "";
}

function extractSections(html) {
  const sections = [];
  const nav = extractBlock(html, "nav");
  if (nav) sections.push({ id: "navigation", label: "Navigation", html: nav });

  const hero = extractBlock(html, "header");
  if (hero) sections.push({ id: "hero", label: "Hero", html: hero });

  const sectionPattern = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
  let match;
  while ((match = sectionPattern.exec(html)) !== null) {
    const attributes = parseAttributes(match[1]);
    const id = attributes.id || attributes.class || `section-${sections.length + 1}`;
    sections.push({
      id: normalizeSlug(id),
      label: attributes.id || attributes.class || "Section",
      html: match[0],
    });
  }

  const footer = extractBlock(html, "footer");
  if (footer) sections.push({ id: "footer", label: "Footer", html: footer });

  return sections;
}

function isOptionalEmptyProductKey(key) {
  return /^product_[a-z0-9_]+_benefit\d+$/i.test(key);
}

function resolveTranslation(translations, productFallbackTools, language, fallbackLanguage, key) {
  const languageOrder = unique([language, fallbackLanguage, "ru", "kz", "en"]);
  for (const candidateLanguage of languageOrder) {
    const value = translations[candidateLanguage]?.[key];
    if (value) {
      return {
        key,
        value,
        language: candidateLanguage,
      };
    }

    const fallbackValue = productFallbackTools.getProductFallback(candidateLanguage, key);
    if (fallbackValue || isOptionalEmptyProductKey(key)) {
      return {
        key,
        value: fallbackValue,
        language: candidateLanguage,
        source: "productFallback",
      };
    }
  }

  return {
    key,
    value: null,
    language: null,
  };
}

function chooseLanguage(countryConfig, translations, languageInput) {
  const supportedLanguages = countryConfig.supportedLanguages?.length
    ? countryConfig.supportedLanguages
    : Object.keys(translations);
  const requestedLanguage = String(languageInput || countryConfig.defaultLanguage || "").trim().toLowerCase();

  if (requestedLanguage && supportedLanguages.includes(requestedLanguage)) return requestedLanguage;
  if (countryConfig.defaultLanguage && supportedLanguages.includes(countryConfig.defaultLanguage)) {
    return countryConfig.defaultLanguage;
  }
  return supportedLanguages[0] || "ru";
}

function findWorldwideCountry(countryConfig, worldwideCountries) {
  const targetValues = unique([countryConfig.id, countryConfig.name, ...(countryConfig.aliases || [])]).map(normalizeSlug);
  return worldwideCountries.find(country => {
    const matchValues = unique([country.id, country.name, country.website]).map(normalizeSlug);
    return matchValues.some(value => targetValues.includes(value));
  }) || null;
}

function buildSectionPayload(section, translations, productFallbackTools, language, fallbackLanguage, assetsBaseUrl) {
  const translatedTexts = extractTranslationKeys(section.html)
    .map(key => resolveTranslation(translations, productFallbackTools, language, fallbackLanguage, key));

  return {
    id: section.id,
    label: section.label,
    translatedTexts,
    staticTexts: extractStaticTexts(section.html),
    photos: extractImages(section.html, section.id, assetsBaseUrl),
  };
}

function applyContentOverrides(payload, countryId, language, pagePath) {
  const overrides = getPageOverrides(countryId, language, pagePath);
  const textOverrides = overrides.text || {};
  const domTextOverrides = overrides.domText || {};

  for (const [key, value] of Object.entries(textOverrides)) {
    if (typeof value === "string") {
      payload.content.text[key] = value;
    }
  }

  for (const section of payload.content.sections || []) {
    for (const item of section.translatedTexts || []) {
      if (Object.prototype.hasOwnProperty.call(textOverrides, item.key)
        && typeof textOverrides[item.key] === "string") {
        item.value = textOverrides[item.key];
        item.source = "override";
      }
    }
  }

  payload.content.dom.text = (payload.content.dom.text || []).map(item => {
    if (!Object.prototype.hasOwnProperty.call(domTextOverrides, item.id)
      || typeof domTextOverrides[item.id] !== "string") {
      return item;
    }

    return {
      ...item,
      value: domTextOverrides[item.id],
      source: "override",
    };
  });

  const overriddenTitle = payload.content.dom.text.find(item => {
    return item.tag === "title" && Object.prototype.hasOwnProperty.call(domTextOverrides, item.id);
  });
  if (overriddenTitle) {
    payload.content.pageTitle = overriddenTitle.value;
  }

  payload.content.overrides = {
    updatedAt: overrides.updatedAt,
    textKeys: Object.keys(textOverrides),
    domTextIds: Object.keys(domTextOverrides),
  };
}

function getPagePayload(options = {}) {
  const config = loadConfig();
  const countryConfig = findCountryConfig(config, options.country);
  const homepageConfig = countryConfig.homepage || {};
  const { htmlPath, pagePath } = resolveHtmlPath(homepageConfig, options.page || options.pagePath || options.path);
  const translationScriptPath = resolveBackendPath(homepageConfig.translationScriptPath);
  const countriesDataPath = resolveBackendPath(homepageConfig.countriesDataPath);

  const html = fs.readFileSync(htmlPath, "utf8");
  const translations = loadTranslations(translationScriptPath);
  const productFallbackTools = loadProductFallbackTools(translationScriptPath);
  const language = chooseLanguage(countryConfig, translations, options.lang || options.language);
  const fallbackLanguage = countryConfig.defaultLanguage || language;
  const worldwideCountries = loadWorldwideCountries(countriesDataPath);
  const worldwideCountry = findWorldwideCountry(countryConfig, worldwideCountries);
  const sections = extractSections(html).map(section =>
    buildSectionPayload(section, translations, productFallbackTools, language, fallbackLanguage, homepageConfig.assetsBaseUrl)
  );
  const allKeys = extractTranslationKeys(html);
  const text = Object.fromEntries(
    allKeys.map(key => {
      const translated = resolveTranslation(translations, productFallbackTools, language, fallbackLanguage, key);
      return [key, translated.value];
    })
  );

  const payload = {
    country: {
      id: countryConfig.id,
      name: countryConfig.name,
      siteName: countryConfig.siteName,
      domain: countryConfig.domain,
      siteUrl: countryConfig.siteUrl,
      defaultLanguage: countryConfig.defaultLanguage,
      supportedLanguages: countryConfig.supportedLanguages || [],
      worldwide: worldwideCountry,
    },
    language,
    requestedLanguage: options.lang || options.language || null,
    page: {
      path: pagePath,
    },
    content: {
      pageTitle: extractPageTitle(html),
      text,
      missingTranslationKeys: allKeys.filter(key => text[key] === null),
      staticTexts: unique(sections.flatMap(section => section.staticTexts)),
      photos: uniqueImages(sections.flatMap(section => section.photos)),
      dom: {
        text: extractBackendTextItems(html),
        images: extractBackendImages(html, homepageConfig.assetsBaseUrl),
      },
      sections,
    },
  };

  if (options.applyOverrides !== false) {
    applyContentOverrides(payload, countryConfig.id, language, pagePath);
  }

  return payload;
}

function getHomepagePayload(options = {}) {
  return getPagePayload({ ...options, page: "index.html" });
}

function uniqueImages(images) {
  const seen = new Set();
  return images.filter(image => {
    const key = `${image.section}:${image.src}:${image.alt}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = {
  getHomepagePayload,
  getPagePayload,
  listCountries,
};
