const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { getPageOverrides } = require("./content-overrides");

const backendRoot = path.resolve(__dirname, "..");
const configPath = path.join(backendRoot, "data", "site-config.json");
const defaultHomeProductIds = ["coldrex", "enterogermina", "sinulan-duo", "vitrum-immunaktiv"];
const countryContentProfiles = {
  azerbaijan: {
    replacements: {
      default: [
        ["STADA Kazakhstan", "STADA Azerbaijan"],
        ["Казахстане", "Азербайджане"],
        ["Казахстан", "Азербайджан"],
        ["Kazakhstan", "Azerbaijan"],
      ],
    },
    pageTitles: {
      az: {
        "index.html": "STADA - Şirkət haqqında",
        "culture.html": "STADA - Korporativ mədəniyyət",
        "history.html": "STADA - Şirkətin tarixi",
        "products/index.html": "STADA - Məhsullarımız",
        "worldwide.html": "STADA - Filiallarımız",
      },
    },
    text: {
      ru: {
        site_name: "STADA Azerbaijan",
        hero_kicker: "STADA Azerbaijan",
        hero_sub3: "Развиваем доступные решения для семей в Азербайджане.",
        hero_text3: "В Азербайджане доверие к врачам остается важной основой заботы о здоровье",
        news_3_text: "Профилактика, доступная информация и доверительный диалог со специалистами помогают поддерживать здоровье каждый день.",
        footer_brand_text: "Мы объединяем международный опыт STADA и локальную близость к пациентам, специалистам и партнерам в Азербайджане.",
      },
      az: {
        about_heading: "STADA haqqında",
        benefits_heading: "Üstünlüklər",
        button_products: "Məhsullar",
        career_button: "Vakansiyalara baxın",
        career_heading: "STADA-da karyera",
        cta_more: "Daha ətraflı",
        culture_career_cta: "Vakansiyalara baxın",
        culture_change_title: "Dəyişiklik",
        culture_challenge_title: "Çağırış",
        culture_eyebrow: "STADA mədəniyyəti",
        culture_heading: "Etimad mədəniyyəti",
        culture_hero_lead: "Sürətli, açıq və məsuliyyətli hərəkət edirik.",
        culture_page_title: "STADA - Korporativ mədəniyyət",
        culture_purpose_eyebrow: "İnsanların sağlamlığının qayğısına qalmaq",
        culture_purpose_heading: "Aptek köklərindən etimad mədəniyyətinə",
        culture_urgency_title: "Çeviklik",
        culture_values_cta: "Dəyərlərə baxın",
        footer_access_title: "Əlçatanlıq",
        footer_back_top: "Yuxarı",
        footer_brand_text: "STADA-nın beynəlxalq təcrübəsini Azərbaycanda pasiyentlərə, mütəxəssislərə və tərəfdaşlara yaxınlıqla birləşdiririk.",
        footer_company_title: "Şirkət",
        footer_global_link: "STADA Global",
        footer_products_title: "Məhsullar",
        footer_rights: "Bütün hüquqlar qorunur.",
        footer_trust_countries: "100+ ölkə",
        footer_trust_years: "130+ il təcrübə",
        footer_warning_text: "Saytdakı məlumat mütəxəssis məsləhətini əvəz etmir. Dərman vasitələrindən istifadə etməzdən əvvəl təlimatı oxuyun.",
        footer_warning_title: "Vacibdir",
        hero_kicker: "STADA Azerbaijan",
        hero_products_description: "Müxtəlif terapevtik sahələrdə yüksək keyfiyyətli generiklər və istehlakçı sağlamlığı məhsulları təqdim edirik.",
        hero_products_heading: "Daha yaxşı həyat üçün keyfiyyətli dərmanlar",
        hero_products_label: "MƏHSULLARIMIZ",
        hero_sub1: "Hər gün etibar edilən keyfiyyətli dərmanlar.",
        hero_sub2: "STADA-nın təcrübəsi milyonlarla insanın sağlamlığını dəstəkləməyə kömək edir.",
        hero_sub3: "Azərbaycandakı ailələr üçün əlçatan həllər inkişaf etdiririk.",
        hero_text3: "Azərbaycanda sağlamlıqla bağlı etibarlı dialoq gündəlik qayğının vacib hissəsidir",
        hero_title1: "Sağlamlığın qayğısına qalırıq",
        hero_title2: "Güzəştsiz keyfiyyət",
        hero_title3: "Pasiyentlərə yaxın",
        nav_about: "Şirkət haqqında",
        nav_career: "Karyera",
        nav_categories: "Kateqoriyalar",
        nav_company: "Şirkət",
        nav_culture: "Mədəniyyət",
        nav_history: "Şirkətin tarixi",
        nav_news: "Xəbərlər və media",
        nav_products: "Məhsullar",
        nav_worldwide: "Filiallarımız",
        news_3_text: "Profilaktika, əlçatan məlumat və mütəxəssislərlə açıq ünsiyyət gündəlik sağlamlığın əsasını təşkil edir.",
        news_section_lead: "STADA xəbərləri, media materialları və məhsul yenilikləri bir bölmədə.",
        product_back: "Məhsullara qayıt",
        product_related_heading: "Oxşar məhsullar",
        product_related_intro: "Həcm, format və istifadə sahəsinə görə uyğun variantı seçin.",
        product_related_label: "Oxşar məhsullar",
        products_browse_catalog: "Kataloqa baxın",
        products_catalog_label: "STADA kataloqu",
        products_category_allergy: "Allergiya",
        products_category_cardio: "Kardio",
        products_category_cold: "Soyuqdəymə və tənəffüs",
        products_category_digestive: "Həzm",
        products_category_immunity: "İmmunitet",
        products_category_kids: "Uşaqlar üçün",
        products_category_respiratory: "Tənəffüs yolları",
        products_category_urology: "Urologiya",
        products_filter_all: "Bütün məhsullar",
        products_heading: "Məhsullarımız",
        products_metric_areas: "terapevtik istiqamət",
        products_metric_portfolio: "kataloqda məhsul",
        products_partners_heading: "Apteklərdə və onlayn servislərdə mövcuddur",
        site_name: "STADA Azerbaijan",
        where_to_buy_heading: "Haradan almaq olar",
        worldwide_country_label: "Ölkələrə baxış",
        worldwide_country_search: "Ölkə axtarın",
        worldwide_eyebrow: "STADA-nın qlobal iştirakı",
        worldwide_globe_fallback_title: "Qlobal xəritə",
        worldwide_globe_topline: "COBE WebGL qlobusu",
        worldwide_heading: "Filiallarımız",
        worldwide_page_title: "STADA - Filiallarımız",
        worldwide_subtitle: "Qlobal iştirak. Yerli təcrübə.",
      },
    },
    domText: {
      ru: {
        worldwide_text_001: "Azerbaijan",
      },
      az: {
        worldwide_text_001: "Azərbaycan",
      },
    },
  },
};

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

function loadContentSource(config) {
  const sourcePath = resolveBackendPath(config.contentSourcePath || "data/content-source.json");
  if (!fs.existsSync(sourcePath)) {
    return {
      version: 1,
      pages: {},
    };
  }

  const source = readJson(sourcePath);
  return {
    version: source.version || 1,
    pages: source.pages && typeof source.pages === "object" ? source.pages : {},
  };
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

function validateNormalizedPagePath(pagePath) {
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
}

function resolveHtmlPath(homepageConfig, pageInput) {
  const homepagePath = resolveBackendPath(homepageConfig.htmlPath);
  const siteRoot = path.dirname(homepagePath);
  const pagePath = normalizePagePath(pageInput);
  validateNormalizedPagePath(pagePath);

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
  if (countriesDataPath.toLowerCase().endsWith(".json")) {
    const parsed = JSON.parse(source);
    return Array.isArray(parsed) ? parsed : parsed.countries || [];
  }
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
      id: attrs["data-backend-image-id"] || "",
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

function languageFallbackOrder(language, fallbackLanguage) {
  const requested = String(language || "").trim().toLowerCase();
  const regionalFallbacks = requested === "ge" ? ["en"] : requested === "en" ? ["ge"] : [];
  if (requested === "kg") return unique([requested, fallbackLanguage, "ru", "en"]);
  if (requested === "az") return unique([requested, fallbackLanguage, "ru", "en"]);
  if (requested === "ge" || requested === "en") return unique([requested, ...regionalFallbacks, fallbackLanguage, "ru", "kz", "kg", "en"]);
  return unique([requested, ...regionalFallbacks, fallbackLanguage, "ru", "kz", "en"]);
}

function applyReplacementRules(value, rules = []) {
  return rules.reduce((text, [from, to]) => {
    return text.split(from).join(to);
  }, String(value ?? ""));
}

function countryContentProfile(countryId) {
  return countryContentProfiles[String(countryId || "").trim().toLowerCase()] || null;
}

function countryProfileLanguageBlock(profile, blockName, language) {
  const block = profile?.[blockName] || {};
  return {
    ...(block.default || {}),
    ...(block[language] || {}),
  };
}

function applyCountrySpecificContent(payload, countryConfig) {
  const profile = countryContentProfile(countryConfig.id);
  if (!profile || !payload?.content) return payload;

  const language = String(payload.language || countryConfig.defaultLanguage || "").trim().toLowerCase();
  const replacements = profile.replacements?.[language] || profile.replacements?.default || [];
  const textOverrides = countryProfileLanguageBlock(profile, "text", language);
  const domTextOverrides = countryProfileLanguageBlock(profile, "domText", language);
  const pageTitle = profile.pageTitles?.[language]?.[payload.page?.path];

  const resolveProfileText = (key, value) => {
    if (Object.prototype.hasOwnProperty.call(textOverrides, key)) {
      return textOverrides[key];
    }
    return applyReplacementRules(value, replacements);
  };

  payload.content.pageTitle = pageTitle || applyReplacementRules(payload.content.pageTitle || "", replacements);

  for (const [key, value] of Object.entries(payload.content.text || {})) {
    payload.content.text[key] = resolveProfileText(key, value);
  }

  for (const section of payload.content.sections || []) {
    for (const item of section.translatedTexts || []) {
      if (!item?.key) continue;
      item.value = resolveProfileText(item.key, item.value);
    }
  }

  for (const product of payload.content.productCatalog || []) {
    if (product.nameKey && payload.content.text?.[product.nameKey]) {
      product.name = payload.content.text[product.nameKey];
    } else {
      product.name = applyReplacementRules(product.name || "", replacements);
    }

    if (product.descriptionKey && payload.content.text?.[product.descriptionKey]) {
      product.shortDescription = payload.content.text[product.descriptionKey];
    } else {
      product.shortDescription = applyReplacementRules(product.shortDescription || "", replacements);
    }

    if (product.categoryKey && payload.content.text?.[product.categoryKey]) {
      product.therapeuticArea = payload.content.text[product.categoryKey];
    } else {
      product.therapeuticArea = applyReplacementRules(product.therapeuticArea || "", replacements);
    }
  }

  payload.content.dom.text = (payload.content.dom.text || []).map(item => {
    const id = String(item.id || "");
    const value = Object.prototype.hasOwnProperty.call(domTextOverrides, id)
      ? domTextOverrides[id]
      : applyReplacementRules(item.value || "", replacements);
    return {
      ...item,
      value,
    };
  });

  return payload;
}

function resolveTranslation(translations, productFallbackTools, language, fallbackLanguage, key) {
  const languageOrder = languageFallbackOrder(language, fallbackLanguage);
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

function chooseContentSourceLanguage(countryConfig, pageText, languageInput) {
  const supportedLanguages = countryConfig.supportedLanguages?.length
    ? countryConfig.supportedLanguages
    : Object.keys(pageText || {});
  const requestedLanguage = String(languageInput || countryConfig.defaultLanguage || "").trim().toLowerCase();

  if (requestedLanguage && supportedLanguages.includes(requestedLanguage)) return requestedLanguage;
  if (countryConfig.defaultLanguage && supportedLanguages.includes(countryConfig.defaultLanguage)) {
    return countryConfig.defaultLanguage;
  }
  return supportedLanguages[0] || "ru";
}

function resolveContentSourceText(pageSource, language, fallbackLanguage, key) {
  const languageOrder = languageFallbackOrder(language, fallbackLanguage);
  for (const candidateLanguage of languageOrder) {
    const value = pageSource.text?.[candidateLanguage]?.[key];
    if (value !== null && value !== undefined && value !== "") {
      return {
        key,
        value,
        language: candidateLanguage,
        source: "contentSource",
      };
    }
  }

  return {
    key,
    value: null,
    language: null,
    source: "contentSource",
  };
}

function resolveContentSourceDomText(pageSource, language, fallbackLanguage, item) {
  const id = String(item?.id || "");
  for (const candidateLanguage of languageFallbackOrder(language, fallbackLanguage)) {
    const value = pageSource.domTextTranslations?.[candidateLanguage]?.[id];
    if (value !== null && value !== undefined && value !== "") {
      return String(value);
    }
  }
  return String(item?.value || "");
}

function normalizeContentSourceImage(image, sectionId, assetsBaseUrl) {
  const src = String(image?.src || "");
  return {
    id: String(image?.id || ""),
    section: sectionId || "",
    src,
    url: makeAssetUrl(src, assetsBaseUrl),
    alt: String(image?.alt || ""),
    loading: String(image?.loading || ""),
    srcset: String(image?.srcset || ""),
    sizes: String(image?.sizes || ""),
  };
}

function normalizeHomepageRelativePath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^(\.\/)+/, "")
    .replace(/^(\.\.\/)+/, "");
}

function normalizeProductIdFromHref(href) {
  return normalizeHomepageRelativePath(href)
    .replace(/^products\//, "")
    .replace(/\.html(?:[?#].*)?$/i, "")
    .replace(/\/index$/i, "")
    .trim();
}

function stripHtml(value) {
  return normalizeText(String(value || "").replace(/<[^>]*>/g, " "));
}

function getClassList(attributes) {
  return String(attributes.class || "").split(/\s+/).filter(Boolean);
}

function findElementByClass(html, tagName, className) {
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const attributes = parseAttributes(match[1]);
    if (getClassList(attributes).includes(className)) {
      return {
        attributes,
        html: match[0],
        innerHtml: match[2],
        text: stripHtml(match[2]),
      };
    }
  }
  return null;
}

function findImage(html) {
  const match = html.match(/<img\b([^>]*)>/i);
  return match ? parseAttributes(match[1]) : {};
}

function resolveCatalogText({ key, text }, translations, productFallbackTools, language, fallbackLanguage) {
  if (key) {
    const translated = resolveTranslation(translations, productFallbackTools, language, fallbackLanguage, key);
    if (translated.value) return translated.value;
  }
  return text || "";
}

function extractCardAccent(style) {
  const match = String(style || "").match(/--card-accent\s*:\s*([^;]+)/i);
  return match ? match[1].trim() : "";
}

function categoryTokenToClass(category) {
  const firstCategory = String(category || "").split(/\s+/).filter(Boolean)[0] || "products";
  return firstCategory.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
}

function normalizeCatalogProductId(product, imageSrc) {
  const rawId = String(product?.id || "").trim();
  if (rawId && rawId !== "product") return rawId;

  const imageProductMatch = String(imageSrc || "")
    .replace(/\\/g, "/")
    .match(/(?:^|\/)products\/([^/?#]+)/i);
  const keyProductMatch = String(product?.nameKey || product?.descriptionKey || "")
    .match(/^product_(.+?)_(?:name|page_desc|page_title)$/i);
  const inferred = imageProductMatch?.[1] || keyProductMatch?.[1]?.replace(/_/g, "-") || rawId;

  return normalizeSlug(inferred)
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCatalogProductHref(product, productId) {
  const href = String(product?.href || "").trim();
  if (!productId) return href;
  if (!href
    || /(?:^|\/)product\.html(?:$|[?#])/i.test(href)
    || /^products\/(?!index\.html|product\.html)[^/]+\.html(?:$|[?#])/i.test(href)) {
    return `products/product.html?slug=${encodeURIComponent(productId)}`;
  }
  return href;
}

function normalizeCatalogProduct(product, assetsBaseUrl) {
  const image = product.image || {};
  const imageSrc = normalizeHomepageRelativePath(image.src || image.url || "");
  const id = normalizeCatalogProductId(product, imageSrc);

  return {
    id,
    href: normalizeCatalogProductHref(product, id),
    className: String(product.className || ""),
    category: String(product.category || ""),
    categoryClass: String(product.categoryClass || categoryTokenToClass(product.category)),
    accent: String(product.accent || ""),
    image: {
      id: String(image.id || ""),
      src: imageSrc,
      url: makeAssetUrl(imageSrc, assetsBaseUrl),
      alt: String(image.alt || ""),
    },
    nameKey: String(product.nameKey || ""),
    name: String(product.name || ""),
    descriptionKey: String(product.descriptionKey || ""),
    shortDescription: String(product.shortDescription || ""),
    categoryKey: String(product.categoryKey || ""),
    therapeuticArea: String(product.therapeuticArea || ""),
  };
}

function loadProductCatalog({ homepageConfig, language, fallbackLanguage, assetsBaseUrl }) {
  const catalogPath = resolveBackendPath(homepageConfig.productCatalogPath || "data/product-catalog.json");
  if (!fs.existsSync(catalogPath)) return [];

  const source = readJson(catalogPath);
  const catalogs = source.products && typeof source.products === "object" ? source.products : {};
  const catalog = languageFallbackOrder(language, fallbackLanguage)
    .map(candidateLanguage => catalogs[candidateLanguage])
    .find(candidateCatalog => Array.isArray(candidateCatalog)) || [];
  return Array.isArray(catalog)
    ? catalog.map(product => normalizeCatalogProduct(product, assetsBaseUrl)).filter(product => product.id)
    : [];
}

function normalizeProductIds(value) {
  const ids = Array.isArray(value) ? value : String(value || "").split(",");
  return unique(ids.map(item => String(item || "").trim()).filter(Boolean));
}

function syncHomeProducts(payload) {
  const catalog = payload.content?.productCatalog || [];
  const catalogById = new Map(catalog.map(product => [product.id, product]));
  const requestedIds = normalizeProductIds(payload.content?.settings?.homeProducts);
  const fallbackIds = normalizeProductIds([
    ...defaultHomeProductIds,
    ...catalog.map(product => product.id),
  ]);
  const selectedIds = [
    ...requestedIds,
    ...fallbackIds.filter(id => catalogById.has(id) && !requestedIds.includes(id)),
  ].slice(0, 4);

  payload.content.settings ||= {};
  payload.content.settings.homeProducts = selectedIds;
  payload.content.homeProducts = selectedIds.map(id => catalogById.get(id)).filter(Boolean);
}

function attachProductCatalog(payload, countryConfig, homepageConfig) {
  if (!["kazakhstan", "georgia", "azerbaijan"].includes(countryConfig.id)) {
    payload.content.productCatalog = [];
    syncHomeProducts(payload);
    return;
  }

  const fallbackLanguage = countryConfig.defaultLanguage || payload.language;
  payload.content.productCatalog = loadProductCatalog({
    homepageConfig,
    language: payload.language,
    fallbackLanguage,
    assetsBaseUrl: homepageConfig.assetsBaseUrl,
  });
  syncHomeProducts(payload);
}

function buildContentSourcePayload({
  countryConfig,
  pagePath,
  pageSource,
  languageInput,
  assetsBaseUrl,
  worldwideCountry,
}) {
  const language = chooseContentSourceLanguage(countryConfig, pageSource.text, languageInput);
  const fallbackLanguage = countryConfig.defaultLanguage || language;
  const imagesById = new Map(
    (pageSource.images || []).map(image => [image.id, image])
  );
  const sections = (pageSource.sections || []).map(section => {
    const translatedTexts = (section.translatedTextKeys || [])
      .map(key => resolveContentSourceText(pageSource, language, fallbackLanguage, key));
    const photos = (section.imageIds || [])
      .map(id => imagesById.get(id))
      .filter(Boolean)
      .map(image => normalizeContentSourceImage(image, section.id, assetsBaseUrl));

    return {
      id: section.id,
      label: section.label || section.id,
      translatedTexts,
      staticTexts: [],
      photos,
    };
  });
  const allKeys = unique([
    ...sections.flatMap(section => section.translatedTexts.map(item => item.key)),
    ...languageFallbackOrder(language, fallbackLanguage).flatMap(candidateLanguage => Object.keys(pageSource.text?.[candidateLanguage] || {})),
  ]);
  const text = Object.fromEntries(
    allKeys.map(key => {
      const translated = resolveContentSourceText(pageSource, language, fallbackLanguage, key);
      return [key, translated.value];
    })
  );

  return {
    country: {
      id: countryConfig.id,
      name: countryConfig.name,
      siteName: countryConfig.siteName,
      domain: countryConfig.domain,
      siteUrl: countryConfig.siteUrl,
      defaultLanguage: countryConfig.defaultLanguage,
      supportedLanguages: countryConfig.supportedLanguages || [],
      worldwide: worldwideCountry || null,
    },
    language,
    requestedLanguage: languageInput || null,
    page: {
      path: pagePath,
    },
    content: {
      pageTitle: languageFallbackOrder(language, fallbackLanguage)
        .map(candidateLanguage => pageSource.title?.[candidateLanguage])
        .find(Boolean) || "",
      text,
      missingTranslationKeys: allKeys.filter(key => text[key] === null),
      staticTexts: [],
      photos: uniqueImages(sections.flatMap(section => section.photos)),
      dom: {
        text: (pageSource.domText || []).map(item => ({
          id: String(item.id || ""),
          tag: String(item.tag || "span").toLowerCase(),
          value: resolveContentSourceDomText(pageSource, language, fallbackLanguage, item),
        })),
        images: (pageSource.images || []).map(image => normalizeContentSourceImage(image, "", assetsBaseUrl)),
      },
      settings: {
        ...(pageSource.settings && typeof pageSource.settings === "object" ? pageSource.settings : {}),
        homeProducts: normalizeProductIds(pageSource.settings?.homeProducts || defaultHomeProductIds),
      },
      purchaseLinks: Array.isArray(pageSource.purchaseLinks) ? pageSource.purchaseLinks : [],
      sections,
    },
  };
}

function applyContentOverrides(payload, countryId, language, pagePath, assetsBaseUrl) {
  const overrides = getPageOverrides(countryId, language, pagePath);
  const textOverrides = overrides.text || {};
  const domTextOverrides = overrides.domText || {};
  const domImageOverrides = overrides.domImages || {};
  const settingsOverrides = overrides.settings || {};

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

  payload.content.dom.images = (payload.content.dom.images || []).map(image => {
    const override = domImageOverrides[image.id];
    if (!override || typeof override !== "object" || Array.isArray(override)) {
      return image;
    }

    const src = typeof override.src === "string" ? override.src : image.src;
    return {
      ...image,
      src,
      url: makeAssetUrl(src, assetsBaseUrl),
      alt: typeof override.alt === "string" ? override.alt : image.alt,
      loading: typeof override.loading === "string" ? override.loading : image.loading,
      srcset: typeof override.srcset === "string" ? override.srcset : image.srcset,
      sizes: typeof override.sizes === "string" ? override.sizes : image.sizes,
      source: "override",
    };
  });

  const overriddenTitle = payload.content.dom.text.find(item => {
    return item.tag === "title" && Object.prototype.hasOwnProperty.call(domTextOverrides, item.id);
  });
  if (overriddenTitle) {
    payload.content.pageTitle = overriddenTitle.value;
  }

  payload.content.settings = {
    ...(payload.content.settings || {}),
    ...settingsOverrides,
  };
  syncHomeProducts(payload);

  payload.content.overrides = {
    updatedAt: overrides.updatedAt,
    textKeys: Object.keys(textOverrides),
    domTextIds: Object.keys(domTextOverrides),
    domImageIds: Object.keys(domImageOverrides),
    settingKeys: Object.keys(settingsOverrides),
  };
}

function getPagePayload(options = {}) {
  const config = loadConfig();
  const countryConfig = findCountryConfig(config, options.country);
  const homepageConfig = countryConfig.homepage || {};
  const requestedPagePath = normalizePagePath(options.page || options.pagePath || options.path);
  validateNormalizedPagePath(requestedPagePath);
  const contentSource = loadContentSource(config);
  const pageSource = contentSource.pages[requestedPagePath];
  const countriesDataPath = resolveBackendPath(homepageConfig.worldwideCountriesPath || homepageConfig.countriesDataPath);
  const worldwideCountries = loadWorldwideCountries(countriesDataPath);
  const worldwideCountry = findWorldwideCountry(countryConfig, worldwideCountries);

  if (pageSource) {
    const payload = buildContentSourcePayload({
      countryConfig,
      pagePath: requestedPagePath,
      pageSource,
      languageInput: options.lang || options.language,
      assetsBaseUrl: homepageConfig.assetsBaseUrl,
      worldwideCountry,
    });
    attachProductCatalog(payload, countryConfig, homepageConfig);
    applyCountrySpecificContent(payload, countryConfig);

    if (options.applyOverrides !== false) {
      applyContentOverrides(
        payload,
        countryConfig.id,
        payload.language,
        requestedPagePath,
        homepageConfig.assetsBaseUrl
      );
    }

    return payload;
  }

  if (!homepageConfig.htmlPath) {
    throw Object.assign(new Error(`Page "${requestedPagePath}" was not found.`), {
      statusCode: 404,
      code: "PAGE_NOT_FOUND",
      page: requestedPagePath,
    });
  }

  const { htmlPath, pagePath } = resolveHtmlPath(homepageConfig, requestedPagePath);
  const translationScriptPath = resolveBackendPath(homepageConfig.translationScriptPath);

  const html = fs.readFileSync(htmlPath, "utf8");
  const translations = loadTranslations(translationScriptPath);
  const productFallbackTools = loadProductFallbackTools(translationScriptPath);
  const language = chooseLanguage(countryConfig, translations, options.lang || options.language);
  const fallbackLanguage = countryConfig.defaultLanguage || language;
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

  applyCountrySpecificContent(payload, countryConfig);

  if (options.applyOverrides !== false) {
    applyContentOverrides(payload, countryConfig.id, language, pagePath, homepageConfig.assetsBaseUrl);
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
