const fs = require("node:fs");
const path = require("node:path");

const backendRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(backendRoot, "..", "..");
const siteConfigPath = path.join(backendRoot, "data", "site-config.json");
const worldwideCountriesPath = path.join(backendRoot, "data", "worldwide-countries.json");
const defaultOutputPath = path.join(
  workspaceRoot,
  "ProjectS",
  "Stada.kz",
  "main",
  "js",
  "worldwide",
  "countries-data.js"
);
const outputPath = path.resolve(process.env.FRONTEND_WORLDWIDE_COUNTRIES_PATH || defaultOutputPath);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertCountry(country, index) {
  const label = country?.id || `entry ${index + 1}`;
  if (!country || typeof country !== "object" || Array.isArray(country)) {
    throw new Error(`Worldwide country ${label} must be an object.`);
  }
  if (!country.id) throw new Error(`Worldwide country ${label} is missing id.`);
  if (!Number.isFinite(Number(country.lat)) || !Number.isFinite(Number(country.lng))) {
    throw new Error(`Worldwide country ${label} must include numeric lat and lng.`);
  }
}

function makeModule({ defaultCountryId, countries }) {
  const countryJson = JSON.stringify(countries, null, 2)
    .split("\n")
    .map((line, index) => index === 0 ? line : `  ${line}`)
    .join("\n");
  return `// Generated from backend/data/worldwide-countries.json. Do not edit by hand.
export const defaultCountryId = ${JSON.stringify(defaultCountryId)};

export const countriesData = ${countryJson};

export function getCountryName(country, lang = "en") {
  return country?.labels?.[lang]?.name || country?.labels?.en?.name || country?.name || "";
}

export function getCountryRegion(country, lang = "en") {
  return country?.labels?.[lang]?.region || country?.labels?.en?.region || country?.region || "";
}

export function getCountrySearchValues(country) {
  const localizedValues = Object.values(country.labels || {}).flatMap((label) => [label.name, label.region]);
  return [country.name, country.region, country.locationTitle, country.address, ...localizedValues].filter(Boolean);
}
`;
}

function main() {
  const siteConfig = readJson(siteConfigPath);
  const worldwideCountries = readJson(worldwideCountriesPath);
  const countries = Array.isArray(worldwideCountries.countries) ? worldwideCountries.countries : [];
  countries.forEach(assertCountry);

  if (!countries.length) {
    throw new Error("backend/data/worldwide-countries.json must include at least one country.");
  }

  const defaultCountryId = siteConfig.defaultCountry || countries[0].id;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, makeModule({ defaultCountryId, countries }), "utf8");
  console.log(`Generated ${path.relative(workspaceRoot, outputPath)} from ${path.relative(backendRoot, worldwideCountriesPath)}.`);
}

main();
