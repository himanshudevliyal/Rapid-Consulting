# Changes for Rapid Consulting (from the Natraj server)

Everything else is the same as the Natraj server.

## Added — enquiries, articles, case studies, advisers, jobs, industries, schemes (2026-10-03)

### Migrations (`migrations/`)
- `20261003100001-create-enquiries.js` — enquiries table (UUID pk, name, phone, email, location, requirement, subject, page_title, page_id, source, status ENUM, notes)
- `20261003100002-create-articles.js` — articles table (slug unique, tags ARRAY, is_published, published_at)
- `20261003100003-create-case-studies.js` — case_studies table (client_name, industry, challenge, solution, result)
- `20261003100004-create-advisers.js` — advisers table (designation, bio, photo, linkedin_url, display_order, is_active)
- `20261003100005-create-jobs.js` — jobs table (job_type ENUM, experience, responsibilities, requirements, closing_date, is_active)
- `20261003100006-create-industries.js` — industries table (icon, display_order, is_active)
- `20261003100007-create-schemes.js` — schemes table (ministry, eligibility, benefits, application_process, official_url, tags ARRAY)

### Models (`app/db/models/`)
- `enquiry.model.js` — `createRecord`, `getAll` (status/source/q/date filters + pagination), `getById`, `updateById`, `deleteById`
- `article.model.js` — auto-slug via slugify, `create`, `getAll` (published_only), `getBySlug`, `getById`, `updateById`, `deleteById`
- `case-study.model.js` — same pattern as article
- `adviser.model.js` — `getAll` (active_only, ordered by display_order)
- `job.model.js` — includes job_type ENUM, active_only filter
- `industry.model.js` — similar to adviser
- `scheme.model.js` — published_only filter

### API modules (`app/api/`)
Each module has `controller.js` + `routes.js`:
- `enquiry/` — public `POST /` (create + fire-and-forget emails); admin list/get/patch (status, notes)/delete
- `article/` — admin CRUD; public GET (published only) + `GET /by-slug/:slug`
- `case-study/` — same pattern as article
- `adviser/` — admin CRUD; public GET (active only)
- `job/` — admin CRUD; public GET (active) + `GET /by-slug/:slug`
- `industry/` — admin CRUD; public GET (active)
- `scheme/` — admin CRUD; public GET (published) + `GET /by-slug/:slug`

### Mailer rewrite (`app/services/mailer.js`)
- Removed all hardcoded Infrakeys/vishal.gautam addresses
- Lazy Brevo SMTP transporter via `config.smtp_host / smtp_user / smtp_password`
- New exports: `sendEnquiryEmail` (admin notification), `sendEnquiryConfirmation` (user auto-reply)
- All send functions use `EMAIL_FROM` env var (default: `Rapid Consulting <info@rapidconsulting.in>`)
- `sendResetPasswordEmail` and `sendResetUsernameEmail` updated to RC branding

### Email templates (`app/views/emails/`)
- `enquiry-notification.ejs` — admin email with enquiry details table + "View in Dashboard" CTA
- `enquiry-confirmation.ejs` — user auto-reply with RC branding

### Updated files
- `app/db/models.js` — registered all 7 new models (EnquiryModel … SchemeModel)
- `app/routes/v1/index.js` — registered 7 new admin routes under JWT guard
- `app/routes/v1/public.js` — registered 7 new public routes
- `app/utils/get-template-data.js` — registered `forgot-password`, `forgot-username`, `enquiry-notification`, `enquiry-confirmation` templates
- `app/config/index.js` — added Brevo SMTP keys, `email_from`, `email_enquiry_to`, `admin_url`
- `.env.example` — created with placeholder values for all env vars

### New API endpoints summary
| Prefix | Public | Admin (JWT) |
|--------|--------|-------------|
| `/v1/public/enquiries` | `POST /` | — |
| `/v1/enquiries` | — | `GET / GET /:id PATCH /:id DELETE /:id` |
| `/v1/public/articles` | `GET / GET /by-slug/:slug` | — |
| `/v1/articles` | — | full CRUD |
| `/v1/public/case-studies` | `GET / GET /by-slug/:slug` | — |
| `/v1/case-studies` | — | full CRUD |
| `/v1/public/advisers` | `GET /` | — |
| `/v1/advisers` | — | full CRUD |
| `/v1/public/jobs` | `GET / GET /by-slug/:slug` | — |
| `/v1/jobs` | — | full CRUD |
| `/v1/public/industries` | `GET /` | — |
| `/v1/industries` | — | full CRUD |
| `/v1/public/schemes` | `GET / GET /by-slug/:slug` | — |
| `/v1/schemes` | — | full CRUD |

---

## Added — services (website service pages)
- `app/api/service/` (controller, routes) — public + admin endpoints, see `SERVICES-API.md`
- `app/db/models/service.model.js`, `app/db/models/service-translation.model.js`
- `app/validation-schema/service-schema.js`
- `migrations/20260928100001-create-services.js`
- `seeders/20260928100001-rapid-services.js` + `seeders/data/rapid-services.json` (39 service pages, EN + HI)
- `scripts/import-rapid-services.js` (regenerates the seed data from the manuscripts)
- Registered in `app/db/models.js`, `app/routes/v1/index.js`, `app/routes/v1/public.js`
- `app/lib/constants/index.js`: `SERVICE_TABLE`, `SERVICE_TRANSLATION_TABLE`, `locales`, `defaultLocale`
- `app/config/index.js`: `WEBSITE_REVALIDATE_URL`, `WEBSITE_REVALIDATE_SECRET`

## Changed
- `app/config/index.js`: reads `PG_DATABASE_NAME` (your .env) and falls back to
  `PG_DATABASE`; `PG_HOST` defaults to `localhost`.

## Removed — product
- `app/api/product/`, `app/db/models/product.model.js`, `app/validation-schema/product-schema.js`
- Product routes removed from `app/routes/v1/index.js` and `public.js`; `ProductModel` removed from `app/db/models.js`.
- Product migrations are **kept**: the `products` table is still created because
  cart, inventory and order-item have foreign keys to it, and the migration
  history must stay the same on existing databases.
- Modules that used `table.ProductModel` will fail if called:
  `POST /v1/orders`, `POST /v1/product-inquiries`, `GET /v1/reports` (product by category).
  Cart, inventory and order listings still work but have no products to show.

## Where the models are
- User: `app/db/models/user.model.js`, API `app/api/users/`, schema `app/validation-schema/user.schema.js`
- Blog: `app/db/models/blog.model.js`, API `app/api/blog/`, schema `app/validation-schema/blog-schema.js`
- Query: `app/db/models/query.model.js`, API `app/api/query/`, schema `app/validation-schema/user-query-schema.js`

## Run
```sh
npm install
npm run migrate:up
npm run seed
npm run dev        # http://localhost:8001/v1
```
