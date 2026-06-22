# STADA Country Content Backend

Small Node backend that returns country-aware page content for the STADA website.

The first configured sites are Kazakhstan and Kyrgyzstan. Future country sites can be added in `data/site-config.json` by pointing a country entry at that site's `index.html`, translation script, and asset base URL.

## Run

```bash
cd backend
npm start
```

By default the API listens on `http://127.0.0.1:3001`. Override with `PORT=4000 npm start`.

Open the admin panel at `http://127.0.0.1:3001/admin` after the backend is running. The panel edits dynamic homepage text and images for the selected country and language, then stores overrides in `backend/data/content-overrides.json`.

Default admin credentials:

```text
login: andrewyemtsev
password: StadaAdmin67
```

For deployment, override them with `ADMIN_LOGIN` and `ADMIN_PASSWORD`.

## Cloudinary Uploads

The admin image upload flow sends files to the backend, and the backend uploads them to Cloudinary. Configure these environment variables on Render:

```text
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=stada/hero
MAX_JSON_BODY_BYTES=8388608
```

Keep `CLOUDINARY_API_SECRET` backend-only. Do not expose it in frontend JavaScript.

Admin hero image uploads use a stable Cloudinary public ID based on country, page, and backend image ID, for example `stada/hero/kazakhstan/index/index_image_003`. Re-uploading that hero slot overwrites the same Cloudinary asset instead of creating a timestamped asset name. The backend still saves Cloudinary's returned `secure_url`, which may include a new `/v.../` version so browsers and the CDN fetch the fresh image immediately.

## Content Source

The backend reads page HTML and translation keys from `backend/content/main`, so it can be deployed by itself without filesystem access to the root `main` frontend folder.

When frontend pages or `main/js/script.js` change, refresh the backend snapshot locally before deploying:

```bash
cd backend
npm run sync-content
```

Commit the updated files in `backend/content/main` with the backend.

## Endpoints

```http
GET /health
GET /api/countries
GET /api/homepage?country=kazakhstan&lang=ru
GET /api/homepage/kz?lang=kz
GET /api/homepage/kg?lang=kg
GET /api/page?country=kyrgyzstan&lang=kg&page=products/coldrex.html
GET /api/page/kg?lang=kg&page=culture.html
POST /api/homepage
POST /api/page
GET /admin
POST /api/admin/login
GET /api/admin/content?country=kazakhstan&lang=ru
POST /api/admin/upload-image
POST /api/admin/content
```

POST body:

```json
{
  "country": "kazakhstan",
  "lang": "ru"
}
```

Generic page POST body:

```json
{
  "country": "kyrgyzstan",
  "lang": "kg",
  "page": "products/coldrex.html"
}
```

The page response includes:

- `country`: configured country/site details plus matching worldwide office data when available.
- `language`: resolved language for the response.
- `content.text`: all translated `data-i18n-key` values used by the page.
- `content.dom.text`: unkeyed text nodes marked with `data-backend-text-id`.
- `content.dom.images`: image nodes marked with `data-backend-image-id`.
- `content.staticTexts`: visible static text discovered in the HTML.
- `content.photos`: all image paths from the page, with resolved URLs.
- `content.sections`: the same text and photos grouped by page section.

`/api/page` accepts any `.html` page under the configured site root, including product pages. Parent-directory paths and non-HTML files are rejected. The frontend hydrates both keyed translations and backend-id DOM text/image items from this endpoint.

Configured language pairs:

- Kazakhstan: `ru`, `kz`
- Kyrgyzstan: `ru`, `kg`

## Add Another Country Site

Add another entry under `countries` in `data/site-config.json`:

```json
{
  "id": "uzbekistan",
  "name": "Uzbekistan",
  "siteName": "STADA Uzbekistan",
  "domain": "stada.uz",
  "siteUrl": "https://stada.uz/",
  "aliases": ["uz", "uzbekistan", "stada.uz"],
  "defaultLanguage": "ru",
  "supportedLanguages": ["ru", "uz"],
  "homepage": {
    "htmlPath": "../sites/uzbekistan/index.html",
    "translationScriptPath": "../sites/uzbekistan/js/script.js",
    "countriesDataPath": "../sites/uzbekistan/js/worldwide/countries-data.js",
    "assetsBaseUrl": "https://stada.uz/"
  }
}
```
