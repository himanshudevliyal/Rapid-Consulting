# Rapid Consulting website (Next.js + JSX + shadcn/ui)

Every service page on the website is rendered by **one** reusable template from
data served by the Fastify API (`server/app/api/service`). Adding a service in
the admin panel publishes it at `/{locale}/services/{slug}` — no new JSX file.

```
Postgres (services + service_translations)
  → Fastify  GET /v1/services, /v1/services/get-by-slug/:slug?locale=
  → Next.js  src/app/[locale]/services/[slug]/page.js
  → i18n     messages/en.json, messages/hi.json (+ translated content from the API)
  → ServicePage → ServiceHero, ServiceSection (by role), ServiceRelated, contact rail
```

## Run it

```sh
# 1. API (in /server)
npm run migrate:up        # creates services + service_translations
npm run seed              # imports the Rapid service pages (EN + HI)
npm run dev               # http://localhost:8001/v1

# 2. Website (this folder)
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8001/v1
npm install
npm run dev                  # http://localhost:3000
```

`npm run build` pre-renders every page in every language it exists in. If the
API is unreachable at build time the service pages render on first request instead.

## Folder structure (same layout as the Duraplast project)

```
messages/                       en.json, hi.json - every UI string
src/proxy.js                    next-intl middleware: / and /services/... -> /{locale}/...
src/i18n/routing.js             languages (en, hi), cookie, locale helpers - add a language here
src/i18n/request.js             loads messages; missing Hindi keys fall back to English
src/i18n/navigation.js          locale-aware Link / redirect / useRouter (next-intl)
src/i18n/has-translation.js     has(key): real translation vs English fallback
src/config/index.js             every env variable in one place
src/utils/http.js               axios client (fetch adapter, passes Next cache options)
src/utils/endpoints.js          API paths
src/utils/file-url.js           URLs for files saved by the API
src/services/service-service.js fetchServices, fetchServiceBySlug, fetchServiceByCode (+ SERVICES_TAG)
src/hooks/use-services.js       react-query hooks for client components
src/providers/                  QueryProvider (react-query)
src/lib/                        seo, site URLs, search, content (service links/cards), page-routes,
                                handle-error-toast
src/lib/pages/                  content-page repository (pages.json), card copy, FAQ parser, industries…
src/lib/data/                   pages.json, page-routes.json, industry-catalogue.json
src/home/                       home page sections
src/components/ui/              shadcn/ui (JSX)
src/components/layout/          site-header, site-footer, language-switcher, search-dialog, …
src/components/common/          Html, Icon, ContentCard, ContextActions, ShareActions, ClientTicker, …
src/components/contact/         callback form, chat preview, WhatsApp button
src/components/pages/           content-page templates (page-view, directory, team, adviser, FAQ…)
src/app/[locale]/layout.js      html lang, NextIntlClientProvider, QueryProvider, Toaster, header, footer
src/app/[locale]/page.js        home
src/app/[locale]/[...slug]/     every other content page by slug
src/app/[locale]/p/[id]/        /en/p/D060 -> 308 -> slug URL
src/app/[locale]/services/      /services, /services/[slug] and their _components/
                                (ServicePage, ServiceHero, ServiceSection, ServiceFAQ, …)
src/app/api/revalidate/route.js called by the API after admin edits
src/app/sitemap.js, robots.js   gated by NEXT_PUBLIC_ALLOW_INDEXING
src/styles/ + app/globals.css   the prototype's CSS plus brand theme tokens
```

### Translations

Server components: `const t = await getTranslations({ locale })`.
Client components: `const t = useTranslations(); const locale = useLocale();`.
`hasTranslation(t)(key)` tells a real Hindi message from the English fallback
(used to mark links "(English)"). Messages use ICU syntax: `{count}` for values.

### Calling the API

```js
// server component (cached, refreshed by /api/revalidate)
const services = await fetchServices(locale);
// client component
const { data, isLoading } = useServices({ type: "service" });
```

## How a service page is built

A service has language-neutral fields (`code`, `slug`, `type`, `family_code`,
`icon`, `related_codes`, …) and one translation per language (`title`, `h1`,
`eyebrow`, `short_description`, `intro_html`, `sections`, SEO fields, `status`,
`review_label`). Each section has a **role** that chooses its component:

| role | component | data |
|---|---|---|
| `content` | ServiceOverview | `html` |
| `features` | ServiceFeatures | `intro_html`, `items[{title, html}]`, `outro_html` |
| `benefits` | ServiceBenefits (icon cards) | same |
| `process` | ServiceProcess (steps) | same |
| `faq` | ServiceFAQ (shadcn Accordion) + FAQPage JSON-LD | same, items are Q&A |
| `service_cards` | ServiceCards (family pages) | `html`; paragraphs linking one service become its card |
| `hero_benefit` | shown in the hero instead of the intro | `html` |
| `cta` | ServiceCTA (text + WhatsApp + callback link) | `html` |

Unknown roles fall back to rich text, so content is never dropped.

**Links inside content** use the manuscripts' identity convention
(`<a href="/en/p/D066">`). The website turns them into slug URLs when rendering
(`/{locale}/services/{slug}` for services, `src/lib/data/page-routes.json` for all
other pages). Relationships therefore use stable codes, never slugs.

## Languages

- URLs carry the language: `/en/services/zed-certification`, `/hi/services/...`.
- UI text comes from `messages/*.json`; content comes translated from the API.
- The header language menu (shadcn DropdownMenu) lists only real versions. If a
  service has no Hindi version, choosing Hindi opens the English page with the
  bilingual notice (`?language=hi-unavailable`), as in the prototype. The choice
  is saved in the `NEXT_LOCALE` cookie and used for paths without a locale.
- Links from a Hindi page to an English-only service go to the English page and
  are marked “(English)” / “· English”.
- Add a language: add it to `src/i18n/routing.js` and `messages/`, and to
  `constants.locales` in the server; then add translations in the admin panel.

## SEO

Per page and language: title/description from `meta_title`/`meta_description`,
canonical, hreflang only for versions that exist (+ `x-default`), Open Graph
(`og_image` or the logo), and JSON-LD (Service, BreadcrumbList, FAQPage from the
page's own FAQ). **Indexing is off** (`noindex`, robots disallow, empty sitemap)
until `NEXT_PUBLIC_ALLOW_INDEXING=true` — keep it off until the production URL map
in `handoff/URL-MIGRATION.md` is approved.

## Admin changes appear immediately

Pages are cached for `SERVICES_REVALIDATE_SECONDS` (default 300). Set
`WEBSITE_REVALIDATE_URL=https://<site>/api/revalidate` and the same secret in
`WEBSITE_REVALIDATE_SECRET` (server) / `REVALIDATE_SECRET` (website) to refresh
pages the moment a service is saved.

## What was kept from the prototype

Header (ticker, mega menus, search, WhatsApp, language link, mobile menu),
footer, breadcrumbs, hero (share, actions, video placeholder, review note),
client ticker, “On this page” navigation, numbered sections, benefit cards,
process steps, FAQ “+” disclosures, service cards, related services, callback
rail/modal, chat preview, all CSS classes, fonts, icons and responsive rules.
Screens were compared with the prototype at desktop and mobile widths.

## Still to decide (from the handoff, not invented here)

- **Final URLs.** Slugs are the current rapidconsulting.in paths (e.g.
  `zed-certification`, `roi-deduction`) to preserve search traffic; change any
  slug in the admin panel once the URL map is approved.
- **Enquiry delivery.** The callback form and chat remain demos (nothing is
  sent), because the CRM contract isn't agreed. The existing `contact-inquiry`
  API requires an email the callback form doesn't collect.
- The admin panel needs a service form for these fields (see the server's
  `SERVICES-API.md`).

## All other pages (slug URLs)

Home, industries, schemes, articles, guides, case studies, about, contact,
team, careers, advisers and the privacy notice are rendered from the compiled
manuscripts (`src/lib/data/pages.json`) by `src/components/pages/page-view.jsx`.
Every page has a slug URL; the old `/{locale}/p/{ID}` URLs redirect
permanently (308) to it.

| page | URL |
|---|---|
| Home (H01) | `/en` |
| Services (S00) + every service | `/en/services`, `/en/services/{slug}` (API) |
| Industries (I00) / industry | `/en/industries`, `/en/industries/food-and-agro-processing` |
| Schemes (R02) / scheme | `/en/schemes`, `/en/schemes/pmegp-kvic-scheme` |
| Articles (R01) / article | `/en/articles`, `/en/articles/{slug}` |
| Guides | `/en/guides/{slug}` |
| Case studies (W00) / case | `/en/case-studies`, `/en/case-studies/{slug}` |
| Resources (R00) | `/en/resources` |
| About us / About Rapid / How we work | `/en/about`, `/en/about`, `/en/how-we-work` |
| Team profile | `/en/team/atul-goyal` |
| Contact | `/en/contact` |
| Advisers | `/en/advisers` |
| Careers / how we hire / job | `/en/careers`, `/en/careers/how-we-hire`, `/en/careers/{slug}` |
| Privacy notice | `/en/privacy-notice` |

Slugs are the current rapidconsulting.in paths where one exists, otherwise the
slugified title. The full map is `src/lib/data/page-routes.json`, generated by
`node scripts/build-page-routes.mjs` (edit that file to change a slug; the old
`/p/ID` link keeps working).



Pages without a Hindi version redirect `/hi/...` to the English page with the
bilingual notice. `/en/services?industry=I01` and `/en/schemes?industry=I01`
open the directories filtered to one industry (used by the industry pages).
