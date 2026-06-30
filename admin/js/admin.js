const DEFAULT_API_BASE = "https://stada-content-backend.onrender.com";
const API_BASE_STORAGE_KEY = "stada-admin-api-base";
const MAIN_PAGE_PATH = "index.html";
const MAIN_PAGE_LABEL = "Main page";
const ADMIN_SECTION_IDS = new Set(["hero", "about", "news", "career", "products"]);
const HIDDEN_ADMIN_ITEM_IDS = new Set([
  "about_heading",
  "site_name",
  "career_heading",
  "career_button",
  "hero_products_heading",
  "index_image_014",
  "index_image_015",
]);
const HERO_IMAGE_IDS = new Set(["index_image_002", "index_image_003", "index_image_004"]);
const ABOUT_IMAGE_IDS = new Set(["index_image_005"]);
const NEWS_IMAGE_IDS = new Set([
  "index_image_006",
  "index_image_007",
  "index_image_008",
  "index_image_009",
  "index_image_010",
  "index_image_011",
  "index_image_012",
  "index_image_013",
]);
const PRODUCT_IMAGE_IDS = new Set(["index_image_016"]);
const HERO_FIELD_ORDER = new Map([
  ["hero_title1", { slide: 1, role: "title", order: 1 }],
  ["hero_sub1", { slide: 1, role: "sub", order: 2 }],
  ["index_image_002", { slide: 1, role: "img", order: 3 }],
  ["hero_title2", { slide: 2, role: "title", order: 4 }],
  ["hero_sub2", { slide: 2, role: "sub", order: 5 }],
  ["index_image_003", { slide: 2, role: "img", order: 6 }],
  ["hero_title3", { slide: 3, role: "title", order: 7 }],
  ["hero_sub3", { slide: 3, role: "sub", order: 8 }],
  ["index_image_004", { slide: 3, role: "img", order: 9 }],
]);
const ABOUT_FIELD_ORDER = new Map([
  ["about_par1", { label: "About paragraph 1", order: 1 }],
  ["about_par2", { label: "About paragraph 2", order: 2 }],
  ["about_list1", { label: "About value 1", order: 3 }],
  ["about_list2", { label: "About value 2", order: 4 }],
  ["about_list3", { label: "About value 3", order: 5 }],
  ["hero_caption_logo", { label: "Image caption", order: 6 }],
  ["stats_sales", { label: "Stat text 1", order: 7 }],
  ["stats_employees", { label: "Stat text 2", order: 8 }],
  ["stats_countries", { label: "Stat text 3", order: 9 }],
  ["index_image_005", { label: "About image", order: 10 }],
]);
const NEWS_FIELD_ORDER = new Map([
  ["index_text_013", { label: "Card 1 date", order: 1 }],
  ["hero_text1", { label: "Card 1 title", order: 2 }],
  ["news_1_text", { label: "Card 1 text", order: 3 }],
  ["index_image_006", { label: "Card 1 image", order: 4 }],
  ["index_text_014", { label: "Card 2 date", order: 5 }],
  ["hero_text2", { label: "Card 2 title", order: 6 }],
  ["news_2_text", { label: "Card 2 text", order: 7 }],
  ["index_image_007", { label: "Card 2 image", order: 8 }],
  ["index_text_015", { label: "Card 3 date", order: 9 }],
  ["hero_text3", { label: "Card 3 title", order: 10 }],
  ["news_3_text", { label: "Card 3 text", order: 11 }],
  ["index_image_008", { label: "Card 3 image", order: 12 }],
  ["index_text_016", { label: "Card 4 date", order: 13 }],
  ["news_4_title", { label: "Card 4 title", order: 14 }],
  ["news_4_text", { label: "Card 4 text", order: 15 }],
  ["index_image_009", { label: "Card 4 image", order: 16 }],
  ["index_text_017", { label: "Card 5 date", order: 17 }],
  ["news_5_title", { label: "Card 5 title", order: 18 }],
  ["news_5_text", { label: "Card 5 text", order: 19 }],
  ["index_image_010", { label: "Card 5 image", order: 20 }],
  ["index_text_018", { label: "Card 6 date", order: 21 }],
  ["news_6_title", { label: "Card 6 title", order: 22 }],
  ["news_6_text", { label: "Card 6 text", order: 23 }],
  ["index_image_011", { label: "Card 6 image", order: 24 }],
  ["index_text_019", { label: "Card 7 date", order: 25 }],
  ["news_7_title", { label: "Card 7 title", order: 26 }],
  ["news_7_text", { label: "Card 7 text", order: 27 }],
  ["index_image_012", { label: "Card 7 image", order: 28 }],
  ["index_text_020", { label: "Card 8 date", order: 29 }],
  ["news_8_title", { label: "Card 8 title", order: 30 }],
  ["news_8_text", { label: "Card 8 text", order: 31 }],
  ["index_image_013", { label: "Card 8 image", order: 32 }],
]);
const CAREER_FIELD_ORDER = new Map([
  ["career_par1", { label: "Intro paragraph", order: 1 }],
  ["index_text_021", { label: "Fact 1 number", order: 2 }],
  ["career_fact1", { label: "Fact 1 text", order: 3 }],
  ["index_text_022", { label: "Fact 2 number", order: 4 }],
  ["career_fact2", { label: "Fact 2 text", order: 5 }],
  ["index_text_023", { label: "Fact 3 number", order: 6 }],
  ["career_fact3", { label: "Fact 3 text", order: 7 }],
  ["index_text_024", { label: "Fact 4 number", order: 8 }],
  ["career_fact4", { label: "Fact 4 text", order: 9 }],
  ["index_text_025", { label: "Fact 5 number", order: 10 }],
  ["career_fact5", { label: "Fact 5 text", order: 11 }],
]);
const PRODUCTS_FIELD_ORDER = new Map([
  ["hero_products_description", { label: "Subtitle", order: 1 }],
  ["index_image_016", { label: "Main podium photo", order: 2 }],
  ["homeProducts", { label: "Featured products", order: 3 }],
]);
const IMAGE_FIELDS = ["src", "alt", "loading", "srcset", "sizes"];
const UPLOAD_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const FORMULA_IMAGE_UPLOAD_FIELDS = {
  formulaCenter: {
    src: "formulaCenterSrc",
    cloudinaryPublicId: "formulaCenterCloudinaryPublicId",
    label: "formula center",
  },
  formulaPointActive: {
    src: "formulaPointActiveSrc",
    cloudinaryPublicId: "formulaPointActiveCloudinaryPublicId",
    label: "formula point 1",
  },
  formulaPointSeawater: {
    src: "formulaPointSeawaterSrc",
    cloudinaryPublicId: "formulaPointSeawaterCloudinaryPublicId",
    label: "formula point 2",
  },
  formulaPointFormat: {
    src: "formulaPointFormatSrc",
    cloudinaryPublicId: "formulaPointFormatCloudinaryPublicId",
    label: "formula point 3",
  },
};

const state = {
  apiBase: getInitialApiBase(),
  token: sessionStorage.getItem("stada-admin-token") || "",
  countries: [],
  items: [],
  sections: [],
  sectionGroups: new Map(),
  country: "",
  language: "",
  page: MAIN_PAGE_PATH,
  filter: "all",
  busy: false,
  dirty: false,
  productCatalog: [],
  products: [],
  therapeuticAreas: [],
  selectedProductId: "",
  selectedProductPageId: "",
  productEditorMode: "catalog",
  productSearch: "",
  productsLoaded: false,
  settings: {},
  originalSettings: {},
  adminPage: "main",
};

const els = {
  loginPanel: document.querySelector("[data-login-panel]"),
  editorPanel: document.querySelector("[data-editor-panel]"),
  loginForm: document.querySelector("[data-login-form]"),
  loginMessage: document.querySelector("[data-login-message]"),
  logout: document.querySelector("[data-logout]"),
  countrySelect: document.querySelector("[data-country-select]"),
  languageSelect: document.querySelector("[data-language-select]"),
  searchInput: document.querySelector("[data-search-input]"),
  status: document.querySelector("[data-status]"),
  save: document.querySelector("[data-save]"),
  reset: document.querySelector("[data-reset]"),
  editorList: document.querySelector("[data-editor-list]"),
  fieldTemplate: document.querySelector("[data-field-template]"),
  sectionTemplate: document.querySelector("[data-section-template]"),
  apiLabel: document.querySelector("[data-api-label]"),
  filterRow: document.querySelector("[data-filter-row]"),
  totalCount: document.querySelector("[data-total-count]"),
  visibleCount: document.querySelector("[data-visible-count]"),
  changedCount: document.querySelector("[data-changed-count]"),
  pageTitle: document.querySelector("[data-page-title]"),
  adminPageTitle: document.querySelector("[data-admin-page-title]"),
  adminPageIntro: document.querySelector("[data-admin-page-intro]"),
  pageNavItems: Array.from(document.querySelectorAll("[data-admin-page]")),
  pageViews: Array.from(document.querySelectorAll("[data-admin-page-view]")),
  productStatus: document.querySelector("[data-product-status]"),
  productManager: document.querySelector(".product-manager"),
  productManagerTitle: document.querySelector("[data-product-manager-title]"),
  productImport: document.querySelector("[data-product-import]"),
  productSyncImages: Array.from(document.querySelectorAll("[data-product-sync-images]")),
  productRefresh: document.querySelector("[data-product-refresh]"),
  productNew: document.querySelector("[data-product-new]"),
  productSearch: document.querySelector("[data-product-search]"),
  productList: document.querySelector("[data-product-list]"),
  productForm: document.querySelector("[data-product-form]"),
  productDelete: document.querySelector("[data-product-delete]"),
  productIdInput: document.querySelector("[data-product-id-input]"),
  productCount: document.querySelector("[data-product-count]"),
  productEditorTitle: document.querySelector("[data-product-editor-title]"),
  productEditorStatus: document.querySelector("[data-product-editor-status]"),
  therapeuticAreaSelect: document.querySelector("[data-therapeutic-area-select]"),
  productImagePreview: document.querySelector("[data-product-image-preview]"),
  productImageFile: document.querySelector("[data-product-image-file]"),
  productImageChange: document.querySelector("[data-product-image-change]"),
  productImageStatus: document.querySelector("[data-product-image-status]"),
  productDetailImageFile: document.querySelector("[data-product-detail-image-file]"),
  productDetailImageChange: document.querySelector("[data-product-detail-image-change]"),
  productDetailImageStatus: document.querySelector("[data-product-detail-image-status]"),
  productPageList: document.querySelector("[data-product-page-list]"),
};

const ADMIN_PAGE_META = {
  main: {
    title: "Main page",
    intro: "Edit dynamic homepage content used by the main frontend.",
  },
  culture: {
    title: "Culture page",
    intro: "This admin page is blank for now.",
  },
  history: {
    title: "History page",
    intro: "This admin page is blank for now.",
  },
  worldwide: {
    title: "Worldwide page",
    intro: "This admin page is blank for now.",
  },
  product: {
    title: "Product page",
    intro: "Add, edit, and remove PostgreSQL-backed catalog products.",
  },
  productDetail: {
    title: "Product detail page",
    intro: "Edit the selected product page content.",
  },
};

function getInitialApiBase() {
  const params = new URLSearchParams(window.location.search);
  const requestedApiBase = params.get("api") || params.get("apiBase");

  if (requestedApiBase) {
    if (requestedApiBase === "default") {
      localStorage.removeItem(API_BASE_STORAGE_KEY);
      return DEFAULT_API_BASE;
    }

    const normalizedApiBase = normalizeAllowedApiBase(requestedApiBase);
    if (!normalizedApiBase) {
      localStorage.removeItem(API_BASE_STORAGE_KEY);
      return DEFAULT_API_BASE;
    }

    localStorage.setItem(API_BASE_STORAGE_KEY, normalizedApiBase);
    return normalizedApiBase;
  }

  return normalizeAllowedApiBase(localStorage.getItem(API_BASE_STORAGE_KEY)) || DEFAULT_API_BASE;
}

function normalizeAllowedApiBase(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const url = new URL(raw, window.location.origin);
    if (!["http:", "https:"].includes(url.protocol)) return "";

    const defaultOrigin = new URL(DEFAULT_API_BASE).origin;
    const devHosts = new Set(["localhost", "127.0.0.1", "::1"]);
    if (url.origin === window.location.origin || url.origin === defaultOrigin || devHosts.has(url.hostname)) {
      return url.origin;
    }
  } catch (error) {
    return "";
  }

  return "";
}

function getPageLabel(path = state.page) {
  return path === MAIN_PAGE_PATH ? MAIN_PAGE_LABEL : path;
}

function updateApiLabel() {
  els.apiLabel.textContent = `API: ${state.apiBase}`;
}

function setStatus(message, tone = "default") {
  els.status.textContent = message;
  els.status.dataset.tone = tone;
}

function setProductStatus(message, tone = "default") {
  if (!els.productStatus) return;
  els.productStatus.textContent = message;
  els.productStatus.dataset.tone = tone;
}

function getFilterButtons() {
  return Array.from(els.filterRow.querySelectorAll("[data-filter]"));
}

function setBusy(isBusy) {
  state.busy = isBusy;
  [
    els.save,
    els.reset,
    els.countrySelect,
    els.languageSelect,
    els.searchInput,
    els.productImport,
    els.productRefresh,
    els.productNew,
    els.productSearch,
    els.productDelete,
    ...els.productSyncImages,
    ...Array.from(els.productForm?.querySelectorAll("input, select, textarea, button") || []),
    ...getFilterButtons(),
  ].forEach(element => {
    if (element) element.disabled = isBusy;
  });

  if (!isBusy) {
    syncProductFormMode();
  }
}

function showLogin(message = "") {
  state.token = "";
  sessionStorage.removeItem("stada-admin-token");
  els.loginMessage.textContent = message;
  els.loginPanel.classList.remove("is-hidden");
  els.editorPanel.classList.add("is-hidden");
}

function showEditor() {
  els.loginPanel.classList.add("is-hidden");
  els.editorPanel.classList.remove("is-hidden");
  setAdminPage(state.adminPage);
}

function productViewIsVisibleForPage(viewPage, activePage) {
  return viewPage === activePage || (activePage === "productDetail" && viewPage === "product");
}

function setAdminPage(pageId) {
  const nextPage = ADMIN_PAGE_META[pageId] ? pageId : "main";
  const meta = ADMIN_PAGE_META[nextPage];

  state.adminPage = nextPage;
  state.productEditorMode = nextPage === "productDetail" ? "detail" : "catalog";
  if (nextPage !== "productDetail") {
    state.selectedProductPageId = "";
  }
  els.editorPanel.dataset.adminCurrentPage = nextPage;
  els.adminPageTitle.textContent = meta.title;
  els.adminPageIntro.textContent = meta.intro;

  els.pageNavItems.forEach(button => {
    const isActive = button.dataset.adminPage === nextPage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  els.pageViews.forEach(view => {
    view.classList.toggle("is-hidden", !productViewIsVisibleForPage(view.dataset.adminPageView, nextPage));
  });

  syncProductEditorMode();
  renderProductPageNav();

  if (nextPage === "product" && state.token && !state.productsLoaded) {
    loadProducts();
  }
}

async function setProductDetailPage(productId) {
  state.adminPage = "productDetail";
  state.productEditorMode = "detail";
  state.selectedProductPageId = productId;
  let product = state.products.find(candidate => candidate.id === productId);
  const label = product ? getProductName(product) : "Product detail page";

  els.editorPanel.dataset.adminCurrentPage = "productDetail";
  els.adminPageTitle.textContent = label;
  els.adminPageIntro.textContent = product?.pagePath
    ? `Edit ${product.pagePath}.`
    : "Edit the selected product detail page.";

  els.pageNavItems.forEach(button => {
    button.classList.remove("is-active");
    button.setAttribute("aria-current", "false");
  });
  els.pageViews.forEach(view => {
    view.classList.toggle("is-hidden", !productViewIsVisibleForPage(view.dataset.adminPageView, "productDetail"));
  });

  if (!state.productsLoaded && state.token) {
    await loadProducts(productId);
    product = state.products.find(candidate => candidate.id === productId);
  }

  if (state.token) {
    product = await loadProductDetail(productId) || product;
  }

  if (product) {
    selectProduct(product.id, { preservePageMode: true });
  } else {
    selectProduct(productId, { preservePageMode: true });
  }

  syncProductEditorMode();
  renderProductPageNav();
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(payload?.error?.message || payload?.message || `Request failed with ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  try {
    const response = await fetch(`${state.apiBase}${path}`, {
      ...options,
      headers,
    });
    return await parseResponse(response);
  } catch (error) {
    if (error.status === 401 && path !== "/api/admin/login") {
      showLogin("Session expired. Please sign in again.");
    }
    throw error;
  }
}

function countryById(countryId) {
  return state.countries.find(country => country.id === countryId) || state.countries[0];
}

function syncCountryOptions() {
  els.countrySelect.innerHTML = "";
  state.countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country.id;
    option.textContent = country.name || country.id;
    els.countrySelect.appendChild(option);
  });

  if (!state.country && state.countries[0]) {
    state.country = state.countries[0].id;
  }

  els.countrySelect.value = state.country;
}

function syncLanguageOptions() {
  const country = countryById(state.country);
  const languages = country?.supportedLanguages?.length ? country.supportedLanguages : ["ru"];

  els.languageSelect.innerHTML = "";
  languages.forEach(language => {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = language.toUpperCase();
    els.languageSelect.appendChild(option);
  });

  if (!languages.includes(state.language)) {
    state.language = country?.defaultLanguage && languages.includes(country.defaultLanguage)
      ? country.defaultLanguage
      : languages[0];
  }

  els.languageSelect.value = state.language;
}

function normalizeProductSelection(value) {
  const ids = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(ids.map(id => String(id || "").trim()).filter(Boolean))].slice(0, 4);
}

function sameStringArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function productById(id) {
  return state.productCatalog.find(product => product.id === id) || null;
}

function getProductLabel(id) {
  const product = productById(id);
  return product?.name || id;
}

function isItemChanged(item) {
  if (item.type === "productSelection") {
    return !sameStringArray(normalizeProductSelection(item.value), normalizeProductSelection(item.original));
  }
  if (item.type === "domImage") {
    return !IMAGE_FIELDS.every(field => {
      return String(item.value?.[field] ?? "") === String(item.original?.[field] ?? "");
    });
  }
  return (item.value || "") !== (item.original || "");
}

function getChangedCount() {
  return state.items.filter(isItemChanged).length;
}

function updateCounts(visibleCount = null) {
  els.totalCount.textContent = String(state.items.length);
  els.visibleCount.textContent = String(visibleCount ?? state.items.length);
  els.changedCount.textContent = String(getChangedCount());
  els.pageTitle.textContent = getPageLabel();
}

function normalizeSectionId(value) {
  return String(value || "content")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "content";
}

function normalizeItem(item) {
  const isHeroImage = item.type === "domImage" && HERO_IMAGE_IDS.has(item.id);
  const isAboutImage = item.type === "domImage" && ABOUT_IMAGE_IDS.has(item.id);
  const isNewsImage = item.type === "domImage" && NEWS_IMAGE_IDS.has(item.id);
  const isProductImage = item.type === "domImage" && PRODUCT_IMAGE_IDS.has(item.id);
  const heroMeta = HERO_FIELD_ORDER.get(item.id) || null;
  const aboutMeta = ABOUT_FIELD_ORDER.get(item.id) || null;
  const newsMeta = NEWS_FIELD_ORDER.get(item.id) || null;
  const careerMeta = CAREER_FIELD_ORDER.get(item.id) || null;
  const productsMeta = PRODUCTS_FIELD_ORDER.get(item.id) || null;
  const sectionId = isHeroImage
    ? "hero"
    : isAboutImage || aboutMeta
      ? "about"
      : isNewsImage || newsMeta
        ? "news"
        : careerMeta
          ? "career"
          : isProductImage || productsMeta
            ? "products"
            : normalizeSectionId(item.sectionId || item.sectionLabel);
  return {
    ...item,
    section: sectionId,
    sectionLabel: sectionId === "hero"
      ? "Hero"
      : sectionId === "about"
        ? "About STADA"
        : sectionId === "news"
          ? "News and Media"
          : sectionId === "career"
            ? "Career"
            : sectionId === "products"
              ? "Products"
              : item.sectionLabel || "Page content",
    label: isHeroImage && heroMeta ? `Hero Img${heroMeta.slide}` : aboutMeta?.label || newsMeta?.label || careerMeta?.label || productsMeta?.label || item.label,
    heroSlide: heroMeta?.slide || null,
    heroRole: heroMeta?.role || "",
    sortOrder: heroMeta?.order || aboutMeta?.order || newsMeta?.order || careerMeta?.order || productsMeta?.order || 100,
    value: item.type === "domImage"
      ? normalizeImageValue(item.value)
      : item.type === "productSelection"
        ? normalizeProductSelection(item.value)
        : item.value,
    original: item.type === "domImage"
      ? normalizeImageValue(item.original)
      : item.type === "productSelection"
        ? normalizeProductSelection(item.original)
        : item.original,
    card: null,
  };
}

function normalizeImageValue(value) {
  const normalized = {};
  IMAGE_FIELDS.forEach(field => {
    normalized[field] = String(value?.[field] ?? "");
  });
  return normalized;
}

function imageValueToText(value) {
  return value?.src || "";
}

function isAbsoluteImageSource(src) {
  return /^(?:https?:)?\/\//i.test(src) || /^data:/i.test(src);
}

function isStableCloudinaryImageUrl(src) {
  return /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?!v\d+\/)/i.test(String(src || ""));
}

function isCloudinaryImageUrl(src) {
  return /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//i.test(String(src || ""));
}

function withRuntimeImageRefresh(src) {
  if (!isStableCloudinaryImageUrl(src)) return src;
  try {
    const url = new URL(src);
    url.searchParams.set("fresh", String(Date.now()));
    return url.href;
  } catch (error) {
    const separator = String(src).includes("?") ? "&" : "?";
    return `${src}${separator}fresh=${Date.now()}`;
  }
}

function getLocalAssetPreviewSrc(src) {
  if (!src || isAbsoluteImageSource(src)) return src;
  return `/${String(src).replace(/\\/g, "/").replace(/^(\.\/|\.\.\/)+/, "").replace(/^\/+/, "")}`;
}

function resolveImagePreviewSrc(item) {
  const src = item.value?.src || "";
  if (!src || isAbsoluteImageSource(src)) return src;
  return item.previewUrl || getLocalAssetPreviewSrc(src);
}

function isManagedImageId(id) {
  return HERO_IMAGE_IDS.has(id)
    || ABOUT_IMAGE_IDS.has(id)
    || NEWS_IMAGE_IDS.has(id)
    || PRODUCT_IMAGE_IDS.has(id);
}

function updateImagePreview(preview, src, fallbackSrc = "") {
  if (!preview) return;
  preview.dataset.fallbackSrc = fallbackSrc || "";
  preview.onerror = () => {
    const fallback = preview.dataset.fallbackSrc;
    if (!fallback || preview.src === fallback) return;
    preview.dataset.fallbackSrc = "";
    preview.src = fallback;
  };
  preview.src = withRuntimeImageRefresh(src || "");
  preview.closest(".image-field__preview")?.classList.toggle("is-empty", !src);
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error || new Error("Could not read image file.")));
    reader.readAsDataURL(file);
  });
}

function imageFormatFromSrc(src) {
  const match = String(src || "").split("?")[0].match(/\.([a-z0-9]+)$/i);
  const format = match ? match[1].toLowerCase() : "";
  return ["png", "jpg", "jpeg", "webp"].includes(format) ? format : "";
}

async function uploadImageFile(file, dataUrl, imageId, currentSrc = "", extraPayload = {}) {
  const payload = await apiRequest("/api/admin/upload-image", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      dataUrl,
      imageId,
      country: state.country,
      page: state.page,
      preferredFormat: imageFormatFromSrc(currentSrc),
      ...extraPayload,
    }),
  });
  return payload.image;
}

async function loadPublicPagePayload() {
  if (!state.country || !state.language) return null;
  const params = new URLSearchParams({
    lang: state.language,
    page: MAIN_PAGE_PATH,
  });
  return apiRequest(`/api/page/${encodeURIComponent(state.country)}?${params}`);
}

function mergeManagedImageItems(editable, pagePayload) {
  const existingIds = new Set((editable.items || []).map(item => item.id));
  const publicImagesById = new Map(
    (pagePayload?.content?.dom?.images || [])
      .filter(image => isManagedImageId(image.id))
      .map(image => [image.id, image])
  );
  const existingItems = (editable.items || []).map(item => {
    if (item.type !== "domImage") return item;
    const publicImage = publicImagesById.get(item.id);
    if (!publicImage) return item;

    return {
      ...item,
      value: normalizeImageValue(publicImage),
      previewUrl: publicImage.url || publicImage.src || item.previewUrl || "",
      originalPreviewUrl: item.originalPreviewUrl || item.previewUrl || "",
    };
  });
  const managedImages = (pagePayload?.content?.dom?.images || [])
    .filter(image => isManagedImageId(image.id) && !existingIds.has(image.id))
    .map((image, index) => ({
      type: "domImage",
      id: image.id,
      label: ABOUT_FIELD_ORDER.get(image.id)?.label || NEWS_FIELD_ORDER.get(image.id)?.label || PRODUCTS_FIELD_ORDER.get(image.id)?.label || `Hero Img${index + 1}`,
      sectionId: ABOUT_IMAGE_IDS.has(image.id) ? "about" : NEWS_IMAGE_IDS.has(image.id) ? "news" : PRODUCT_IMAGE_IDS.has(image.id) ? "products" : "hero",
      sectionLabel: ABOUT_IMAGE_IDS.has(image.id) ? "About STADA" : NEWS_IMAGE_IDS.has(image.id) ? "News and Media" : PRODUCT_IMAGE_IDS.has(image.id) ? "Products" : "Hero",
      original: normalizeImageValue(image),
      value: normalizeImageValue(image),
      previewUrl: image.url || image.src || "",
      originalPreviewUrl: image.url || image.src || "",
      overridden: false,
    }));

  return {
    ...editable,
    sections: [
      ...(editable.sections || []),
      ...["hero", "about", "news", "products"]
        .filter(sectionId => managedImages.some(item => item.sectionId === sectionId))
        .filter(sectionId => !(editable.sections || []).some(section => normalizeSectionId(section.id) === sectionId))
        .map(sectionId => ({
          id: sectionId,
          label: sectionId === "hero"
            ? "Hero"
            : sectionId === "about"
              ? "About STADA"
              : sectionId === "products"
                ? "Products"
                : "News and Media",
        })),
    ].flat(),
    items: [...existingItems, ...managedImages],
  };
}

async function renderEditorWithHeroImages(editable) {
  let mergedEditable = editable;
  try {
    mergedEditable = mergeManagedImageItems(mergedEditable, await loadPublicPagePayload());
  } catch (error) {
    console.warn("Could not load public page image metadata.", error);
  }
  renderEditor(mergedEditable);
}

function fieldMatchesSearch(item, query) {
  if (!query) return true;
  const value = item.type === "domImage"
    ? IMAGE_FIELDS.map(field => item.value?.[field]).join(" ")
    : item.type === "productSelection"
      ? normalizeProductSelection(item.value).map(getProductLabel).join(" ")
      : item.value;
  const original = item.type === "domImage"
    ? IMAGE_FIELDS.map(field => item.original?.[field]).join(" ")
    : item.type === "productSelection"
      ? normalizeProductSelection(item.original).map(getProductLabel).join(" ")
      : item.original;
  const productCatalogText = item.type === "productSelection"
    ? state.productCatalog.map(product => `${product.name} ${product.therapeuticArea} ${product.id}`).join(" ")
    : "";
  const haystack = `${item.id} ${item.label} ${item.sectionLabel} ${value} ${original}`.toLowerCase();
  return `${haystack} ${productCatalogText}`.toLowerCase().includes(query);
}

function fieldMatchesFilter(item) {
  if (state.filter === "all") return true;
  if (state.filter === "changed") return isItemChanged(item);
  return item.section === state.filter;
}

function makeFilterButton(filter, label, isActive = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `filter-chip${isActive ? " is-active" : ""}`;
  button.dataset.filter = filter;
  button.textContent = label;
  button.addEventListener("click", () => {
    state.filter = filter;
    getFilterButtons().forEach(candidate => {
      candidate.classList.toggle("is-active", candidate === button);
    });
    applySearchFilter();
  });
  return button;
}

function renderFilterButtons() {
  els.filterRow.innerHTML = "";
  els.filterRow.appendChild(makeFilterButton("all", "All", state.filter === "all"));
  state.sections.forEach(section => {
    els.filterRow.appendChild(makeFilterButton(section.id, section.label, state.filter === section.id));
  });
  els.filterRow.appendChild(makeFilterButton("changed", "Changed", state.filter === "changed"));

  if (!getFilterButtons().some(button => button.classList.contains("is-active"))) {
    state.filter = "all";
    els.filterRow.querySelector('[data-filter="all"]')?.classList.add("is-active");
  }
}

function createSectionGroup(section) {
  const group = els.sectionTemplate.content.firstElementChild.cloneNode(true);
  const eyebrow = group.querySelector(".editor-section__header p");
  const heading = group.querySelector(".editor-section__header h2");
  const count = group.querySelector(".editor-section__header span");
  const fields = group.querySelector(".editor-section__fields");

  eyebrow.textContent = getPageLabel();
  heading.textContent = section.label;
  count.textContent = "0 fields";
  group.dataset.section = section.id;
  els.editorList.appendChild(group);

  return { element: group, fields, count };
}

function createProductSelectionItem(editable) {
  if (!state.productCatalog.length) return null;
  return normalizeItem({
    type: "productSelection",
    id: "homeProducts",
    label: "Featured products",
    sectionId: "products",
    sectionLabel: "Products",
    original: editable.originalSettings?.homeProducts || [],
    value: editable.settings?.homeProducts || [],
  });
}

function selectedProductText(ids) {
  return normalizeProductSelection(ids).map(getProductLabel).join(", ");
}

function updateProductPickerState(picker, item, badge, counter) {
  if (!picker) return;
  const selected = normalizeProductSelection(item.value);
  const selectedSet = new Set(selected);
  const isFull = selected.length >= 4;

  picker.querySelectorAll("input[type='checkbox']").forEach(input => {
    input.checked = selectedSet.has(input.value);
    input.disabled = isFull && !input.checked;
  });

  if (counter) {
    counter.textContent = `${selected.length}/4 selected`;
    counter.dataset.tone = selected.length === 4 ? "complete" : "warning";
  }

  badge.textContent = isItemChanged(item) ? "Changed" : "";
}

function renderProductSelectionField({ item, card, textarea, badge, original }) {
  card.classList.add("field-card--product-picker");
  textarea.classList.add("is-hidden");
  original.textContent = selectedProductText(item.original);

  const picker = document.createElement("div");
  picker.className = "product-picker";

  const pickerHeader = document.createElement("div");
  pickerHeader.className = "product-picker__header";

  const hint = document.createElement("p");
  hint.textContent = "Choose exactly 4 products for the homepage preview.";

  const counter = document.createElement("strong");
  pickerHeader.append(hint, counter);

  const options = document.createElement("div");
  options.className = "product-picker__options";

  state.productCatalog.forEach(product => {
    const option = document.createElement("label");
    option.className = "product-option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = product.id;

    const copy = document.createElement("span");
    copy.className = "product-option__copy";

    const name = document.createElement("strong");
    name.textContent = product.name || product.id;

    copy.append(name);
    option.append(input, copy);
    options.appendChild(option);

    input.addEventListener("change", event => {
      const selected = Array.from(options.querySelectorAll("input[type='checkbox']:checked")).map(candidate => candidate.value);
      if (selected.length > 4) {
        event.target.checked = false;
        setStatus("Choose only 4 products for the homepage.", "error");
        return;
      }

      item.value = selected;
      updateProductPickerState(picker, item, badge, counter);
      setDirty(true);
      applySearchFilter();
    });
  });

  picker.append(pickerHeader, options);
  textarea.insertAdjacentElement("afterend", picker);
  updateProductPickerState(picker, item, badge, counter);
}

function renderEditor(editable) {
  state.productCatalog = Array.isArray(editable.productCatalog) ? editable.productCatalog : [];
  state.settings = editable.settings || {};
  state.originalSettings = editable.originalSettings || {};

  const normalizedItems = (editable.items || [])
    .map(normalizeItem)
    .filter(item => ADMIN_SECTION_IDS.has(item.section) && !HIDDEN_ADMIN_ITEM_IDS.has(item.id))
    .sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label));
  const productSelectionItem = createProductSelectionItem(editable);
  state.items = productSelectionItem
    ? [...normalizedItems, productSelectionItem].sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label))
    : normalizedItems;
  state.sections = (editable.sections || [])
    .map(section => ({
      id: normalizeSectionId(section.id),
      label: section.label || "Page content",
    }))
    .filter(section => ADMIN_SECTION_IDS.has(section.id) && state.items.some(item => item.section === section.id));
  state.country = editable.country?.id || state.country;
  state.language = editable.language || state.language;
  state.page = editable.page?.path || state.page;
  state.dirty = false;
  state.sectionGroups = new Map();
  els.editorList.innerHTML = "";

  renderFilterButtons();

  state.sections.forEach(section => {
    state.sectionGroups.set(section.id, createSectionGroup(section));
  });

  state.items.forEach(item => {
    const group = state.sectionGroups.get(item.section);
    if (!group) return;

    const card = els.fieldTemplate.content.firstElementChild.cloneNode(true);
    const label = card.querySelector("label");
    const meta = card.querySelector(".field-card__head span");
    const badge = card.querySelector(".field-card__head strong");
    const sectionLabel = card.querySelector(".field-card__section");
    const textarea = card.querySelector("[data-text-value]");
    const imageField = card.querySelector("[data-image-field]");
    const imagePreview = imageField?.querySelector("img");
    const imageStatus = imageField?.querySelector("[data-image-status]");
    const imageChange = imageField?.querySelector("[data-image-change]");
    const imageFile = imageField?.querySelector("[data-image-file]");
    const original = card.querySelector("details p");
    const fieldId = `field-${item.type}-${item.id}`.replace(/[^a-zA-Z0-9_-]/g, "-");

    item.card = card;
    card.dataset.section = item.section;
    if (item.heroSlide) card.dataset.heroSlide = String(item.heroSlide);
    if (item.heroRole) card.dataset.heroRole = item.heroRole;
    label.setAttribute("for", fieldId);
    label.textContent = item.label;
    meta.textContent = item.type === "domText"
      ? `Backend text ID: ${item.id}`
      : item.type === "domImage"
        ? `Backend image ID: ${item.id}`
        : item.type === "productSelection"
          ? "Homepage product selection"
          : `Translation key: ${item.id}`;
    badge.textContent = isItemChanged(item) ? "Changed" : "";
    sectionLabel.textContent = item.sectionLabel;
    original.textContent = item.type === "domImage"
      ? imageValueToText(item.original)
      : item.type === "productSelection"
        ? selectedProductText(item.original)
        : item.original || "";

    if (item.type === "productSelection") {
      renderProductSelectionField({ item, card, textarea, badge, original });
    } else if (item.type === "domImage") {
      textarea.classList.add("is-hidden");
      imageField.classList.remove("is-hidden");
      updateImagePreview(imagePreview, resolveImagePreviewSrc(item), item.previewUrl);
      if (imageStatus) imageStatus.textContent = "Backend image";
      imageChange?.addEventListener("click", () => imageFile?.click());
      imageFile?.addEventListener("change", async event => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!UPLOAD_IMAGE_TYPES.has(file.type)) {
          setStatus("Please choose a PNG, JPEG, or WebP image.", "error");
          event.target.value = "";
          return;
        }

        const previousValue = normalizeImageValue(item.value);
        const dataUrl = await readImageFile(file);
        updateImagePreview(imagePreview, dataUrl);
        if (imageStatus) imageStatus.textContent = "Uploading...";

        try {
          const uploadedImage = await uploadImageFile(file, dataUrl, item.id, item.value?.src || item.original?.src || "");
          item.value.src = uploadedImage.secureUrl;
          item.value.alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
          item.value.loading = "";
          item.value.srcset = "";
          item.value.sizes = "";
          updateImagePreview(imagePreview, uploadedImage.secureUrl);
          if (imageStatus) imageStatus.textContent = "Uploaded to Cloudinary";
          badge.textContent = isItemChanged(item) ? "Changed" : "";
          setDirty(true);
          applySearchFilter();
        } catch (error) {
          item.value = previousValue;
          updateImagePreview(imagePreview, resolveImagePreviewSrc(item), item.previewUrl);
          if (imageStatus) imageStatus.textContent = "Upload failed";
          setStatus(error.message, "error");
        }

        event.target.value = "";
      });
    } else {
      textarea.id = fieldId;
      textarea.value = item.value || "";
      textarea.rows = item.value && item.value.length > 220 ? 5 : 3;

      textarea.addEventListener("input", event => {
        item.value = event.target.value;
        badge.textContent = isItemChanged(item) ? "Changed" : "";
        setDirty(true);
        applySearchFilter();
      });
    }

    group.fields.appendChild(card);
  });

  applySearchFilter();
  setStatus(`${getPageLabel()} loaded for ${editable.country?.name || state.country} (${state.language.toUpperCase()}).`);
}

function setDirty(isDirty) {
  state.dirty = isDirty;
  updateCounts();
  if (isDirty) {
    setStatus("Unsaved changes.");
  }
}

function applySearchFilter() {
  const query = els.searchInput.value.trim().toLowerCase();
  let visibleCount = 0;
  const sectionVisibleCounts = new Map();

  state.items.forEach(item => {
    const isVisible = fieldMatchesFilter(item) && fieldMatchesSearch(item, query);
    item.card?.classList.toggle("is-hidden", !isVisible);
    if (!isVisible) return;

    visibleCount += 1;
    sectionVisibleCounts.set(item.section, (sectionVisibleCounts.get(item.section) || 0) + 1);
  });

  state.sectionGroups.forEach((group, sectionId) => {
    const visibleInSection = sectionVisibleCounts.get(sectionId) || 0;
    const totalInSection = state.items.filter(item => item.section === sectionId).length;
    group.element.classList.toggle("is-hidden", visibleInSection === 0);
    group.count.textContent = `${visibleInSection}/${totalInSection} fields`;
  });

  updateCounts(visibleCount);

  if (query) {
    setStatus(`${visibleCount} matching fields on ${getPageLabel()}.`);
  } else if (state.filter !== "all") {
    const label = getFilterButtons().find(button => button.dataset.filter === state.filter)?.textContent || state.filter;
    setStatus(`${visibleCount} fields shown in ${label}.`);
  } else if (!state.dirty && state.items.length) {
    setStatus(`${state.items.length} editable fields loaded for ${getPageLabel()}.`);
  }
}

async function loadCountries() {
  const payload = await apiRequest("/api/countries");
  state.countries = payload.countries || [];
  syncCountryOptions();
  syncLanguageOptions();
}

function normalizeProductSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getProductTranslation(product, language = state.language || "ru") {
  return product?.translations?.[language]
    || product?.translations?.ru
    || product?.translations?.kz
    || {};
}

function getProductName(product) {
  const translation = getProductTranslation(product);
  return translation.name || product?.slug || product?.id || "Untitled product";
}

function getProductImage(product, slot = "card") {
  return product?.images?.[slot] || {};
}

function getCanonicalProductImage(product) {
  const images = product?.images || {};
  const mainCandidates = [
    images.card,
    images.detailHero,
    images.hero,
  ].filter(image => image?.src);
  if (mainCandidates.length) {
    return mainCandidates.find(image => isCloudinaryImageUrl(image.src)) || mainCandidates[0] || {};
  }

  const candidates = Object.values(images).filter(image => image?.src);
  return candidates.find(image => isCloudinaryImageUrl(image.src)) || candidates[0] || {};
}

function syncProductImageFormFields(image) {
  const src = String(image?.src || "").trim();
  const alt = String(image?.alt || "").trim();
  const cloudinaryPublicId = isCloudinaryImageUrl(src)
    ? String(image?.cloudinaryPublicId || "").trim()
    : "";

  setFormValue("imageSrc", src);
  setFormValue("imageCloudinaryPublicId", cloudinaryPublicId);
  setFormValue("imageAlt", alt);
  setFormValue("detailImageSrc", src);
  setFormValue("detailImageCloudinaryPublicId", cloudinaryPublicId);
  setFormValue("detailImageAlt", alt);

  updateProductImagePreview(src, alt || getFormValue("ruName"));
  const status = isCloudinaryImageUrl(src) ? "Shared Cloudinary image" : "Shared backend image";
  setProductImageStatus(status);
  setProductDetailImageStatus(status);
}

function currentSelectedProduct() {
  return state.products.find(product => product.id === state.selectedProductId) || null;
}

function getAreaLabel(areaId, language = state.language || "ru") {
  const area = state.therapeuticAreas.find(candidate => candidate.id === areaId);
  return area?.translations?.[language]?.name
    || area?.translations?.ru?.name
    || area?.translations?.kz?.name
    || areaId
    || "No direction";
}

function productSlugFromPagePath(value) {
  return normalizeProductSlug(String(value || "")
    .split(/[?#]/)[0]
    .replace(/\\/g, "/")
    .replace(/^products\//, "")
    .replace(/\.html$/i, "")
    .replace(/\/index$/i, ""));
}

function getProductSection(product, language, sectionType) {
  return product?.sections?.[language]?.[sectionType]
    || product?.sections?.ru?.[sectionType]
    || product?.sections?.kz?.[sectionType]
    || {};
}

function normalizeBenefitsInput(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
}

function benefitsToTextarea(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function textListToTextarea(value) {
  return Array.isArray(value) ? value.map(item => String(item || "").trim()).filter(Boolean).join("\n") : "";
}

function objectListToTextarea(value, fields) {
  return Array.isArray(value)
    ? value.map(item => fields.map(field => String(item?.[field] || "").trim()).join(" | ").replace(/(?:\s*\|\s*)+$/g, "")).filter(Boolean).join("\n")
    : "";
}

function parsePipeRows(value, fields) {
  return String(value || "")
    .split(/\r?\n/)
    .map(row => row.trim())
    .filter(Boolean)
    .map(row => {
      const parts = row.split("|").map(part => part.trim());
      return Object.fromEntries(fields.map((field, index) => [field, parts[index] || ""]));
    })
    .filter(item => Object.values(item).some(part => String(part || "").trim()));
}

function textRowsToFormulaPoints(value, imageSlots = []) {
  return normalizeBenefitsInput(value).map((text, index) => ({
    text,
    imageSrc: imageSlots[index]?.src || "",
    imageAlt: imageSlots[index]?.alt || "",
  }));
}

function purchaseLinksToTextarea(value) {
  return Array.isArray(value)
    ? value.map(link => [link.label, link.url, link.logoSrc, link.logoAlt].map(part => String(part || "").trim()).join(" | ").replace(/(?:\s*\|\s*)+$/g, "")).join("\n")
    : "";
}

function parsePurchaseLinks(value) {
  return parsePipeRows(value, ["label", "url", "logoSrc", "logoAlt"]).map((link, index) => ({
    slot: normalizeProductSlug(link.label || `partner-${index + 1}`) || `partner-${index + 1}`,
    label: link.label,
    url: link.url,
    logoSrc: link.logoSrc,
    logoAlt: link.logoAlt || link.label,
    sortOrder: index,
  })).filter(link => link.label && link.url);
}

function makeEmptyProductSections() {
  return {
    hero: { kicker: "", lead: "", badges: [], metrics: [] },
    overview: { label: "", heading: "", intro: "", facts: [] },
    formula: { label: "", heading: "", intro: "", points: [] },
    usage: { label: "", heading: "", items: [] },
    note: { title: "", text: "" },
    buy: { intro: "" },
  };
}

function renderTherapeuticAreaOptions(selectedAreaId = "") {
  if (!els.therapeuticAreaSelect) return;
  const existingIds = new Set(state.therapeuticAreas.map(area => area.id));
  const productAreaIds = state.products
    .map(product => product.therapeuticAreaId)
    .filter(Boolean)
    .filter(areaId => !existingIds.has(areaId));
  const areas = [
    ...state.therapeuticAreas,
    ...[...new Set(productAreaIds)].map(areaId => ({
      id: areaId,
      sortOrder: 999,
      translations: { ru: { name: areaId } },
    })),
  ].sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0) || getAreaLabel(left.id).localeCompare(getAreaLabel(right.id)));

  els.therapeuticAreaSelect.innerHTML = "";
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "Choose direction";
  els.therapeuticAreaSelect.appendChild(emptyOption);

  areas.forEach(area => {
    const option = document.createElement("option");
    option.value = area.id;
    option.textContent = getAreaLabel(area.id);
    els.therapeuticAreaSelect.appendChild(option);
  });

  els.therapeuticAreaSelect.value = selectedAreaId || "";
}

function updateProductImagePreview(src = "", alt = "") {
  if (!els.productImagePreview) return;
  const previewSrc = src && isAbsoluteImageSource(src) ? src : getLocalAssetPreviewSrc(src);
  els.productImagePreview.src = withRuntimeImageRefresh(previewSrc || "");
  els.productImagePreview.alt = alt || "";
  els.productImagePreview.closest(".product-card-editor__image")?.classList.toggle("is-empty", !src);
}

function setProductImageStatus(message) {
  if (els.productImageStatus) {
    els.productImageStatus.textContent = message;
  }
}

function setProductDetailImageStatus(message) {
  if (els.productDetailImageStatus) {
    els.productDetailImageStatus.textContent = message;
  }
}

function updateProductEditorMeta(product = null, mode = "ready") {
  if (els.productEditorTitle) {
    els.productEditorTitle.textContent = product
      ? getProductName(product)
      : mode === "new"
        ? "New product"
        : "Select a product";
  }

  if (els.productEditorStatus) {
    els.productEditorStatus.textContent = product
      ? `${getAreaLabel(product.therapeuticAreaId)} | ${product.status || "draft"}`
      : mode === "new"
        ? "Draft"
        : "Ready";
  }
}

function makeEmptyProduct() {
  const nextSortOrder = state.products.reduce((max, product) => Math.max(max, Number(product.sortOrder || 0)), 0) + 1;
  return {
    id: "",
    slug: "",
    pagePath: "",
    status: "draft",
    sortOrder: nextSortOrder,
    therapeuticAreaId: "",
    accentColor: "",
    isFeatured: false,
    translations: {
      ru: { name: "", shortDescription: "", fullDescription: "", composition: "", usageText: "", benefits: [] },
      kz: { name: "", shortDescription: "", fullDescription: "", composition: "", usageText: "", benefits: [] },
    },
    images: {
      card: { src: "", cloudinaryPublicId: "", alt: "" },
      detailHero: { src: "", cloudinaryPublicId: "", alt: "" },
      formulaCenter: { src: "", cloudinaryPublicId: "", alt: "" },
      formulaPointActive: { src: "", cloudinaryPublicId: "", alt: "" },
      formulaPointSeawater: { src: "", cloudinaryPublicId: "", alt: "" },
      formulaPointFormat: { src: "", cloudinaryPublicId: "", alt: "" },
    },
    sections: {
      ru: makeEmptyProductSections(),
      kz: makeEmptyProductSections(),
    },
  };
}

function setFormValue(name, value) {
  const field = els.productForm?.elements?.[name];
  if (!field) return;
  if (field.type === "checkbox") {
    field.checked = Boolean(value);
  } else {
    field.value = value ?? "";
  }
}

function getFormValue(name) {
  const field = els.productForm?.elements?.[name];
  if (!field) return "";
  return field.type === "checkbox" ? field.checked : field.value;
}

function fillProductForm(product) {
  if (!els.productForm) return;
  const ru = product.translations?.ru || {};
  const kz = product.translations?.kz || {};
  const image = getCanonicalProductImage(product);
  const ruHero = getProductSection(product, "ru", "hero");
  const kzHero = getProductSection(product, "kz", "hero");
  const ruOverview = getProductSection(product, "ru", "overview");
  const kzOverview = getProductSection(product, "kz", "overview");
  const ruFormula = getProductSection(product, "ru", "formula");
  const kzFormula = getProductSection(product, "kz", "formula");
  const ruUsage = getProductSection(product, "ru", "usage");
  const kzUsage = getProductSection(product, "kz", "usage");
  const ruNote = getProductSection(product, "ru", "note");
  const kzNote = getProductSection(product, "kz", "note");
  const ruBuy = getProductSection(product, "ru", "buy");
  const kzBuy = getProductSection(product, "kz", "buy");

  setFormValue("id", product.id || "");
  setFormValue("slug", product.slug || "");
  setFormValue("status", product.status || "draft");
  setFormValue("sortOrder", product.sortOrder || 0);
  setFormValue("accentColor", product.accentColor || "");
  setFormValue("isFeatured", Boolean(product.isFeatured));
  setFormValue("therapeuticAreaId", product.therapeuticAreaId || "");
  setFormValue("pagePath", product.pagePath || "");
  setFormValue("imageSrc", image.src || "");
  setFormValue("imageCloudinaryPublicId", image.cloudinaryPublicId || "");
  setFormValue("imageAlt", image.alt || "");
  setFormValue("detailImageSrc", image.src || "");
  setFormValue("detailImageCloudinaryPublicId", image.cloudinaryPublicId || "");
  setFormValue("detailImageAlt", image.alt || "");
  setFormValue("ruName", ru.name || "");
  setFormValue("ruShortDescription", ru.shortDescription || "");
  setFormValue("kzName", kz.name || "");
  setFormValue("kzShortDescription", kz.shortDescription || "");
  setFormValue("ruHeroKicker", ruHero.kicker || "");
  setFormValue("kzHeroKicker", kzHero.kicker || "");
  setFormValue("ruHeroLead", ruHero.lead || ru.fullDescription || "");
  setFormValue("kzHeroLead", kzHero.lead || kz.fullDescription || "");
  setFormValue("ruHeroBadges", textListToTextarea(ruHero.badges));
  setFormValue("kzHeroBadges", textListToTextarea(kzHero.badges));
  setFormValue("ruHeroMetrics", objectListToTextarea(ruHero.metrics, ["value", "title"]));
  setFormValue("kzHeroMetrics", objectListToTextarea(kzHero.metrics, ["value", "title"]));
  setFormValue("ruOverviewLabel", ruOverview.label || "");
  setFormValue("kzOverviewLabel", kzOverview.label || "");
  setFormValue("ruOverviewHeading", ruOverview.heading || "");
  setFormValue("kzOverviewHeading", kzOverview.heading || "");
  setFormValue("ruOverviewIntro", ruOverview.intro || ru.fullDescription || "");
  setFormValue("kzOverviewIntro", kzOverview.intro || kz.fullDescription || "");
  setFormValue("ruOverviewFacts", objectListToTextarea(ruOverview.facts, ["value", "title", "text"]));
  setFormValue("kzOverviewFacts", objectListToTextarea(kzOverview.facts, ["value", "title", "text"]));
  setFormValue("ruFormulaLabel", ruFormula.label || "");
  setFormValue("kzFormulaLabel", kzFormula.label || "");
  setFormValue("ruFormulaHeading", ruFormula.heading || "");
  setFormValue("kzFormulaHeading", kzFormula.heading || "");
  setFormValue("ruFormulaIntro", ruFormula.intro || ru.composition || "");
  setFormValue("kzFormulaIntro", kzFormula.intro || kz.composition || "");
  setFormValue("ruFormulaPoints", textListToTextarea((ruFormula.points || []).map(point => point.text)));
  setFormValue("kzFormulaPoints", textListToTextarea((kzFormula.points || []).map(point => point.text)));
  setFormValue("formulaCenterSrc", getProductImage(product, "formulaCenter").src || ruFormula.image || "");
  setFormValue("formulaCenterCloudinaryPublicId", getProductImage(product, "formulaCenter").cloudinaryPublicId || "");
  setFormValue("formulaPointActiveSrc", getProductImage(product, "formulaPointActive").src || ruFormula.points?.[0]?.imageSrc || "");
  setFormValue("formulaPointActiveCloudinaryPublicId", getProductImage(product, "formulaPointActive").cloudinaryPublicId || "");
  setFormValue("formulaPointSeawaterSrc", getProductImage(product, "formulaPointSeawater").src || ruFormula.points?.[1]?.imageSrc || "");
  setFormValue("formulaPointSeawaterCloudinaryPublicId", getProductImage(product, "formulaPointSeawater").cloudinaryPublicId || "");
  setFormValue("formulaPointFormatSrc", getProductImage(product, "formulaPointFormat").src || ruFormula.points?.[2]?.imageSrc || "");
  setFormValue("formulaPointFormatCloudinaryPublicId", getProductImage(product, "formulaPointFormat").cloudinaryPublicId || "");
  syncFormulaImagePreviews();
  setFormValue("ruUsageLabel", ruUsage.label || "");
  setFormValue("kzUsageLabel", kzUsage.label || "");
  setFormValue("ruUsageHeading", ruUsage.heading || "");
  setFormValue("kzUsageHeading", kzUsage.heading || "");
  setFormValue("ruUsageItems", objectListToTextarea(ruUsage.items, ["title", "text"]));
  setFormValue("kzUsageItems", objectListToTextarea(kzUsage.items, ["title", "text"]));
  setFormValue("ruNoteTitle", ruNote.title || "");
  setFormValue("kzNoteTitle", kzNote.title || "");
  setFormValue("ruNoteText", ruNote.text || ru.usageText || "");
  setFormValue("kzNoteText", kzNote.text || kz.usageText || "");
  setFormValue("ruBuyIntro", ruBuy.intro || "");
  setFormValue("kzBuyIntro", kzBuy.intro || "");
  setFormValue("ruBenefits", benefitsToTextarea(ru.benefits));
  setFormValue("kzBenefits", benefitsToTextarea(kz.benefits));
  setFormValue("purchaseLinks", purchaseLinksToTextarea(product.purchaseLinks));
  renderTherapeuticAreaOptions(product.therapeuticAreaId || "");
  updateProductImagePreview(image.src || "", image.alt || ru.name || product.id || "");
  setProductImageStatus(isCloudinaryImageUrl(image.src) ? "Shared Cloudinary image" : "Shared backend image");
  setProductDetailImageStatus(isCloudinaryImageUrl(image.src) ? "Shared Cloudinary image" : "Shared backend image");
  updateProductEditorMeta(product, state.selectedProductId ? "edit" : "new");
  syncProductFormMode();
}

function syncProductFormMode() {
  if (!els.productForm) return;
  const isExisting = Boolean(state.selectedProductId);
  const isDetailMode = state.productEditorMode === "detail";
  if (els.productIdInput) {
    els.productIdInput.readOnly = isExisting;
    els.productIdInput.title = isExisting ? "Product ID is kept stable while editing." : "";
  }
  if (els.productDelete) {
    els.productDelete.disabled = state.busy || !isExisting || isDetailMode;
  }
}

function productPayloadFromForm() {
  const baseProduct = currentSelectedProduct() || makeEmptyProduct();
  const baseRu = baseProduct.translations?.ru || {};
  const baseKz = baseProduct.translations?.kz || {};
  const baseImage = getProductImage(baseProduct);
  const baseDetailImage = getProductImage(baseProduct, "detailHero");
  const ruName = String(getFormValue("ruName") || "").trim();
  const kzName = String(getFormValue("kzName") || "").trim();
  const pagePath = String(getFormValue("pagePath") || baseProduct.pagePath || "").trim();
  const slug = normalizeProductSlug(getFormValue("slug") || baseProduct.slug || productSlugFromPagePath(pagePath) || ruName || kzName);
  const id = normalizeProductSlug(getFormValue("id") || baseProduct.id || slug);
  const imageSrc = String(getFormValue("imageSrc") || "").trim();
  const detailImageSrc = String(getFormValue("detailImageSrc") || "").trim();
  const imageAlt = String(getFormValue("imageAlt") || "").trim();
  const detailImageAlt = String(getFormValue("detailImageAlt") || "").trim();
  const imageCandidates = [
    {
      src: imageSrc,
      alt: imageAlt,
      cloudinaryPublicId: String(getFormValue("imageCloudinaryPublicId") || "").trim() || String(baseImage.cloudinaryPublicId || "").trim(),
    },
    {
      src: detailImageSrc,
      alt: detailImageAlt,
      cloudinaryPublicId: String(getFormValue("detailImageCloudinaryPublicId") || "").trim() || String(baseDetailImage.cloudinaryPublicId || "").trim(),
    },
    baseImage,
    baseDetailImage,
  ].filter(image => image?.src);
  const canonicalImage = imageCandidates.find(image => isCloudinaryImageUrl(image.src)) || imageCandidates[0] || {};
  const canonicalImageSrc = String(canonicalImage.src || "").trim();
  const canonicalImageAlt = String(canonicalImage.alt || imageAlt || detailImageAlt || ruName || kzName || id).trim();
  const canonicalImagePublicId = isCloudinaryImageUrl(canonicalImageSrc)
    ? String(canonicalImage.cloudinaryPublicId || "").trim() || null
    : null;
  const ruHeroLead = String(getFormValue("ruHeroLead") || "").trim();
  const kzHeroLead = String(getFormValue("kzHeroLead") || "").trim();
  const ruHeroKicker = String(getFormValue("ruHeroKicker") || "").trim();
  const kzHeroKicker = String(getFormValue("kzHeroKicker") || "").trim();
  const ruHeroBadges = normalizeBenefitsInput(getFormValue("ruHeroBadges"));
  const kzHeroBadges = normalizeBenefitsInput(getFormValue("kzHeroBadges"));
  const ruHeroMetrics = parsePipeRows(getFormValue("ruHeroMetrics"), ["value", "title"]);
  const kzHeroMetrics = parsePipeRows(getFormValue("kzHeroMetrics"), ["value", "title"]);
  const ruOverviewLabel = String(getFormValue("ruOverviewLabel") || "").trim();
  const kzOverviewLabel = String(getFormValue("kzOverviewLabel") || "").trim();
  const ruOverviewHeading = String(getFormValue("ruOverviewHeading") || "").trim();
  const kzOverviewHeading = String(getFormValue("kzOverviewHeading") || "").trim();
  const ruOverviewIntro = String(getFormValue("ruOverviewIntro") || "").trim();
  const kzOverviewIntro = String(getFormValue("kzOverviewIntro") || "").trim();
  const ruOverviewFacts = parsePipeRows(getFormValue("ruOverviewFacts"), ["value", "title", "text"]);
  const kzOverviewFacts = parsePipeRows(getFormValue("kzOverviewFacts"), ["value", "title", "text"]);
  const ruFormulaLabel = String(getFormValue("ruFormulaLabel") || "").trim();
  const kzFormulaLabel = String(getFormValue("kzFormulaLabel") || "").trim();
  const ruFormulaHeading = String(getFormValue("ruFormulaHeading") || "").trim();
  const kzFormulaHeading = String(getFormValue("kzFormulaHeading") || "").trim();
  const ruFormulaIntro = String(getFormValue("ruFormulaIntro") || "").trim();
  const kzFormulaIntro = String(getFormValue("kzFormulaIntro") || "").trim();
  const formulaImages = [
    {
      src: String(getFormValue("formulaPointActiveSrc") || "").trim(),
      alt: "",
      cloudinaryPublicId: String(getFormValue("formulaPointActiveCloudinaryPublicId") || "").trim() || getProductImage(baseProduct, "formulaPointActive").cloudinaryPublicId || null,
    },
    {
      src: String(getFormValue("formulaPointSeawaterSrc") || "").trim(),
      alt: "",
      cloudinaryPublicId: String(getFormValue("formulaPointSeawaterCloudinaryPublicId") || "").trim() || getProductImage(baseProduct, "formulaPointSeawater").cloudinaryPublicId || null,
    },
    {
      src: String(getFormValue("formulaPointFormatSrc") || "").trim(),
      alt: "",
      cloudinaryPublicId: String(getFormValue("formulaPointFormatCloudinaryPublicId") || "").trim() || getProductImage(baseProduct, "formulaPointFormat").cloudinaryPublicId || null,
    },
  ];
  const ruFormulaPoints = textRowsToFormulaPoints(getFormValue("ruFormulaPoints"), formulaImages);
  const kzFormulaPoints = textRowsToFormulaPoints(getFormValue("kzFormulaPoints"), formulaImages);
  const ruUsageLabel = String(getFormValue("ruUsageLabel") || "").trim();
  const kzUsageLabel = String(getFormValue("kzUsageLabel") || "").trim();
  const ruUsageHeading = String(getFormValue("ruUsageHeading") || "").trim();
  const kzUsageHeading = String(getFormValue("kzUsageHeading") || "").trim();
  const ruUsageItems = parsePipeRows(getFormValue("ruUsageItems"), ["title", "text"]);
  const kzUsageItems = parsePipeRows(getFormValue("kzUsageItems"), ["title", "text"]);
  const ruNoteTitle = String(getFormValue("ruNoteTitle") || "").trim();
  const kzNoteTitle = String(getFormValue("kzNoteTitle") || "").trim();
  const ruNoteText = String(getFormValue("ruNoteText") || "").trim();
  const kzNoteText = String(getFormValue("kzNoteText") || "").trim();
  const ruBuyIntro = String(getFormValue("ruBuyIntro") || "").trim();
  const kzBuyIntro = String(getFormValue("kzBuyIntro") || "").trim();
  const ruBenefits = normalizeBenefitsInput(getFormValue("ruBenefits"));
  const kzBenefits = normalizeBenefitsInput(getFormValue("kzBenefits"));

  return {
    id,
    slug,
    pagePath: pagePath || `products/${slug}.html`,
    status: String(getFormValue("status") || baseProduct.status || "draft"),
    sortOrder: Number(getFormValue("sortOrder") || baseProduct.sortOrder || 0),
    therapeuticAreaId: getFormValue("therapeuticAreaId") || null,
    accentColor: String(getFormValue("accentColor") || "").trim() || null,
    isFeatured: Boolean(getFormValue("isFeatured")),
    translations: {
      ru: {
        name: ruName || slug,
        shortDescription: String(getFormValue("ruShortDescription") || "").trim(),
        fullDescription: ruHeroLead,
        composition: ruFormulaIntro,
        usageText: ruNoteText,
        benefits: ruBenefits,
      },
      kz: {
        name: kzName,
        shortDescription: String(getFormValue("kzShortDescription") || "").trim(),
        fullDescription: kzHeroLead,
        composition: kzFormulaIntro,
        usageText: kzNoteText,
        benefits: kzBenefits,
      },
    },
    images: {
      ...(baseProduct.images || {}),
      card: {
        src: canonicalImageSrc,
        alt: canonicalImageAlt,
        cloudinaryPublicId: canonicalImagePublicId,
      },
      detailHero: {
        src: canonicalImageSrc,
        alt: canonicalImageAlt,
        cloudinaryPublicId: canonicalImagePublicId,
      },
      hero: {
        src: canonicalImageSrc,
        alt: canonicalImageAlt,
        cloudinaryPublicId: canonicalImagePublicId,
      },
      formulaCenter: {
        ...(baseProduct.images?.formulaCenter || {}),
        src: String(getFormValue("formulaCenterSrc") || "").trim(),
        cloudinaryPublicId: String(getFormValue("formulaCenterCloudinaryPublicId") || "").trim() || baseProduct.images?.formulaCenter?.cloudinaryPublicId || null,
      },
      formulaPointActive: {
        ...(baseProduct.images?.formulaPointActive || {}),
        src: formulaImages[0].src,
        cloudinaryPublicId: formulaImages[0].cloudinaryPublicId,
      },
      formulaPointSeawater: {
        ...(baseProduct.images?.formulaPointSeawater || {}),
        src: formulaImages[1].src,
        cloudinaryPublicId: formulaImages[1].cloudinaryPublicId,
      },
      formulaPointFormat: {
        ...(baseProduct.images?.formulaPointFormat || {}),
        src: formulaImages[2].src,
        cloudinaryPublicId: formulaImages[2].cloudinaryPublicId,
      },
    },
    sections: {
      ru: {
        hero: { kicker: ruHeroKicker, lead: ruHeroLead, badges: ruHeroBadges, metrics: ruHeroMetrics },
        overview: { label: ruOverviewLabel, heading: ruOverviewHeading, intro: ruOverviewIntro, facts: ruOverviewFacts },
        formula: { label: ruFormulaLabel, heading: ruFormulaHeading, intro: ruFormulaIntro, points: ruFormulaPoints },
        usage: { label: ruUsageLabel, heading: ruUsageHeading, items: ruUsageItems },
        note: { title: ruNoteTitle, text: ruNoteText },
        buy: { intro: ruBuyIntro },
      },
      kz: {
        hero: { kicker: kzHeroKicker, lead: kzHeroLead, badges: kzHeroBadges, metrics: kzHeroMetrics },
        overview: { label: kzOverviewLabel, heading: kzOverviewHeading, intro: kzOverviewIntro, facts: kzOverviewFacts },
        formula: { label: kzFormulaLabel, heading: kzFormulaHeading, intro: kzFormulaIntro, points: kzFormulaPoints },
        usage: { label: kzUsageLabel, heading: kzUsageHeading, items: kzUsageItems },
        note: { title: kzNoteTitle, text: kzNoteText },
        buy: { intro: kzBuyIntro },
      },
    },
    purchaseLinks: parsePurchaseLinks(getFormValue("purchaseLinks")),
  };
}

function getProductImageUploadId() {
  const baseProduct = currentSelectedProduct() || {};
  return normalizeProductSlug(
    getFormValue("id")
    || baseProduct.id
    || getFormValue("slug")
    || baseProduct.slug
    || productSlugFromPagePath(getFormValue("pagePath"))
    || getFormValue("ruName")
    || getFormValue("kzName")
  );
}

function getProductImageUploadFields(slot = "card") {
  if (slot === "detailHero") {
    return {
      src: "detailImageSrc",
      alt: "detailImageAlt",
      cloudinaryPublicId: "detailImageCloudinaryPublicId",
      status: setProductDetailImageStatus,
      uploadName: "detail-hero",
    };
  }

  return {
    src: "imageSrc",
    alt: "imageAlt",
    cloudinaryPublicId: "imageCloudinaryPublicId",
    status: setProductImageStatus,
    uploadName: "card",
  };
}

function getFormulaImageStatusElement(slot) {
  return els.productForm?.querySelector(`[data-formula-image-status="${slot}"]`) || null;
}

function setFormulaImageStatus(slot, message) {
  const status = getFormulaImageStatusElement(slot);
  if (status) status.textContent = message;
}

function getFormulaImagePreviewElement(slot) {
  return els.productForm?.querySelector(`[data-formula-image-preview="${slot}"]`) || null;
}

function getFormulaImageField(slot) {
  const fields = FORMULA_IMAGE_UPLOAD_FIELDS[slot];
  return fields ? els.productForm?.elements?.[fields.src] || null : null;
}

function updateFormulaImagePreview(slot, src = "") {
  const preview = getFormulaImagePreviewElement(slot);
  const field = getFormulaImageField(slot);
  const previewBox = preview?.closest(".formula-image-preview") || null;
  const normalizedSrc = String(src || "").trim();
  if (field) field.title = normalizedSrc;
  if (!preview || !previewBox) return;

  preview.alt = normalizedSrc ? `${FORMULA_IMAGE_UPLOAD_FIELDS[slot]?.label || "formula image"} preview` : "";
  previewBox.classList.toggle("is-empty", !normalizedSrc);
  previewBox.classList.remove("is-error");
  if (!normalizedSrc) {
    preview.removeAttribute("src");
    return;
  }
  preview.onerror = () => {
    previewBox.classList.add("is-error");
    previewBox.classList.remove("is-empty");
  };
  preview.onload = () => {
    previewBox.classList.remove("is-empty", "is-error");
  };
  preview.src = withRuntimeImageRefresh(getLocalAssetPreviewSrc(normalizedSrc));
}

function syncFormulaImageSlot(slot) {
  const fields = FORMULA_IMAGE_UPLOAD_FIELDS[slot];
  if (!fields) return;
  const src = String(getFormValue(fields.src) || "").trim();
  setFormulaImageStatus(slot, src ? isCloudinaryImageUrl(src) ? "Cloudinary image" : "External/local image" : "No image");
  updateFormulaImagePreview(slot, src);
}

function syncFormulaImagePreviews() {
  Object.keys(FORMULA_IMAGE_UPLOAD_FIELDS).forEach(syncFormulaImageSlot);
}

async function handleProductImageUpload(event, slot = "card") {
  const file = event.target.files?.[0];
  const fields = getProductImageUploadFields(slot);
  if (!file) return;
  if (!UPLOAD_IMAGE_TYPES.has(file.type)) {
    setProductStatus("Please choose a PNG, JPEG, or WebP image.", "error");
    event.target.value = "";
    return;
  }

  const productId = getProductImageUploadId();
  if (!productId) {
    setProductStatus("Add a product ID, slug, or title before uploading an image.", "error");
    event.target.value = "";
    return;
  }

  const previousImage = {
    src: getFormValue(fields.src),
    alt: getFormValue(fields.alt),
    cloudinaryPublicId: getFormValue(fields.cloudinaryPublicId),
  };
  const dataUrl = await readImageFile(file);
  if (slot === "card") {
    updateProductImagePreview(dataUrl, previousImage.alt || getFormValue("ruName"));
  }
  fields.status("Uploading...");
  setProductStatus("Uploading product image to Cloudinary...");

  try {
    const uploadedImage = await uploadImageFile(file, dataUrl, `${productId}-${fields.uploadName}`, previousImage.src, {
      context: "product",
      productId,
      slot,
    });
    const fallbackAlt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    syncProductImageFormFields({
      src: uploadedImage.secureUrl,
      cloudinaryPublicId: uploadedImage.publicId || "",
      alt: previousImage.alt || fallbackAlt,
    });
    setProductStatus("Uploaded image. Save product to publish the new image link.", "success");
  } catch (error) {
    setFormValue(fields.src, previousImage.src);
    setFormValue(fields.cloudinaryPublicId, previousImage.cloudinaryPublicId);
    setFormValue(fields.alt, previousImage.alt);
    if (slot === "card") {
      updateProductImagePreview(previousImage.src, previousImage.alt || getFormValue("ruName"));
    }
    fields.status("Upload failed");
    setProductStatus(error.message, "error");
  }

  event.target.value = "";
}

async function handleFormulaImageUpload(event, slot) {
  const file = event.target.files?.[0];
  const fields = FORMULA_IMAGE_UPLOAD_FIELDS[slot];
  if (!file || !fields) return;
  if (!UPLOAD_IMAGE_TYPES.has(file.type)) {
    setProductStatus("Please choose a PNG, JPEG, or WebP image.", "error");
    event.target.value = "";
    return;
  }

  const productId = getProductImageUploadId();
  if (!productId) {
    setProductStatus("Add a product ID, slug, or title before uploading an image.", "error");
    event.target.value = "";
    return;
  }

  const previousImage = {
    src: getFormValue(fields.src),
    cloudinaryPublicId: getFormValue(fields.cloudinaryPublicId),
  };
  const dataUrl = await readImageFile(file);
  setFormulaImageStatus(slot, "Uploading...");
  updateFormulaImagePreview(slot, dataUrl);
  setProductStatus(`Uploading ${fields.label} to Cloudinary...`);

  try {
    const uploadedImage = await uploadImageFile(file, dataUrl, `${productId}-${slot}`, previousImage.src, {
      context: "product",
      productId,
      slot,
    });
    setFormValue(fields.src, uploadedImage.secureUrl);
    setFormValue(fields.cloudinaryPublicId, uploadedImage.publicId || "");
    syncFormulaImageSlot(slot);
    setProductStatus(`Uploaded ${fields.label}. Save product to publish the new image link.`, "success");
  } catch (error) {
    setFormValue(fields.src, previousImage.src);
    setFormValue(fields.cloudinaryPublicId, previousImage.cloudinaryPublicId);
    syncFormulaImageSlot(slot);
    setProductStatus(error.message, "error");
  }

  event.target.value = "";
}

function productMatchesSearch(product, query) {
  if (!query) return true;
  const ru = product.translations?.ru || {};
  const kz = product.translations?.kz || {};
  const image = getProductImage(product);
  const detailImage = getProductImage(product, "detailHero");
  const ruSections = Object.values(product.sections?.ru || {}).flatMap(section => Object.values(section || {}));
  const kzSections = Object.values(product.sections?.kz || {}).flatMap(section => Object.values(section || {}));
  return [
    product.id,
    product.slug,
    product.status,
    product.therapeuticAreaId,
    product.pagePath,
    ru.name,
    ru.shortDescription,
    ru.fullDescription,
    ru.composition,
    ru.usageText,
    ...(ru.benefits || []),
    kz.name,
    kz.shortDescription,
    kz.fullDescription,
    kz.composition,
    kz.usageText,
    ...(kz.benefits || []),
    ...ruSections,
    ...kzSections,
    image.src,
    detailImage.src,
  ].join(" ").toLowerCase().includes(query);
}

function syncProductEditorMode() {
  const mode = state.productEditorMode === "detail" ? "detail" : "catalog";
  if (els.productManager) {
    els.productManager.dataset.productEditorMode = mode;
  }

  const product = currentSelectedProduct();
  if (mode === "detail" && product) {
    state.selectedProductPageId = product.id;
    if (els.productManagerTitle) {
      els.productManagerTitle.textContent = "Product detail";
    }
    els.adminPageTitle.textContent = getProductName(product);
    els.adminPageIntro.textContent = product.pagePath
      ? `Edit ${product.pagePath}.`
      : "Edit the selected product detail page.";
    updateProductEditorMeta(product, "edit");
    if (els.productEditorStatus) {
      els.productEditorStatus.textContent = product.pagePath || `products/${product.slug || product.id}.html`;
    }
  } else if (mode === "catalog") {
    state.selectedProductPageId = "";
    if (els.productManagerTitle) {
      els.productManagerTitle.textContent = "Products";
    }
  }
}

function renderProductPageNav() {
  if (!els.productPageList) return;
  const products = [...state.products]
    .filter(product => product.status !== "archived")
    .sort((left, right) => getProductName(left).localeCompare(getProductName(right)));

  els.productPageList.innerHTML = "";

  if (!products.length) {
    const empty = document.createElement("span");
    empty.className = "product-page-nav__empty";
    empty.textContent = state.productsLoaded ? "No product pages found." : "Load products to show detail pages.";
    els.productPageList.appendChild(empty);
    return;
  }

  products.forEach(product => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `product-page-nav__item${state.selectedProductPageId === product.id ? " is-active" : ""}`;

    const title = document.createElement("span");
    title.textContent = getProductName(product);

    button.append(title);
    button.addEventListener("click", () => setProductDetailPage(product.id));
    els.productPageList.appendChild(button);
  });
}

function renderProductList() {
  if (!els.productList) return;
  const query = state.productSearch.trim().toLowerCase();
  const products = state.products
    .filter(product => productMatchesSearch(product, query))
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0) || getProductName(left).localeCompare(getProductName(right)));

  els.productList.innerHTML = "";
  if (els.productCount) {
    els.productCount.textContent = query
      ? `${products.length} of ${state.products.length} products`
      : `${state.products.length} products`;
  }

  if (!products.length) {
    const empty = document.createElement("p");
    empty.className = "form-message";
    empty.textContent = state.products.length ? "No matching products." : "No products loaded yet.";
    els.productList.appendChild(empty);
    return;
  }

  products.forEach(product => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `product-list__item${product.id === state.selectedProductId ? " is-active" : ""}`;
    button.innerHTML = `
      <strong></strong>
    `;
    button.querySelector("strong").textContent = getProductName(product);
    button.addEventListener("click", () => selectProduct(product.id));
    els.productList.appendChild(button);
  });
}

function selectProduct(productId, options = {}) {
  const product = state.products.find(candidate => candidate.id === productId);
  if (!product) return;
  state.selectedProductId = product.id;
  if (state.productEditorMode === "detail" || options.preservePageMode) {
    state.selectedProductPageId = product.id;
  }
  fillProductForm(product);
  renderProductList();
  renderProductPageNav();
  syncProductEditorMode();
  setProductStatus(`Editing ${getProductName(product)}.`);
}

function upsertStateProduct(product) {
  if (!product?.id) return;
  const index = state.products.findIndex(candidate => candidate.id === product.id);
  if (index === -1) {
    state.products.push(product);
  } else {
    state.products[index] = product;
  }
}

async function loadProductDetail(productId) {
  if (!productId) return null;

  try {
    const params = new URLSearchParams({
      country: state.country || "kazakhstan",
      lang: state.language || "ru",
    });
    const payload = await apiRequest(`/api/admin/products/${encodeURIComponent(productId)}?${params}`);
    const product = payload.product || null;
    if (product) {
      upsertStateProduct(product);
    }
    return product;
  } catch (error) {
    setProductStatus(error.message, "error");
    return null;
  }
}

function startNewProduct() {
  state.productEditorMode = "catalog";
  state.selectedProductPageId = "";
  state.selectedProductId = "";
  fillProductForm(makeEmptyProduct());
  updateProductEditorMeta(null, "new");
  renderProductList();
  renderProductPageNav();
  syncProductEditorMode();
  setProductStatus("Creating a new product.");
}

async function loadProducts(preferredProductId = state.selectedProductId) {
  setBusy(true);
  setProductStatus("Loading products...");

  try {
    const params = new URLSearchParams({
      country: state.country || "kazakhstan",
      lang: state.language || "ru",
    });
    const payload = await apiRequest(`/api/admin/products?${params}`);
    state.products = Array.isArray(payload.products) ? payload.products : [];
    state.therapeuticAreas = Array.isArray(payload.therapeuticAreas) ? payload.therapeuticAreas : [];
    state.productsLoaded = true;
    const selectedId = preferredProductId && state.products.some(product => product.id === preferredProductId)
      ? preferredProductId
      : state.products[0]?.id || "";

    if (selectedId) {
      state.selectedProductId = selectedId;
      if (state.productEditorMode === "detail") {
        state.selectedProductPageId = selectedId;
      }
      fillProductForm(state.products.find(product => product.id === selectedId));
    } else {
      startNewProduct();
    }

    renderProductList();
    renderProductPageNav();
    syncProductEditorMode();
    setProductStatus(`${state.products.length} products loaded.`, "success");
  } catch (error) {
    setProductStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function saveProduct(event) {
  event.preventDefault();
  const product = productPayloadFromForm();

  if (!product.id || !product.slug || !product.translations.ru.name) {
    setProductStatus("ID, slug, and Russian name are required.", "error");
    return;
  }

  setBusy(true);
  setProductStatus("Saving product...");

  try {
    const isExisting = Boolean(state.selectedProductId);
    const path = isExisting
      ? `/api/admin/products/${encodeURIComponent(state.selectedProductId)}`
      : "/api/admin/products";
    const payload = await apiRequest(path, {
      method: isExisting ? "PUT" : "POST",
      body: JSON.stringify(product),
    });
    const savedId = payload.product?.id || product.id;
    await loadProducts(savedId);
    if (state.productEditorMode === "detail") {
      await setProductDetailPage(savedId);
    }
    setProductStatus(`Saved ${getProductName(payload.product || product)}.`, "success");
  } catch (error) {
    setProductStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function deleteSelectedProduct() {
  if (!state.selectedProductId) return;
  const product = state.products.find(candidate => candidate.id === state.selectedProductId);
  const label = getProductName(product);
  if (!window.confirm(`Delete "${label}" from the product catalog?`)) return;

  setBusy(true);
  setProductStatus("Deleting product...");

  try {
    await apiRequest(`/api/admin/products/${encodeURIComponent(state.selectedProductId)}`, {
      method: "DELETE",
    });
    state.selectedProductId = "";
    await loadProducts("");
    setProductStatus(`Deleted ${label}.`, "success");
  } catch (error) {
    setProductStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function importProductsFromSiteAdmin() {
  setBusy(true);
  setProductStatus("Importing products from site...");

  try {
    const payload = await apiRequest("/api/admin/products/import-from-site", {
      method: "POST",
      body: JSON.stringify({}),
    });
    await loadProducts(state.selectedProductId);
    setProductStatus(`Imported ${payload.products || 0} products across ${payload.areas || 0} areas.`, "success");
  } catch (error) {
    setProductStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

function productImageSyncStatusFromOutput(output) {
  const synced = output.match(/Synced\s+(\d+)\s+product image/i)?.[1] || "0";
  const kept = output.match(/Kept\s+(\d+)\s+existing Cloudinary image/i)?.[1] || "";
  const skipped = output.match(/Skipped\s+(\d+)\s+product image/i)?.[1] || "";
  const parts = [`Synced ${synced}`];

  if (kept) parts.push(`kept ${kept} existing Cloudinary`);
  if (skipped) parts.push(`skipped ${skipped} missing local files`);

  return `${parts.join(", ")}.`;
}

async function syncProductImagesToCloudinaryAdmin() {
  setBusy(true);
  setProductStatus("Uploading product images to Cloudinary...");

  try {
    const payload = await apiRequest("/api/admin/products/sync-cloudinary-images", {
      method: "POST",
      body: JSON.stringify({}),
    });
    await loadProducts(state.selectedProductId);
    const output = String(payload.stdout || "").trim();
    setProductStatus(productImageSyncStatusFromOutput(output), "success");
  } catch (error) {
    setProductStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function loadContent() {
  if (!state.country || !state.language || !state.page) return;
  setBusy(true);
  setStatus(`Loading ${getPageLabel()}...`);

  try {
    const params = new URLSearchParams({
      country: state.country,
      lang: state.language,
    });
    const payload = await apiRequest(`/api/admin/content?${params}`);
    if (payload.countries?.length) {
      state.countries = payload.countries;
      syncCountryOptions();
      syncLanguageOptions();
    }
    await renderEditorWithHeroImages(payload.editable);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function saveContent() {
  if (!state.items.length) return;
  const productSelection = state.items.find(item => item.type === "productSelection");
  if (productSelection && normalizeProductSelection(productSelection.value).length !== 4) {
    setStatus("Choose exactly 4 products before saving.", "error");
    return;
  }

  setBusy(true);
  setStatus(`Saving ${getPageLabel()} changes...`);

  const text = {};
  const domText = {};
  const domImages = {};
  const settings = {};

  state.items.forEach(item => {
    if (item.type === "domText") {
      domText[item.id] = item.value || "";
    } else if (item.type === "domImage") {
      domImages[item.id] = normalizeImageValue(item.value);
    } else if (item.type === "productSelection") {
      settings[item.id] = normalizeProductSelection(item.value);
    } else {
      text[item.id] = item.value || "";
    }
  });

  try {
    const payload = await apiRequest("/api/admin/content", {
      method: "POST",
      body: JSON.stringify({
        country: state.country,
        lang: state.language,
        text,
        domText,
        domImages,
        settings,
      }),
    });
    await renderEditorWithHeroImages(payload.editable);
    setStatus(`Changes saved for ${getPageLabel()}.`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

function resetVisibleText() {
  state.items.forEach(item => {
    if (item.card?.classList.contains("is-hidden")) return;
    item.value = item.type === "domImage"
      ? normalizeImageValue(item.original)
      : item.type === "productSelection"
        ? normalizeProductSelection(item.original)
        : item.original || "";
    const textarea = item.card.querySelector("[data-text-value]");
    const badge = item.card.querySelector(".field-card__head strong");
    if (item.type === "domImage") {
      const preview = item.card.querySelector("[data-image-field] img");
      updateImagePreview(preview, resolveImagePreviewSrc(item), item.previewUrl);
    } else if (item.type === "productSelection") {
      const picker = item.card.querySelector(".product-picker");
      const counter = item.card.querySelector(".product-picker__header strong");
      updateProductPickerState(picker, item, badge, counter);
    } else {
      textarea.value = item.value;
    }
    badge.textContent = "";
  });
  setDirty(true);
  applySearchFilter();
}

async function handleLogin(event) {
  event.preventDefault();
  els.loginMessage.textContent = "";

  const formData = new FormData(els.loginForm);
  const login = formData.get("login");
  const password = formData.get("password");

  try {
    const payload = await apiRequest("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ login, password }),
    });
    state.token = payload.session.token;
    sessionStorage.setItem("stada-admin-token", state.token);
    showEditor();
    await loadCountries();
    await loadContent();
    await loadProducts(state.selectedProductId);
  } catch (error) {
    showLogin(error.message);
  }
}

function bindEvents() {
  els.loginForm.addEventListener("submit", handleLogin);
  els.logout.addEventListener("click", () => showLogin(""));
  els.pageNavItems.forEach(button => {
    button.addEventListener("click", () => setAdminPage(button.dataset.adminPage));
  });
  els.countrySelect.addEventListener("change", async event => {
    state.country = event.target.value;
    state.productsLoaded = false;
    state.products = [];
    renderProductPageNav();
    syncLanguageOptions();
    await loadContent();
    await loadProducts(state.selectedProductId);
  });
  els.languageSelect.addEventListener("change", async event => {
    state.language = event.target.value;
    state.productsLoaded = false;
    state.products = [];
    renderProductPageNav();
    await loadContent();
    await loadProducts(state.selectedProductId);
  });
  els.searchInput.addEventListener("input", applySearchFilter);
  els.save.addEventListener("click", saveContent);
  els.reset.addEventListener("click", resetVisibleText);
  els.productForm?.addEventListener("submit", saveProduct);
  els.productDelete?.addEventListener("click", deleteSelectedProduct);
  els.productNew?.addEventListener("click", startNewProduct);
  els.productRefresh?.addEventListener("click", () => loadProducts());
  els.productImport?.addEventListener("click", importProductsFromSiteAdmin);
  els.productSyncImages.forEach(button => {
    button.addEventListener("click", syncProductImagesToCloudinaryAdmin);
  });
  els.productSearch?.addEventListener("input", event => {
    state.productSearch = event.target.value;
    renderProductList();
  });
  els.productImageChange?.addEventListener("click", () => els.productImageFile?.click());
  els.productImageFile?.addEventListener("change", handleProductImageUpload);
  els.productDetailImageChange?.addEventListener("click", () => els.productDetailImageFile?.click());
  els.productDetailImageFile?.addEventListener("change", event => handleProductImageUpload(event, "detailHero"));
  els.productForm?.querySelectorAll("[data-formula-image-change]").forEach(button => {
    button.addEventListener("click", () => {
      const slot = button.dataset.formulaImageChange;
      els.productForm?.querySelector(`[data-formula-image-file="${slot}"]`)?.click();
    });
  });
  els.productForm?.querySelectorAll("[data-formula-image-file]").forEach(input => {
    input.addEventListener("change", event => handleFormulaImageUpload(event, input.dataset.formulaImageFile));
  });
  Object.entries(FORMULA_IMAGE_UPLOAD_FIELDS).forEach(([slot, fields]) => {
    els.productForm?.elements?.[fields.src]?.addEventListener("input", () => {
      setFormValue(fields.cloudinaryPublicId, "");
      syncFormulaImageSlot(slot);
    });
  });
  els.productForm?.elements?.imageSrc?.addEventListener("input", () => {
    syncProductImageFormFields({
      src: getFormValue("imageSrc"),
      alt: getFormValue("imageAlt") || getFormValue("detailImageAlt") || getFormValue("ruName"),
      cloudinaryPublicId: "",
    });
  });
  els.productForm?.elements?.imageAlt?.addEventListener("input", () => {
    syncProductImageFormFields({
      src: getFormValue("imageSrc") || getFormValue("detailImageSrc"),
      alt: getFormValue("imageAlt"),
      cloudinaryPublicId: getFormValue("imageCloudinaryPublicId") || getFormValue("detailImageCloudinaryPublicId"),
    });
  });
  els.productForm?.elements?.detailImageSrc?.addEventListener("input", () => {
    syncProductImageFormFields({
      src: getFormValue("detailImageSrc"),
      alt: getFormValue("detailImageAlt") || getFormValue("imageAlt") || getFormValue("ruName"),
      cloudinaryPublicId: "",
    });
  });
  els.productForm?.elements?.detailImageAlt?.addEventListener("input", () => {
    syncProductImageFormFields({
      src: getFormValue("detailImageSrc") || getFormValue("imageSrc"),
      alt: getFormValue("detailImageAlt"),
      cloudinaryPublicId: getFormValue("detailImageCloudinaryPublicId") || getFormValue("imageCloudinaryPublicId"),
    });
  });
  els.therapeuticAreaSelect?.addEventListener("change", () => {
    const product = {
      ...(currentSelectedProduct() || makeEmptyProduct()),
      therapeuticAreaId: getFormValue("therapeuticAreaId"),
    };
    updateProductEditorMeta(product, state.selectedProductId ? "edit" : "new");
  });
}

async function init() {
  updateApiLabel();
  bindEvents();

  if (!state.token) {
    showLogin();
    return;
  }

  try {
    showEditor();
    await loadCountries();
    await loadContent();
    await loadProducts(state.selectedProductId);
  } catch (error) {
    showLogin(error.message);
  }
}

init();
