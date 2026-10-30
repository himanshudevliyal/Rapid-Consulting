import jwtVerify from "../../helpers/auth.js";
import { editorBoundary, staffOnly } from "../../helpers/authorize.js";
import userRoutes from "../../api/users/routes.js";
import cartRoutes from "../../api/cart/routes.js";
import orderRoutes from "../../api/order/routes.js";
import reportRoutes from "../../api/reports/routes.js";
import addressRoutes from "../../api/address/routes.js";
import inventoryRoutes from "../../api/inventory/routes.js";
import categoryRoutes from "../../api/category/routes.js";
import subCategoryRoutes from "../../api/sub-category/routes.js";
import queryRoutes from "../../api/query/routes.js";
import productInquiryRoutes from "../../api/product-inquiry/routes.js";
import blogRoutes from "../../api/blog/routes.js";
import serviceRoutes from "../../api/service/routes.js";
import serviceFormatRoutes from "../../api/service-format/routes.js";
import serviceFamilyTopicRoutes from "../../api/service-family-topic/routes.js";
// ── Rapid Consulting additions ────────────────────────────────────
import enquiryRoutes from "../../api/enquiry/routes.js";
import contactEnquiryRoutes from "../../api/contact-enquiry/routes.js";
import articleRoutes from "../../api/article/routes.js";
import caseStudyRoutes from "../../api/case-study/routes.js";
import adviserRoutes from "../../api/adviser/routes.js";
import jobRoutes from "../../api/job/routes.js";
import industryRoutes from "../../api/industry/routes.js";
import schemeRoutes from "../../api/scheme/routes.js";
import sessionRoutes from "../../api/session/routes.js";
import communityGroupRoutes from "../../api/community-group/routes.js";
import sitePageRoutes from "../../api/site-page/routes.js";
import siteSettingRoutes from "../../api/site-setting/routes.js";

export default async function routes(fastify, options) {
  fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.addHook("preHandler", staffOnly);
  // The "editor" role is limited to Site pages (+ read-only content lists).
  fastify.addHook("preHandler", editorBoundary);

  // routes
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(categoryRoutes, { prefix: "categories" });
  fastify.register(subCategoryRoutes, { prefix: "sub-categories" });
  fastify.register(cartRoutes, { prefix: "carts" });
  fastify.register(orderRoutes, { prefix: "orders" });
  fastify.register(reportRoutes, { prefix: "reports" });
  fastify.register(addressRoutes, { prefix: "addresses" });
  fastify.register(inventoryRoutes, { prefix: "inventories" });
  fastify.register(queryRoutes, { prefix: "queries" });
  fastify.register(productInquiryRoutes, { prefix: "product-inquiries" });
  fastify.register(blogRoutes, { prefix: "blogs" });
  fastify.register(serviceRoutes, { prefix: "services" });
  // Option lists for the service form (admin only).
  fastify.register(serviceFormatRoutes, { prefix: "service/format" });
  fastify.register(serviceFamilyTopicRoutes, { prefix: "service/family-topic" });
  // ── Rapid Consulting ──────────────────────────────────────────
  fastify.register(enquiryRoutes, { prefix: "enquiries" });
  fastify.register(contactEnquiryRoutes, { prefix: "contact-enquiries" });
  fastify.register(articleRoutes, { prefix: "articles" });
  fastify.register(caseStudyRoutes, { prefix: "case-studies" });
  fastify.register(adviserRoutes, { prefix: "advisers" });
  fastify.register(jobRoutes, { prefix: "jobs" });
  fastify.register(industryRoutes, { prefix: "industries" });
  fastify.register(schemeRoutes, { prefix: "schemes" });
  fastify.register(sessionRoutes, { prefix: "sessions" });
  fastify.register(communityGroupRoutes, { prefix: "community-groups" });
  // ── Round 2: modular site pages + navigation settings ─────────
  fastify.register(sitePageRoutes, { prefix: "site-pages" });
  fastify.register(siteSettingRoutes, { prefix: "site-settings" });
}
