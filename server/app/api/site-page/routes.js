"use strict";
import { requireRoles } from "../../helpers/authorize.js";
import controller from "./controller.js";

// Who may do what (CONTRACT2 section 3):
//   admin  - everything
//   editor - read, create, save draft, submit for review, create a translation
//            counterpart, preview link, list / read revisions
//            NOT publish, unpublish, restore a revision, or delete
//   anyone else (including a plain "user") - nothing here
const staff = requireRoles(
  ["admin", "editor"],
  "Site pages can only be used by admins and editors.",
);

const adminOnly = (message) => ({ preHandler: [requireRoles(["admin"], message)] });

// Admin routes (JWT via routes/v1/index.js)
export default async function sitePageRoutes(fastify, options) {
  fastify.addHook("preHandler", staff);

  // (The block registry is served by the public route below; the dashboard uses that one.)
  // Every page, drafts included, without the section bodies.
  fastify.get("/all", controller.getAll);
  fastify.post("/", controller.create);
  fastify.get("/:id", controller.getById);
  fastify.put("/:id", controller.update);
  fastify.post("/:id/submit-review", controller.submitReview);
  fastify.post("/:id/translation", controller.createTranslation);
  fastify.post("/:id/preview-token", controller.previewToken);
  fastify.get("/:id/revisions", controller.listRevisions);
  fastify.get("/:id/revisions/:rid", controller.getRevision);

  // Admin only; an editor gets a 403 that says what to do instead.
  fastify.post(
    "/:id/publish",
    adminOnly("Only an admin can publish a page. Send it for review and an admin will publish it."),
    controller.publish,
  );
  fastify.post(
    "/:id/unpublish",
    adminOnly("Only an admin can unpublish a page."),
    controller.unpublish,
  );
  fastify.post(
    "/:id/restore/:rid",
    adminOnly("Only an admin can restore an earlier version of a page."),
    controller.restore,
  );
  fastify.delete("/:id", adminOnly("Only an admin can delete a page."), controller.destroy);
}

// Public routes: published pages only (the preview route needs a signed token).
export async function sitePagePublicRoutes(fastify, options) {
  fastify.get("/registry", controller.registry);
  fastify.get("/", controller.getAllPublic);
  fastify.get("/by-path", controller.getByPath);
  fastify.get("/preview/:id", controller.getPreview);
}
