Rapid Consulting - Website (web): sab content ab API se
========================================================
Is zip me sirf NEW / CHANGED files hain (cumulative). Apne web/ project me same path par copy (overwrite) karein.
Naya npm package nahi lagta. Server + dashboard zip bhi lagayein, migration + seed chalayein (server README dekho).

KYA AB API SE AA RAHA HAI (koi hardcoded copy nahi)
  Navbar        : Services (category ke hisaab se grouped), Industries (image ke saath), Work = case studies,
                  Resources = guides + schemes, announcements = latest guides/schemes     [loadNavigation]
  Home          : Services section (category tabs), Industries, Project Experience (SAARE case studies),
                  Resources (guides + 5-6 featured schemes + "View All Schemes")
  /industries, /industries/[slug]   : API (image, content, related services + schemes)
  /guides, /guides/[slug]           : API (articles with type=guide)
  /articles, /schemes, /case-studies (+ [slug]) : API
  /services                         : category filter + ?industry=<slug>; /schemes me bhi ?industry=<slug>
  /resources                        : naya page (guides + schemes blocks)
  /careers                          : "Current openings" = open jobs API se; /careers/[slug] = job page (naya) + apply form
  /about                            : "The Rapid Team" = advisers API se (group ke heading ke saath; koi na ho to section hide)
  Sitemap       : articles, guides, schemes, case studies, industries, open jobs API se
  Revalidate    : /api/revalidate  tag = services | articles | case-studies | schemes | industries | jobs | advisers

BEHAVIOUR
  - CONTENT_STATIC_FALLBACK ab nahi hai (hata diya). Jo API me nahi, wo website par nahi.
  - Content pehle dashboard/seed me hona chahiye warna lists khaali dikhengi (Empty state).
  - Hindi (hi): API content English hai -> /hi/... par article/guide/scheme/case-study/industry pages
    /en/...?language=hi-unavailable par redirect hote hain. Hindi industry pages hata diye.
  - Guides / schemes ke "Download PDF" buttons hata diye (API me PDF nahi hai).
  - Purane /en/p/J01..J03 aur /careers/<purana-slug> links naye job page par chalte hain (seed me wahi slugs hain).
  - /advisers ("For CAs, Bankers & Advisers") ek marketing page hai - uska text page copy hai, static hi hai.
    Dashboard ke "Advisers" = team ke log, wo About page par aate hain.
  - Person pages (P01..P12, "Name to be added") abhi static hain; team cards me LinkedIn link advisers data se aata hai.
  - Index pages ka hero/intro text (Resources, Industries, Work, Schemes etc.), About/Team/Careers/Contact/Privacy
    static hi hain - ye "content" nahi, page copy hai.
  - Purane /en/p/<ID> links redirect hote rehte hain (lib/page-routes + page-routes.json).
  - pages.json se article/guide/scheme/case-study/industry/job records hata diye (206 -> 84), service records halke kiye (1.3MB -> 188KB).

DELETE karein (ab use nahi hote)
  src/lib/data/industry-catalogue.json
  src/lib/pages/industry-catalogue.js
  src/lib/pages/industry-services.js
  src/components/pages/industry-services.jsx

ENV (web/.env)
  NEXT_PUBLIC_API_URL      http://.../v1
  NEXT_PUBLIC_FILE_BASE    uploaded images ka base URL (industry/case-study images ke liye zaroori)
  REVALIDATE_SECRET        server ke WEBSITE_REVALIDATE_SECRET jaisa
  CONTENT_REVALIDATE_SECONDS  optional, default 300
SERVER (.env): WEBSITE_REVALIDATE_URL = https://<website>/api/revalidate ; WEBSITE_REVALIDATE_SECRET

NOTE
  - Public API sirf PUBLISHED / active records deta hai (seed sab publish kar deta hai).
  - Sirf lint + syntax check hua hai, next build / browser test nahi - pehle staging par chalake dekho.
  - CareersPage.jsx ka DEFAULT_IMAGE undefined bug fix kar diya.


FORMS: SERVICE ENQUIRY + CONTACT US (naya, React Hook Form)
  PEHLE: npm install   (package.json me react-hook-form, zod, @hookform/resolvers jude hain)
  - components/form/ me reusable RHF fields: form-field.jsx (FormField, TextField, TextAreaField, HoneypotField, FormStatus)
    + index.js. Saare forms inhi se bante hain, UI / CSS classes wahi purani hain (rail + section).
  - Validation lib/enquiry-schemas.js (zod): name, Indian phone, email (contact me zaroori), message (contact me zaroori), max lengths.
    Messages en/hi dono me (messages/*.json -> contact.*).
  - ContactExperience (components/form/contact-experience.jsx) ab RHF + zodResolver: loading state, success / error message,
    server ke field errors input ke neeche, success par form reset. Purane saare callers (service, article, scheme...) waise hi chalte hain.
    Naye optional props: kind="contact" (Contact page: email field + POST /contact-enquiries), serviceName, source.
  - Submit par automatically jaata hai: page_title (page heading, nahi to document.title), page_url, page_id, service_name, source.
  - Service page ka form ab serviceName bhejta hai (ServicePage.js); Contact page kind="contact" (ContactPage.jsx).
  - Naya: services/enquiry-service.js submitContactEnquiry, hooks/use-enquiry.js useSubmitContactEnquiry, utils/endpoints.js contactEnquiries.
  - components/form/contact.js (ContactFormCard) kahin use nahi hota - chaho to delete kar do (maine nahi chheda).

NEW (is round): src/components/form/{form-field.jsx,index.js}, src/lib/enquiry-schemas.js
CHANGED (is round): package.json, messages/{en,hi}.json, src/components/form/contact-experience.jsx,
  src/hooks/use-enquiry.js, src/services/enquiry-service.js, src/utils/endpoints.js,
  src/app/[locale]/contact/_components/ContactPage.jsx, src/app/[locale]/services/_components/ServicePage.js

QUERIES HATAYA (naya)
  Purana unused /queries form code hata diya: hooks/use-enquiry.js (useSubmitQuery), services/enquiry-service.js (submitQuery),
  utils/endpoints.js (queries). Website ka koi form isse use nahi karta tha.
CHANGED (is round): src/hooks/use-enquiry.js, src/services/enquiry-service.js, src/utils/endpoints.js


=====================================================================
ROUND: WEBSITE DESIGN REVISION (5 Oct 2026)  - web
=====================================================================
Pura requirement-wise status: REVISION-CHECKLIST.md (pkg root).
Install: package.json me react-hook-form / @hookform/resolvers / zod hain -> `npm ci` (package-lock.json update ho chuka hai).
Delete karne wali files (ab 7):
  src/components/pages/industry-services.jsx
  src/lib/data/industry-catalogue.json
  src/lib/pages/industry-catalogue.js
  src/lib/pages/industry-services.js
  src/app/[locale]/about/__components/advantage-section.jsx
  src/app/[locale]/about/__components/team-section.jsx
  src/app/[locale]/about/__components/trusted-section.jsx
Naya: home carousel + FAQ, Subsidies & Incentives menu, enquiry drawer (components/form/enquiry-drawer.jsx), ticker controls,
  ImagePlaceholder, shared CaseCard, scheme facts panel, author/reviewer cards, /team/[slug], /subsidy-viability-report,
  /sessions + /sessions/[slug], community invitations, case evidence, ?industry= filter fix, sticky-form offsets (src/styles/w1.css, layout.js me import).
messages/en.json + hi.json me nayi keys merge ho chuki hain (alag se kuch nahi karna).
Pehli baar `npm run build` par dhyan se check karein: header 1024/1280 px, drawer, mobile sheet, hero swipe.


=====================================================================
ROUND 2 (22 Oct 2026 brief) - web
=====================================================================
Status vs brief: ROUND2-CHECKLIST.md ; demo steps: CMS-DEMO.md (pkg root).
npm ci (package-lock updated). messages/en.json + hi.json already merged. layout.js imports styles/w1.css and styles/wb.css.
New routes via the page builder: /your-project, /finance-and-insurance, /faqs (seeded in the server); any new page created in the dashboard is served by the catch-all route; drafts open at /<locale>/preview/<id>?token=...
next.config.mjs: no-store + noindex headers for the preview route.
Header: 7 primary destinations from Settings -> Navigation (falls back to built-in defaults if the API has none).


=====================================================================
FIGMA UI BATCH 1 (29 Oct 2026) - web
=====================================================================
Naya/badla: header (top strip + WhatsApp number + Hindi toggle), footer (CTA panel + 8 columns), Home (naya sequence), Your Project hub renderer (stage_section), case card (figure tile + rows).
Install: npm ci. messages/en.json + hi.json me additions merge ho chuke hain. layout.js me styles/wc2.css import ho gaya hai.
Delete karne wali files (Home ke purane, ab 5 aur):
  src/home/planning-section.jsx
  src/home/contact-section.jsx
  src/home/default-section.jsx
  src/home/industry-grid.jsx
  src/home/utils.jsx
(src/home/hero-carousel.jsx bhi ab use nahi hota; project me hai to delete kar sakte hain.)
Env vars (optional):
  NEXT_PUBLIC_CRM_LOGIN_URL   -> header me "CRM Login" link (set nahi to link chhupa rehta hai; code me koi CRM URL mila nahi)
  NEXT_PUBLIC_SOCIAL_FACEBOOK_URL / _INSTAGRAM_URL / _YOUTUBE_URL / _LINKEDIN_URL -> footer ke social icons (set nahi to icon nahi dikhta)
Header: 1280-1439px par WhatsApp number icon-only ho jata hai (jagah ki wajah se); Hindi me menu dikhne tak icon-only. Browser me 1024/1280/1366 par check zaroori.
Home ke placeholders (XX numbers, sample reviews, logo tiles) src/lib/data/home-placeholders.json me hain; page par "placeholder" note dikhta hai.


=====================================================================
FIGMA UI BATCH 2 (29 Oct 2026) - web (baaki saare pages)
=====================================================================
Install: npm ci. messages/en.json + hi.json me additions (b2a-b2e) merge ho chuke hain. layout.js me styles/b2a.css ... b2e.css import hain.
Pages: Subsidies / Approvals / Finance hubs + "Setting up" (site pages, server seeder se), service page (CLU), industry page + index, scheme page, guide/article page,
  case study page + CaseCard, scheme directory, case archive, Resources, FAQs hub, About, How we work, Contact, Team index, Expert profile, Advisers, Careers, Subsidy viability report.
Shared naye components: components/forms/figma-enquiry-card.jsx (har rail/hero card/closing form), closing-enquiry-panel.jsx.
Delete karne wali files (agar project me ho): src/app/[locale]/about/__components/{advantage-section,team-section,trusted-section}.jsx, src/components/pages/industry-services.jsx,
  src/lib/data/industry-catalogue.json, src/lib/pages/industry-catalogue.js, src/lib/pages/industry-services.js (pichhle rounds se), aur batch 1 ki home files (upar list).
IMPORTANT: Contact page ka form ab /enquiries par jata hai (source "contact-page", email nahi); pehle /contact-enquiries tha. Team ko enquiries list me dikhega.
Placeholders: "Working since XX", "XX people" (Figma 2011/48 hai par Home "last 11 years" kehta hai: Rapid confirm kare), office hours, map, street address (b2e.contact.visit.street message key se), case/review samples, video tiles.
Data jo API me nahi hai (isliye rows/blocks nahi dikhte): scheme "On loans up to / Who can apply / Your share" + covered-activity tiles + illustrative calculation; case ka scheme/service/industry name + status;
  service ke quick_answers/eligibility/stuck_file/hero_points sections + video (doc: b2b-service-sections.example.json agent ne banaya, scratchpad/doc me); industry ke project types/claims/watch-outs;
  scheme status values (Policy changed / Existing claims only / Discontinued); guides par stage tag (isliye Resources ke stage cards "Guide in preparation" dikhte hain); article readMinutes.
Links: Resources ka Schemes panel /subsidies par jata hai (Subsidies hub seed hone ke baad chalega).
Pehli baar npm run build par har page 1280/1024/375 par dekhna zaroori hai: ye sab code se bana hai, browser me nahi dekha.

VERIFIED BUILD (29 Oct 2026, same day): ye sab ek local server + temp DB + seeders + next dev par chalaya gaya; 24 pages (desktop 1440 / mobile 390) render hue, contact form POST /enquiries 201 gaya.
Build me 3 bugs mile aur theek kiye: Expert profile me lucide `Linkedin` icon (ab library me nahi), guide icon file missing (book-open), reviews carousel ka sr-only text mobile par horizontal scroll bana raha tha.
Jo Figma se ABHI bhi alag hai: FAQs hero me "Find your question" card hero ke andar nahi, uske neeche alag band me hai; scheme directory / case archive / FAQs / Resources ke H1 aur intro DB/pages.json ka text hain (Figma headline nahi);
  industry page me 3 project types (DB ka content) hain, Figma me 5; kai cards me chhote data gaps (glance rows) kyunki API me field nahi.


=====================================================================
FIGMA UI BATCH 3 (29 Oct 2026) - web: text ab server se (editable)
=====================================================================
Home, About, Contact, How we work, Resources, Schemes, Case studies: text ab "managed" site page se aata hai (src/lib/content/site-page-data.js -> loadManagedPage(path, locale));
  page seed/save na ho to purana text dikhta hai (fallback). Views: components/pages/about-managed-view.jsx, lib/pages/managed-view.js, components/site-pages/managed-blocks.jsx, lib/content/managed-text.js.
Naya: components/forms/figma-enquiry-card.jsx (ek hi enquiry card sab jagah, POST /enquiries), closing-enquiry-panel.jsx (navy closing panel, contour background: styles/r3.css), components/home/proof-seal.jsx (gold 95% seal; ribbon variant),
  public/assets/brand/{success-ribbon,success-seal-gold,contour-pattern}.png.
Naye/badle pages: /your-project/buying-land (server seeder se), industry + scheme + CLU service + guide + case study (text DB records se).
api/revalidate/route.js ab managed pages ko bhi refresh karta hai (tag 'site-pages').
Local par check hua (29 Oct, local DB + seeders + next dev): 19 pages x 2 sizes (1440 / 390) = 38 renders, sab 200, horizontal overflow 0, page errors 0. Fresh DB par migrations + saare seeders bina error chale.
Production build (next build) yahan nahi chala (internet nahi: Google Fonts); apne system par npm run build zaroor chalayein.
Jo Figma se ABHI bhi alag hai:
 - Industry page: "What you can claim" table live schemes ki category se banti hai, Figma ki 6 rows (Capital subsidy / Interest support / ...) wali table nahi; 3rd project type se aage ke cards me sirf naam (Figma me bhi collapsed).
 - Industry/scheme FAQ me sirf pehla answer (baaki Figma me dikhe nahi). Scheme page par FAQ block nahi (record me FAQ field nahi).
 - Reviews block ka sample text home-placeholders.json se aata hai; /hi/resources, /hi/schemes, /hi/case-studies abhi 404 (Hindi managed page seed nahi).
 - FAQs hub naye Figma FAQs layout me rebuild nahi hua; About ke "how we work" 6 steps me connector line thodi bahar nikalti hai (b2e-ui.jsx).
 - Buying land page: 3rd case, 4th review, FAQ 2-5 answers, Reports tab, "WHAT YOU MAY HEAR" label (block me nahi), kuch eyebrows missing.


=====================================================================
FIGMA UI BATCH 3b (29 Oct 2026, evening) - web: ribbon, mega menus, hero polish
=====================================================================
FREE / FIRST REVIEW ribbon: public/assets/brand/free-first-review.png (aapki di hui image). components/forms/figma-enquiry-card.jsx (FreeSeal) ise har form me dikhata hai;
  agar form ka badge text kuch aur ho (jaise "FREE / 48-HOUR LAND CHECK") to wahi ribbon CSS se banta hai (.r3-free-ribbon in styles/r3.css).
Approvals aur Subsidies mega menu Figma ke hisaab se (site-header.jsx, styles/r3.css .fm-*): title + line, red labels ke neeche links, "Not sure what you need?" / "Before you commit" card, neeche "Other business support" row.
  Labels messages/en.json "fm.*" me hain (Hindi me abhi English fallback). Links: services/schemes ke slugs code me hain (site-header.jsx approvalsContent / subsidiesContent).
Hub hero (hub-hero.jsx): gold 95% seal image, icon rows divider style, WhatsApp outline button (green logo, "94672 48028").
Check: local par seed ke baad /en, /en/subsidies, /en/services/change-in-land-use-clu aur mobile menu dekha.


=====================================================================
FIGMA UI BATCH 3c (29 Oct 2026, night) - web: compact form, map, About menu
=====================================================================
Form (components/forms/figma-enquiry-card.jsx): inputs chhote (h-10), Name + Mobile ek row me, District + project ek row me, label ke saath Required/Optional tag, FREE / FIRST REVIEW ribbon image
  (purana green/navy pill hata diya), chevron wala select. Form wali sticky rails (.b2c-rail-sticky, .b2b-rail__sticky, .b2e-rail, .detail-rail) sticky hi hain; unka scrollbar chhupa diya (styles/r3.css).
Map: components/ui/office-map.jsx (Google Maps iframe, lazy, 4:3). Contact "Visit us" aur About "Visit us" dono me placeholder ki jagah. Address lib/site.js -> OFFICE_MAP_EMBED.
  About ka block (info_panel) me ab "Google Maps embed address (optional)" field hai (server registry); khali ho to Rapid office ka map dikhta hai; photo daalne par photo dikhti hai.
About mega menu (site-header.jsx aboutContent, labels messages "fm.about.*"): Rapid Consulting (story, advantage, team, how we work) + Connect with us (For CAs & bankers, Careers, Contact us),
  card "One team. Start to finish." + "Discuss your project", neeche "Learn more about us". Links: /about, /about#why-one-owner, /about#people, /how-we-work, /advisers, /careers, /contact.
About page ka text Figma transcription se match kiya: sab lines mil gayi. Farak: team ka 2nd card "Ananya Rao" Figma me SAMPLE hai (asli team records dikhte hain); "Hours" line Figma me placeholder [days and hours] hai isliye khali.

Batch 3d (29 Oct 2026): Client logo strip (home/logo-strip.jsx) ab grey "CLIENT LOGO 01" tiles ki jagah asli client logos dikhata hai (public/assets/logo: Velmoc, Darcl, Novice, Shyam-G, Anida), bina text ke. Home, About, Industry pages par.
  Contact page ka address rapidconsulting.in jaisa: "Plot No 134, 1st Floor, Old Court Road, Near Payasam Restaurant, Hisar" (messages b2e.contact.visit.street, sirf English).
  Footer ke social icons ke liye .env.local me (rapidconsulting.in ke links): NEXT_PUBLIC_SOCIAL_FACEBOOK_URL=https://www.facebook.com/rapidconsultingindia, NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL=https://www.instagram.com/rapidconsulting/,
  NEXT_PUBLIC_SOCIAL_YOUTUBE_URL=https://www.youtube.com/@RapidConsulting, NEXT_PUBLIC_SOCIAL_LINKEDIN_URL=https://www.linkedin.com/in/rapid-consulting-084866303/  (dev server restart ke baad icons dikhenge).

Batch 3e (29 Oct 2026): styles/r3.css - (1) Breadcrumb ab hero ke pale green par aur left me (pehle white strip me beech me tha; global .breadcrumbs ka display:flex use beech me kar deta tha). Service pages par strip white rehti hai (neeche sticky "On this page" bar white hai).
  (2) Safed card jo safed background par flat dikhte the (border-slate-200 + bg-white wale rounded-xl / rounded-2xl cards, .b2a-step, article.group) ko halki shadow + hover lift. Sirf CSS, koi component nahi badla.

BATCH 3f (client success, footer, strip)
- Client success: ek hi card (components/case-card.jsx -> CaseTile / CaseCard): green figure panel + rupee mark, icon table (Scheme/Service, Industry, Location, Rapid's role), outline "See how Rapid helped" button. Home, About (case_cards block), Industry, Service, Scheme/other grids sab isi se.
- About/Home managed case_cards block, Industry cases aur Service "Our work" ab Carousel (pager 1-3 / 3, prev/next) me.
- Footer redesigned: CTA panel, brand + address + phone + email column, 4-column links (compact), legal row.
- Top strip: lg par sirf phone (+ CRM), email xl se; no-wrap, ticker text clip nahi hota.
- Pichle fixes (3c-3e) is zip me shamil: breadcrumb padding, ek jaisa sticky tabs, wide rail, map + no contour in navy panels, ClientTicker new logo strip, hero hint removed.
