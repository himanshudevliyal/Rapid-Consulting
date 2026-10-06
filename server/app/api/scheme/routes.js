"use strict";
import controller from "./controller.js";

// Admin routes (JWT via routes/v1/index.js)
export default async function schemeRoutes(fastify, options) {
  fastify.post("/", controller.create);
  // Every scheme, drafts included ("/" is the public list of published ones).
  fastify.get("/all", controller.getAll);
  fastify.get("/:id", controller.getById);
  fastify.put("/:id", controller.update);
  fastify.delete("/:id", controller.destroy);
}

// Public routes: published schemes only.
export async function schemePublicRoutes(fastify, options) {
  fastify.get("/", controller.getAllPublic);
  fastify.get("/by-slug/:slug", controller.getBySlug);
}
