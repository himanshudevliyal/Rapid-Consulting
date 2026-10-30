"use strict";

import { categoryPublicRoutes } from "../../api/category/routes.js";
import { subCategoryPublicRoutes } from "../../api/sub-category/routes.js";
import { paymentPublicRoutes } from "../../api/payment/routes.js";
import { queryPublicRoutes } from "../../api/query/routes.js";
import { productInquiryPublicRoutes } from "../../api/product-inquiry/routes.js";
import uploadFilesRoutes from "../../api/upload_files/routes.js";
import { blogPublicRoutes } from "../../api/blog/routes.js";
import { servicePublicRoutes } from "../../api/service/routes.js";
// ── Rapid Consulting additions ────────────────────────────────────
import { enquiryPublicRoutes } from "../../api/enquiry/routes.js";
import { contactEnquiryPublicRoutes } from "../../api/contact-enquiry/routes.js";
import { articlePublicRoutes } from "../../api/article/routes.js";
import { caseStudyPublicRoutes } from "../../api/case-study/routes.js";
import { adviserPublicRoutes } from "../../api/adviser/routes.js";
import { jobPublicRoutes } from "../../api/job/routes.js";
import { industryPublicRoutes } from "../../api/industry/routes.js";
import { schemePublicRoutes } from "../../api/scheme/routes.js";
import { sessionPublicRoutes } from "../../api/session/routes.js";
import { communityGroupPublicRoutes } from "../../api/community-group/routes.js";
import { sitePagePublicRoutes } from "../../api/site-page/routes.js";
import { siteSettingPublicRoutes } from "../../api/site-setting/routes.js";

export default async function routes(fastify, options) {
  fastify.register(categoryPublicRoutes, { prefix: "categories" });
  fastify.register(subCategoryPublicRoutes, { prefix: "sub-categories" });
  fastify.register(queryPublicRoutes, { prefix: "queries" });
  fastify.register(productInquiryPublicRoutes, { prefix: "product-inquiries" });
  fastify.register(paymentPublicRoutes, { prefix: "payments" });
  fastify.register(uploadFilesRoutes, { prefix: "upload" });
  // The admin panel posts files to /v1/public/upload/files; keep both addresses working.
  fastify.register(uploadFilesRoutes, { prefix: "public/upload" });
  fastify.register(blogPublicRoutes, { prefix: "blogs" });
  fastify.register(servicePublicRoutes, { prefix: "services" });
  // ── Rapid Consulting ──────────────────────────────────────────
  fastify.register(enquiryPublicRoutes, { prefix: "enquiries" });
  fastify.register(contactEnquiryPublicRoutes, { prefix: "contact-enquiries" });
  fastify.register(articlePublicRoutes, { prefix: "articles" });
  fastify.register(caseStudyPublicRoutes, { prefix: "case-studies" });
  fastify.register(adviserPublicRoutes, { prefix: "advisers" });
  fastify.register(jobPublicRoutes, { prefix: "jobs" });
  fastify.register(industryPublicRoutes, { prefix: "industries" });
  fastify.register(schemePublicRoutes, { prefix: "schemes" });
  fastify.register(sessionPublicRoutes, { prefix: "sessions" });
  fastify.register(communityGroupPublicRoutes, { prefix: "community-groups" });
  // ── Round 2: modular site pages + navigation settings ─────────
  fastify.register(sitePagePublicRoutes, { prefix: "site-pages" });
  fastify.register(siteSettingPublicRoutes, { prefix: "site-settings" });
}
