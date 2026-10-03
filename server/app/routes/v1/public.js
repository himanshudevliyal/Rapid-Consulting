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
import { articlePublicRoutes } from "../../api/article/routes.js";
import { caseStudyPublicRoutes } from "../../api/case-study/routes.js";
import { adviserPublicRoutes } from "../../api/adviser/routes.js";
import { jobPublicRoutes } from "../../api/job/routes.js";
import { industryPublicRoutes } from "../../api/industry/routes.js";
import { schemePublicRoutes } from "../../api/scheme/routes.js";

export default async function routes(fastify, options) {
  fastify.register(categoryPublicRoutes, { prefix: "categories" });
  fastify.register(subCategoryPublicRoutes, { prefix: "sub-categories" });
  fastify.register(queryPublicRoutes, { prefix: "queries" });
  fastify.register(productInquiryPublicRoutes, { prefix: "product-inquiries" });
  fastify.register(paymentPublicRoutes, { prefix: "payments" });
  fastify.register(uploadFilesRoutes, { prefix: "upload" });
  fastify.register(blogPublicRoutes, { prefix: "blogs" });
  fastify.register(servicePublicRoutes, { prefix: "services" });
  // ── Rapid Consulting ──────────────────────────────────────────
  fastify.register(enquiryPublicRoutes, { prefix: "enquiries" });
  fastify.register(articlePublicRoutes, { prefix: "articles" });
  fastify.register(caseStudyPublicRoutes, { prefix: "case-studies" });
  fastify.register(adviserPublicRoutes, { prefix: "advisers" });
  fastify.register(jobPublicRoutes, { prefix: "jobs" });
  fastify.register(industryPublicRoutes, { prefix: "industries" });
  fastify.register(schemePublicRoutes, { prefix: "schemes" });
}
