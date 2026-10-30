Rapid Consulting - Service module update
=========================================
Is zip me sirf NEW / CHANGED files hain, apne project par same path me copy (overwrite) karein.

SERVER  (server/ folder me copy karein)
  1. Files copy karein
  2. npm run migrate:up      -> service_formats + service_family_topics tables banti hain
                                (formats: service, service-family, additional-service, service-index;
                                 topics: S01-S05 seed hote hain)
  3. Server restart

  New APIs (admin token chahiye, GET public bhi hai):
    /v1/service/format          GET list, GET /:id, POST, PUT /:id, DELETE /:id
    /v1/service/family-topic    GET list, GET /:id, POST, PUT /:id, DELETE /:id
  Rules: code create ke baad change nahi hota; built-in format delete nahi (400);
         kisi service me use ho raha ho to delete nahi (409); service create/update par
         type aur family_code in tables ke active options se validate hote hain.
  Bug fix: app/db/models/service.model.js - admin list me khaali WHERE se 500 aa raha tha.

DASHBOARD (dashboard/ folder me copy karein)
  Services > Services     : list (Format / Family filter), Add service, Edit service (poora content visible)
  Services > Formats      : list / create / edit / delete
  Services > Family/topics: list / create / edit / delete
  Naya npm package nahi lagta.

SCHEMES (naya)
  Schemes list: search + Status filter (Published/Draft), Title+slug, Ministry, Tags, Status, Updated.
  Create/Edit form: Title*, Slug (title se auto), Ministry, Official URL, Cover image URL, Tags,
  Published, aur 4 rich-text fields (About, Eligibility, Benefits, Application process).

ARTICLES (naya)
  List: search + Status filter, Title+slug, Tags, Status, Published on, Updated.
  Form: Title*, Slug (auto), Tags, Cover image URL, Published, Excerpt, Article (editor), Meta title/description.
  Fix: list/edit pehle galat unwrap karte the (list khaali, edit blank) aur create/update multipart bhejte the.

IMAGES (naya)
  components/image-field.jsx: upload / preview / replace / remove (max 5 MB, WebP me save).
  Articles, Schemes, Case studies: "Image" card. Services: "Image" card (pictures ki pehli image).
  Lists me title ke saath chhota thumbnail (Articles, Schemes, Case studies).
  Case Studies: poora add/edit module (list, Status filter, form: Title, Slug, Client, Industry, Tags,
  Published, Image, Challenge, Solution, Result). Pehle ka list/edit galat unwrap karta tha.
  NEXT_PUBLIC_FILE_BASE env set hona chahiye (image preview ke liye).

IMAGE UPLOADER + CATEGORIES + FORM UI (naya)
  Aapka FileUploaderServer ab Services, Articles, Schemes, Case Studies ke forms me laga hai
  (meri ImageField hata di: components/image-field.jsx delete kar do agar purani zip se aayi thi).
  file-uploader-server.jsx me 2 chhote fix: AlertCircleIcon import (pehle missing tha) aur
  upload ke dauran local preview dikhe (pehle ".../undefined" ban jata tha).
  lib/image-src.js: table ke thumbnails ke liye imageSrc().
  Categories: Services, Articles, Schemes forms me searchable Category dropdown (naam dikhta hai, id jaati hai)
  -> components/category-field.jsx. List tables me Category column.
  Form UI: Articles / Schemes / Case Studies ab do column hain - left me title/slug/content/SEO,
  right me Status, Category, Image, Tags. components/form-layout.jsx (FormCard, FormColumns, FieldError).

CODE FIELDS HATAYE (naya) - sab jagah name wale dropdown
  Services form: "Code" input hata diya. Code server banata hai.
    Format = "Service family" ho to "Family / topic this page is for" dropdown (naam dikhta hai) aata hai.
  Format / Family-topic add-edit form: "Code" input hata diya (sirf Name).
  Schemes form: Tags me topic ka code (S01) likhna band; ab "Family / topic" dropdown (naam), neeche code tag me jaata hai.
  Tables me Code column pehle jaisa hai (sirf dekhne ke liye).

DASHBOARD HOME PAGE (naya) - src/app/dashboard/page.jsx (poora naya)
  Products / orders / product-inquiries / sub-categories ka data hata diya; ab Services, Schemes, Articles,
  Case studies, Enquiries, Queries, Categories, Users ke counts + charts.
  Naye files: src/hooks/use-dashboard.js (saari list APIs ek jagah, alag-alag response shape normalize),
              src/components/ui/chart.jsx (shadcn chart: ChartContainer/Tooltip/Legend; recharts pehle se package.json me hai).
  Charts: Enquiries & queries (7/30 din area chart), Content status (published vs draft), Services by family/topic (naam, code nahi),
          Enquiry status (donut). Latest enquiries / queries lists. Header me Refresh + "New" menu.
  Har section me alag loading skeleton, empty state aur error + Retry.

INDUSTRIES + GUIDES + FEATURED SCHEMES (naya)
  Industries : poora module - list (image thumbnail, links count, search), Add/Edit form (do column):
               Name*, Slug, Heading (H1), Description, Intro + Content (rich text), Note,
               Related services (multi-select), Related schemes (multi-select), SEO, Image, Icon, Display order, Active.
               Related services/schemes yahin se chunte ho -> website ke industry page par cards aate hain.
  Articles   : "Type" (Article / Guide) select; list me Type badge + Type filter. Guides website par /guides/<slug> par dikhte hain.
  Schemes    : "Show on the home page" checkbox (is_featured). 5-6 featured rakho.
  Services   : Category dropdown pehle se hai - category assign karte hi service navbar + Services section me aa jaati hai.
  Naya npm package nahi lagta. (package-lock.json is zip me nahi hai.)

NEW (is round): src/lib/industry-form.js, src/schemas/industry.js
CHANGED (is round): src/services/industry-service.js, src/hooks/use-industries.jsx,
  src/features/industries/components/{industries-listing.js,industry-form.jsx,table/columns.js}
  (+ article type / scheme featured files: neeche list me, pehle round se cumulative)

JOBS + ADVISERS (naya)
  Jobs     : list (search, Status filter Active/Closed, Expired badge), Add/Edit form do column:
             Title*, Slug (title se auto), Location, Experience, About the role / Responsibilities / Requirements (editor),
             Active, Closing date (ke baad job website se hat jaati hai), Job type.
             Fix: list/edit pehle galat endpoint / galat unwrap ki wajah se khaali aate the.
  Advisers : list (photo, designation, group, search), Add/Edit form: Name*, Designation, Group (Leadership/Experts/...
             ya apna likho), LinkedIn link, Short bio, Photo upload, Display order, Active.
             Ye log website ke About page par "The Rapid Team" me group ke heading ke neeche dikhte hain.
  Naya npm package nahi lagta.

NEW (is round): src/lib/{job-form,adviser-form}.js, src/schemas/{job,adviser}.js
CHANGED (is round): src/utils/endpoints.js, src/services/{job,adviser}-service.js,
  src/features/jobs/components/{job-form.jsx,job-create-page.js,job-edit-page.js,jobs-listing.js,table/*},
  src/features/advisers/components/{adviser-form.jsx,adviser-create-page.js,adviser-edit-page.js,advisers-listing.js,table/columns.js}


ENQUIRIES + CONTACT ENQUIRIES (naya)
  Sidebar : "Service Enquiries" (pehle "Enquiries") aur NAYA "Contact Enquiries".
  List    : Name + phone/email, Service / requirement, Source page (page title + kaun sa form), Status badge, Received date.
            Search, Status filter, Form filter (service enquiries me), Reset.  Row menu: View / update, Delete.
  Detail  : visitor ne jo bheja (name, phone link, email link, location, subject, requirement / message) +
            "Where it came from" (service/product, page title, page URL link, page code, form, received time).
            Admin sirf Status (New / In progress / Resolved / Spam) aur Internal notes badal sakta hai (React Hook Form + zod).
  Add button hata diya: enquiries website se aati hain. /enquiries/create ab list par redirect karta hai.
  Fix: list pehle galat unwrap aur galat status values (purane enum) ki wajah se sahi nahi chalti thi.
  Naya npm package nahi lagta.

DELETE karein (ab use nahi hota)
  src/features/enquiries/components/enquiry-create-page.js

NEW (is round): src/schemas/enquiry.js, src/services/contact-enquiry-service.js, src/hooks/use-contact-enquiries.jsx,
  src/features/enquiries/components/enquiry-kinds.js, src/app/contact-enquiries/page.js, src/app/contact-enquiries/[id]/edit/page.js
CHANGED (is round): src/data/routes.js, src/utils/endpoints.js, src/services/enquiry-service.js, src/hooks/use-enquiries.jsx,
  src/app/enquiries/{page.js,create/page.js,[id]/edit/page.js},
  src/features/enquiries/components/{enquiries-listing.js,enquiry-edit-page.js,enquiry-form.jsx,table/columns.js,
  table/enquiries-table-actions.js,table/use-enquiries-table-filters.js}

DASHBOARD HOME + QUERIES HIDE (naya)
  - "Queries" ab kahin show nahi hota: sidebar se hata diya (src/data/routes.js, isVisible:false) aur home page se
    Queries card / chart line / "Latest queries" list hata di.
  - Uski jagah home page par "Contact enquiries" aaya: stat card (new count ke saath), chart me "Contact enquiries" line,
    aur "Latest contact enquiries" list (row par click -> detail). Pehla card ab "Service enquiries" naam ka hai.
  - Server ka /queries API aur table waise hi hain (kuch delete nahi kiya).
CHANGED (is round): src/app/dashboard/page.jsx (aapki upload ki hui file ke line endings CRLF waise hi rakhe hain),
  src/hooks/use-dashboard.js, src/data/routes.js


=====================================================================
ROUND: WEBSITE DESIGN REVISION (5 Oct 2026)  - dashboard
=====================================================================
Naye modules (sidebar): Sessions (/sessions) aur Community Groups (/community-groups)  - list, search, create/edit, delete.
Advisers form : slug, expertise (ek line = ek item), "placeholder profile" switch.
Articles / Schemes / Case studies form : "Author & reviewer" card (Author, Reviewer, Reviewed on - reviewer ke bina date disabled).
Schemes form : "Quick facts" card (assistance type, relevant activity, policy period, application window, status).
Case studies form : location, sector, Rapid's role + "Evidence" card (proof image, caption, milestone label/date, quote, attribution).
Delete karne wali file: sirf pehle wali (src/features/enquiries/components/enquiry-create-page.js).
Server pehle update + migrate karein, phir dashboard.
