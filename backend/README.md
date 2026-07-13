# STADA Country Content Backend

Small Node backend that returns country-aware page content for the STADA website.

The configured sites are Kazakhstan, Kyrgyzstan, Georgia, Azerbaijan, Armenia, Moldova, and Uzbekistan. Future country sites can be added in `data/site-config.json` by adding country metadata and, for editable pages, entries in `data/content-source.json`.

## Run

```bash
cd backend
npm start
```

By default the API listens on port `10000` on all interfaces. Override with `PORT=4000 npm start`.

This service is API-only. It does not host the admin UI. Run the separate `adminStada` frontend locally (or deploy it separately) and point it at this backend API.

The admin frontend edits dynamic homepage text and images for the selected country and language, then stores overrides through this backend.

Configure admin credentials before starting the backend:

```text
ADMIN_LOGIN=your_admin_login
ADMIN_PASSWORD=use_a_long_random_password
```

Country-limited admin accounts can be configured with `ADMIN_KZ_LOGIN`, `ADMIN_KG_LOGIN`, `ADMIN_GE_LOGIN`, `ADMIN_AZ_LOGIN`, `ADMIN_AM_LOGIN`, `ADMIN_MD_LOGIN`, `ADMIN_UZ_LOGIN` and the matching `*_PASSWORD` variables. A country account is enabled only when both its login and its country-specific password are set; country accounts do not inherit `ADMIN_PASSWORD`.

The backend will not accept admin logins until both variables are set. For production, also set:

```text
NODE_ENV=production
CORS_ORIGINS=https://your-public-site.example
ADMIN_CORS_ORIGINS=https://your-admin-site.example
ADMIN_LOGIN_MAX_ATTEMPTS=8
ADMIN_LOGIN_WINDOW_MS=900000
ADMIN_SESSION_TTL_MS=28800000
ADMIN_COOKIE_SAME_SITE=Strict
ALLOW_LOCAL_ADMIN_ORIGINS=false
```

`CORS_ORIGINS` is the public read list. `ADMIN_CORS_ORIGINS` is a separate, stricter list containing only exact deployed admin UI origins. The official `https://admin.stada.kz` origin is trusted explicitly by the backend; use `ADMIN_CORS_ORIGINS` for any additional admin domains. Public STADA site origins never grant browser access to `/api/admin/*` responses.

Local admin development origins such as `http://localhost:5500` and `http://127.0.0.1:5500` are allowed automatically only when the backend is not running in production mode. If a local admin UI must connect directly to the deployed backend, set `ALLOW_LOCAL_ADMIN_ORIGINS=true` temporarily and remove it when that work is complete. Do not put `ADMIN_LOGIN` or `ADMIN_PASSWORD` into frontend JavaScript; type them into the admin login form.

Admin login uses a `Secure`, `HttpOnly` cookie and a CSRF token instead of a browser-stored bearer token. On Render, the default cookie mode is `SameSite=None` so a separately hosted or local admin can call the HTTPS backend. If the admin and API are deployed on the same site, `ADMIN_COOKIE_SAME_SITE=Lax` or `Strict` can be used. Production cookies cannot be made insecure.

## Database TLS

Remote PostgreSQL connections verify the database certificate and hostname by default. Localhost connections disable TLS by default. The recommended production configuration is:

```text
DATABASE_URL=postgresql://app_user:password@db.example.com:5432/stada_content
DATABASE_SSL_MODE=verify-full
```

When the database provider uses a private certificate authority, also set `DATABASE_CA_CERT` to the PEM certificate supplied by the provider. Hosting dashboards generally support multiline secret values; a value containing literal `\n` separators is also accepted.

Supported `DATABASE_SSL_MODE` values are:

- `verify-full`: encrypt and verify the certificate and hostname; this is the remote default.
- `verify-ca`: encrypt and verify that the certificate is signed by a trusted CA, without hostname verification.
- `require`: encrypt without certificate verification. Use only as a temporary provider-compatibility mode.
- `disable`: disable TLS, intended for local development only.

The legacy `DATABASE_SSL=false` setting still disables TLS. `DATABASE_SSL_REJECT_UNAUTHORIZED=false` maps to the explicit `require` compatibility mode. Never commit `DATABASE_URL` or a private CA certificate.

Do not include `sslmode`, `sslcert`, `sslkey`, or `sslrootcert` parameters in `DATABASE_URL`. `node-postgres` allows those parameters to replace programmatic TLS settings, so the backend rejects conflicting URLs and requires TLS configuration through the variables above.

## Request Hardening

JSON endpoints require `Content-Type: application/json` and a JSON object body. Ordinary JSON requests default to 1 MiB, login requests to 16 KiB, and image-upload requests to 12 MiB. Override the limits only when necessary:

```text
MAX_LOGIN_BODY_BYTES=16384
MAX_JSON_BODY_BYTES=1048576
MAX_IMAGE_UPLOAD_BODY_BYTES=12582912
SERVER_REQUEST_TIMEOUT_MS=30000
SERVER_HEADERS_TIMEOUT_MS=15000
SERVER_KEEP_ALIVE_TIMEOUT_MS=5000
SERVER_MAX_REQUESTS_PER_SOCKET=100
```

Unexpected server errors are logged with a request ID. API clients receive only a generic HTTP 500 message and the same request ID, preventing database, Cloudinary, and internal file details from leaking in responses.

Migration `007_admin_security.sql` stores hashed session identifiers and hashed login-attempt keys in PostgreSQL. Raw cookie tokens and admin passwords are never written to the database. Sessions, revocation, and login throttling therefore survive backend redeployments. `POST /api/admin/logout` revokes the server-side session rather than only clearing browser state.

## Cloudinary Uploads

The admin image upload flow sends files to the backend, and the backend uploads them to Cloudinary. Configure these environment variables on Render:

```text
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=stada/hero
MAX_IMAGE_UPLOAD_BODY_BYTES=12582912
```

Keep `CLOUDINARY_API_SECRET` backend-only. Do not expose it in frontend JavaScript.

Admin homepage image uploads use a stable Cloudinary public ID based on country, page, and backend image ID, for example `stada/hero/kazakhstan/index/index_image_003`. Re-uploading that image slot overwrites the same Cloudinary asset instead of creating a timestamped asset name. The backend asks Cloudinary to invalidate the old CDN copy and saves the same stable delivery URL for that slot, so redeploying falls back to the latest image in Cloudinary instead of an older local/default image.

Product image uploads use the product country as part of the stable Cloudinary path, for example `stada/products/kazakhstan/coldrex/card` or `stada/products/kyrgyzstan/coldrex/card`. The product image sync script defaults to Kazakhstan; set `PRODUCT_IMAGE_SYNC_COUNTRY=kyrgyzstan` or another configured country ID when syncing a different market.

## Content Source

The backend-owned content source lives in `backend/data/content-source.json`. It defines the default page text, image slots, admin sections, and structured product-page fallback content. Admin changes are stored in PostgreSQL's `content_overrides` table. On first startup after migration `006_content_overrides.sql`, any existing values in `backend/data/content-overrides.json` are imported without overwriting database rows; the JSON file remains a one-time legacy import source only.

`GET /health` reports `contentOverrides.provider: "postgresql"` after storage initialization and `adminSecurity.sessionProvider: "postgresql"` for Phase 2 authentication. Use those values to verify the deployed service is using persistent database storage.

Country-specific replacement profiles, page-title overrides, and market-specific copy live in `backend/data/country-content-profiles.json`.

Product catalog defaults live in `backend/data/product-catalog.json`, and worldwide country metadata lives in `backend/data/worldwide-countries.json`. The backend no longer carries a copied frontend snapshot folder.

Database-backed products are country-native: the stable identity is `(country_id, id)`, so different markets can use the same clean product ID such as `coldrex` without storing country prefixes in `products.id`. Legacy prefixed lookups such as `kyrgyzstan-coldrex` are still accepted at the API edge for existing URLs or saved selections.

Public catalogue and direct-product endpoints return only products whose status is `published`. Authenticated admin endpoints continue to return drafts, published products, and archived products for management.

The public frontend and admin read configured site countries from backend endpoints (`/api/countries` and `/api/admin/countries`) instead of keeping separate country registries. The Worldwide page's static country module is generated from `backend/data/worldwide-countries.json`; after changing that JSON, run:

```bash
npm run frontend:generate-worldwide-countries
```

The Kazakhstan product import flow (`npm run db:import-products` or `/api/admin/products/import-from-site`) reads card-level defaults from `backend/data/product-catalog.json`, derives stable product slugs from the catalog image paths, and enriches each product from matching detail pages in `backend/data/content-source.json`.

## Endpoints

```http
GET /health
GET /api/countries
GET /api/homepage?country=kazakhstan&lang=ru
GET /api/homepage/kz?lang=kz
GET /api/homepage/kg?lang=kg
GET /api/homepage/az?lang=az
GET /api/homepage/md?lang=ro
GET /api/homepage/uz?lang=uz
GET /api/page?country=kyrgyzstan&lang=kg&page=products/coldrex.html
GET /api/page/kg?lang=kg&page=culture.html
POST /api/homepage
POST /api/page
GET /admin
POST /api/admin/login
GET /api/admin/session
POST /api/admin/logout
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
- `content.staticTexts`: reserved for legacy static text extraction.
- `content.photos`: all image paths from the page, with resolved URLs.
- `content.sections`: the same text and photos grouped by page section.

`/api/page` reads page defaults from `data/content-source.json`. Parent-directory paths and non-HTML files are rejected. The frontend hydrates both keyed translations and backend-id DOM text/image items from this endpoint.

Configured language pairs:

- Kazakhstan: `ru`, `kz`
- Kyrgyzstan: `ru`, `kg`
- Georgia: `ge`, `en`
- Azerbaijan: `az`, `ru`
- Moldova: `ro`, `ru`
- Uzbekistan: `ru`, `uz`

## Add Another Country Site

Add another entry under `countries` in `data/site-config.json`, then add editable page defaults to `data/content-source.json`:

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
    "assetsBaseUrl": "https://stada.uz/"
  }
}
```
