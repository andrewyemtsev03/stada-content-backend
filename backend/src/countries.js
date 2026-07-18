const { listCountries } = require("./content-loader");

function normalizeCountrySlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[_.\s]+/g, "-")
    .replace(/\/+$/, "");
}

function allCountryIds() {
  return listCountries().map(country => country.id);
}

function findCountryByInput(countryInput) {
  const requested = normalizeCountrySlug(countryInput);
  if (!requested) return null;

  return listCountries().find(country => {
    const matchValues = [
      country.id,
      country.name,
      country.siteName,
      country.domain,
      ...(country.aliases || []),
    ].map(normalizeCountrySlug);
    return matchValues.includes(requested);
  }) || null;
}

module.exports = {
  allCountryIds,
  findCountryByInput,
  normalizeCountrySlug,
};
