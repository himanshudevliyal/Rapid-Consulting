"use strict";

import controller from "./controller.js";

// Admin / Protected routes (JWT via routes/v1/index.js)
export default async function routes(fastify, options) {
  fastify.post("/", controller.create);
  fastify.put("/:id", controller.updateById);
  fastify.delete("/:id/translations/:locale", controller.deleteTranslation);
  fastify.delete("/:id", controller.deleteById);
  fastify.get("/:id", controller.getById);
}

// Public routes
export async function servicePublicRoutes(fastify, options) {
  fastify.get("/get-by-slug/:slug", controller.getBySlug);
  fastify.get("/get-by-code/:code", controller.getByCode);
  fastify.get("/", controller.get);
}
