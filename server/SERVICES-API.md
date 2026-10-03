# Services API

Backend for the website's service pages. Same structure as the other modules
(`app/api/service`, `app/db/models/service*.model.js`,
`app/validation-schema/service-schema.js`, migration + seeder).

## Tables

`services` — one row per service (language-neutral)

| column | notes |
|---|---|
| `code` | stable identity, e.g. `D077`; used for relationships |
| `slug` | public URL part; set once, only changes when an editor changes it |
| `type` | `service` · `service-family` · `additional-service` · `service-index` |
| `family_code` | parent family code, e.g. `S02` |
| `icon`, `pictures` | icon name from `/assets/icons`, uploaded image paths |
| `related_codes` | explicitly related page codes, in order |
| `legacy_urls` | earlier public URLs (for redirects) |
| `sort_order`, `is_active` | ordering and publishing |

`service_translations` — one row per service **and** language (unique `service_id + locale`)

`title`, `h1`, `eyebrow`, `short_description`, `intro_html`, `sections` (JSONB),
`source_urls`, `status`, `review_label`, `meta_title`, `meta_description`,
`meta_keywords`, `og_image`.

`sections`: `[{ key, title, nav_label?, role, html?, intro_html?, items?: [{ key?, title, html }], outro_html? }]`
with `role` ∈ `content | features | benefits | process | faq | service_cards | hero_benefit | cta`.

## Endpoints (prefix `/v1`)

Public:

| method | path | |
|---|---|---|
| GET | `/services?locale=hi&type=service.service-family&family=S02&q=fire&page=&limit=` | list in a language (falls back to `en` per item; `has_locale`, `available_locales`) |
| GET | `/services/get-by-slug/:slug?locale=hi` | one service with sections, `family`, `related`, `is_fallback`, `available_locales` |
| GET | `/services/get-by-code/:code?locale=` | e.g. `S00`, the services index page |

Admin (JWT, same as other modules):

| method | path | |
|---|---|---|
| POST | `/services` | create; body = service fields + `translations[]` (an `en` translation is required); slug generated from the English title if not given |
| PUT | `/services/:id` | update only the fields sent; `translations[]` are merged per locale (a new locale needs a `title`) |
| GET | `/services/:id` | service + all translations (edit form); `GET /services?include_inactive=true` lists hidden ones |
| DELETE | `/services/:id/translations/:locale` | remove one language (not `en`) |
| DELETE | `/services/:id` | delete (translations cascade) |

After each write the API calls `WEBSITE_REVALIDATE_URL` (optional) with header
`x-revalidate-secret: WEBSITE_REVALIDATE_SECRET` so the website refreshes.

## Setup

```sh
npm run migrate:up   # 20260928100001-create-services
npm run seed         # seeders/20260928100001-rapid-services (39 pages, 45 translations)
```

`seeders/data/rapid-services.json` was generated from the handoff manuscripts by
`node scripts/import-rapid-services.js <path>/website/frontend`. Run it again
only to re-import from the manuscripts; after launch the admin panel is the
source of truth.
