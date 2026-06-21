import { countriesData, defaultCountryId, getCountryName, getCountryRegion, getCountrySearchValues } from "./countries-data.js?v=worldwide-22";
import { CountryInfoCard } from "./country-info-card.js?v=worldwide-22";
import { GlobeMap } from "./globe-map.js?v=worldwide-22";

const pageCopy = {
  en: {
    noMatches: "No matching countries",
  },
  ru: {
    noMatches: "Страны не найдены",
  },
  kz: {
    noMatches: "Елдер табылмады",
  },
};

function resolvePageLanguage(lang) {
  if (pageCopy[lang]) return lang;
  return lang === "kg" ? "ru" : "en";
}

function getMarketCountryId() {
  try {
    const market = localStorage.getItem("stada-country");
    if (market === "kg") return "kyrgyzstan";
    if (market === "kz") return "kazakhstan";
  } catch (error) {
    // Keep the configured default if browser storage is unavailable.
  }
  return defaultCountryId;
}

export class WorldwidePage {
  constructor(root = document) {
    this.root = root;
    this.lang = resolvePageLanguage(document.documentElement.lang || "en");
    this.countries = countriesData;
    this.selectedCountry = this.countries.find((country) => country.id === getMarketCountryId()) || this.countries.find((country) => country.id === defaultCountryId) || this.countries[0];
    this.infoCard = new CountryInfoCard(root.querySelector("#country-info-card"));
    this.globe = new GlobeMap(root.querySelector("[data-globe-map]"), this.countries, {
      selectedId: this.selectedCountry.id,
      lang: this.lang,
      onSelect: (country) => this.selectCountry(country.id, { fromGlobe: true }),
    });
    this.searchInput = root.querySelector("[data-country-search]");
    this.countryList = root.querySelector("[data-country-list]");
    this.selectedLabel = root.querySelector("[data-selected-country-label]");
    this.handleLanguageChange = (event) => {
      this.setLanguage(event.detail?.lang || document.documentElement.lang);
      if (event.detail?.country === "kg") this.selectCountry("kyrgyzstan");
      if (event.detail?.country === "kz") this.selectCountry("kazakhstan");
    };
  }

  init() {
    if (!this.selectedCountry) return;
    this.infoCard.setLanguage(this.lang);
    this.renderCountryList(this.countries);
    this.infoCard.render(this.selectedCountry);
    this.updateSelectedLabel();
    this.globe.init();
    this.bindSearch();
    document.addEventListener("stada:languagechange", this.handleLanguageChange);
    this.initReveal();
  }

  setLanguage(lang) {
    this.lang = resolvePageLanguage(lang);
    this.infoCard.setLanguage(this.lang);
    this.globe.setLanguage(this.lang);
    this.renderCountryList(this.currentCountries || this.countries);
    this.infoCard.render(this.selectedCountry);
    this.updateSelectedLabel();
  }

  bindSearch() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener("input", () => {
      const query = this.searchInput.value.trim().toLowerCase();
      const filtered = this.countries.filter((country) => {
        return getCountrySearchValues(country).some((value) => value.toLowerCase().includes(query));
      });
      this.renderCountryList(filtered);
    });
  }

  renderCountryList(countries) {
    if (!this.countryList) return;
    this.currentCountries = countries;
    this.countryList.replaceChildren();

    if (!countries.length) {
      const empty = document.createElement("p");
      empty.className = "country-picker__empty";
      empty.textContent = (pageCopy[this.lang] || pageCopy.en).noMatches;
      this.countryList.appendChild(empty);
      return;
    }

    countries.forEach((country) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "country-option";
      button.dataset.countryOption = country.id;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(country.id === this.selectedCountry.id));
      button.setAttribute("aria-label", `${getCountryName(country, this.lang)} - ${getCountryRegion(country, this.lang)}`);

      const flag = document.createElement("img");
      flag.src = country.flag;
      flag.alt = "";
      flag.loading = "lazy";
      button.appendChild(flag);

      const copy = document.createElement("span");
      copy.className = "country-option__copy";
      const name = document.createElement("strong");
      name.textContent = getCountryName(country, this.lang);
      const region = document.createElement("span");
      region.textContent = getCountryRegion(country, this.lang);
      copy.append(name, region);
      button.appendChild(copy);

      button.addEventListener("click", () => this.selectCountry(country.id));
      this.countryList.appendChild(button);
    });
  }

  selectCountry(countryId, options = {}) {
    const country = this.countries.find((item) => item.id === countryId);
    if (!country) return;

    this.selectedCountry = country;
    this.infoCard.render(country);
    this.updateSelectedLabel();
    this.updateCountryOptions();
    if (!options.fromGlobe) this.globe.focusCountry(country.id, { silent: true });
  }

  updateSelectedLabel() {
    if (this.selectedLabel) this.selectedLabel.textContent = getCountryName(this.selectedCountry, this.lang);
  }

  updateCountryOptions() {
    this.countryList?.querySelectorAll("[data-country-option]").forEach((button) => {
      const isSelected = button.dataset.countryOption === this.selectedCountry.id;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-selected", String(isSelected));
    });
  }

  initReveal() {
    const items = Array.from(this.root.querySelectorAll(".worldwide-reveal"));
    if (!items.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((item, index) => {
      item.style.setProperty("--worldwide-reveal-delay", `${Math.min(index, 5) * 80}ms`);
      observer.observe(item);
    });
  }
}

function initWorldwidePage() {
  const pageRoot = document.querySelector("[data-worldwide-page]");
  if (!pageRoot) return;
  new WorldwidePage(document).init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWorldwidePage);
} else {
  initWorldwidePage();
}
