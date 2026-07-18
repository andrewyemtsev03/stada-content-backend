# Backend source structure

The backend uses dependency-free CommonJS modules with explicit imports and exports.

- `server.js` — runtime configuration, administrator-session orchestration, route handling, and HTTP server startup.
- `countries.js` — country aliases, normalization, and configured-country lookup.
- `content-loader.js` — country-aware source-content loading and page payload construction.
- `content-overrides.js` — persistent page override storage.
- `content/editable.js` — admin-editable content models, validation, and override comparison.
- `http/request.js` — CORS policy, security headers, bounded JSON parsing, and HTTP responses.
- `media/cloudinary.js` — stable Cloudinary paths, request signing, and uploads.
- `products/validation.js` — product identifiers, URL validation, normalization, and admin payload validation.
- `products/content.js` — maps database products into public page and product-detail payloads.
- `products/repository.js` — PostgreSQL product persistence.
- `products/import-from-site.js` — imports product defaults from existing site content.
- `admin/auth-repository.js` — persistent administrator sessions and login throttling.
- `admin/auth-service.js` — administrator accounts, cookies, CSRF checks, country authorization, and login orchestration.
- `db/` — connection, TLS, migrations, and SQL migration files.

Route code should coordinate these modules instead of accumulating new transformation or storage logic in `server.js`.
