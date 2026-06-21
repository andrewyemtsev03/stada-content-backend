import { getCountryName, getCountryRegion } from "./countries-data.js?v=worldwide-22";

const localizedCopy = {
  en: {
    back: "Back to country overview",
    flag: "flag",
    viewWebsite: "View local website",
    visitWebsite: "Visit Website",
    rows: {
      locationTitle: "Location",
      address: "Address",
      website: "Website",
      email: "Email",
      phone: "Phone",
    },
  },
  ru: {
    back: "Назад к обзору стран",
    flag: "флаг",
    viewWebsite: "Перейти на локальный сайт",
    visitWebsite: "Открыть сайт",
    rows: {
      locationTitle: "Локация",
      address: "Адрес",
      website: "Сайт",
      email: "Email",
      phone: "Телефон",
    },
  },
  kz: {
    back: "Елдер шолуына оралу",
    flag: "туы",
    viewWebsite: "Жергілікті сайтқа өту",
    visitWebsite: "Сайтты ашу",
    rows: {
      locationTitle: "Орналасуы",
      address: "Мекенжай",
      website: "Сайт",
      email: "Email",
      phone: "Телефон",
    },
  },
};

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function createLink(href, text, className) {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = text;
  if (className) link.className = className;
  if (href.startsWith("http")) {
    link.target = "_blank";
    link.rel = "noopener";
  }
  return link;
}

function phoneHref(phone) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : "";
}

function resolveCardLanguage(lang) {
  if (localizedCopy[lang]) return lang;
  return lang === "kg" ? "ru" : "en";
}

export class CountryInfoCard {
  constructor(root) {
    this.root = root;
    this.lang = resolveCardLanguage(document.documentElement.lang || "en");
  }

  setLanguage(lang) {
    this.lang = resolveCardLanguage(lang);
  }

  render(country) {
    if (!this.root || !country) return;

    this.root.classList.remove("is-updating");
    void this.root.offsetWidth;
    this.root.classList.add("is-updating");
    this.root.replaceChildren(this.buildCard(country));
  }

  buildCard(country) {
    const fragment = document.createDocumentFragment();

    const copy = localizedCopy[this.lang] || localizedCopy.en;
    const countryName = getCountryName(country, this.lang);
    const countryRegion = getCountryRegion(country, this.lang);

    const header = document.createElement("div");
    header.className = "country-info-card__header";

    const flag = document.createElement("img");
    flag.className = "country-info-card__flag";
    flag.src = country.flag;
    flag.alt = `${countryName} ${copy.flag}`;
    flag.loading = "lazy";
    header.appendChild(flag);

    const titleGroup = document.createElement("div");
    titleGroup.appendChild(createTextElement("span", "country-info-card__region", countryRegion));
    titleGroup.appendChild(createTextElement("h3", "", countryName));
    header.appendChild(titleGroup);
    fragment.appendChild(header);

    const rows = document.createElement("dl");
    rows.className = "country-info-card__rows";
    this.appendRows(rows, country);
    fragment.appendChild(rows);

    if (country.website) {
      fragment.appendChild(createLink(country.website, copy.viewWebsite, "country-info-card__cta"));
    }

    return fragment;
  }

  appendRows(container, country) {
    ["address", "email", "phone"].forEach((field) => {
      const value = country[field];
      if (!value) return;

      const wrapper = document.createElement("div");
      wrapper.className = "country-info-card__row";
      const copy = localizedCopy[this.lang] || localizedCopy.en;
      wrapper.appendChild(createTextElement("dt", "", copy.rows[field]));

      const dd = document.createElement("dd");
      if (field === "website") {
        const websiteLabel = this.lang === "en" && country.websiteLabel ? country.websiteLabel : copy.visitWebsite;
        dd.appendChild(createLink(value, websiteLabel));
      } else if (field === "email") {
        dd.appendChild(createLink(`mailto:${value}`, value));
      } else if (field === "phone") {
        const href = phoneHref(value);
        dd.appendChild(href ? createLink(href, value) : document.createTextNode(value));
      } else {
        dd.textContent = value;
      }

      wrapper.appendChild(dd);
      container.appendChild(wrapper);
    });
  }
}
