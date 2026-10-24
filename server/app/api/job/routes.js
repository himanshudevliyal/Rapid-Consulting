"use strict";
import controller from "./controller.js";

// Admin routes (JWT via routes/v1/index.js)
export default async function jobRoutes(fastify, options) {
  fastify.post("/", controller.create);
  // Every job, closed ones included ("/" is the public list of open jobs).
  fastify.get("/all", controller.getAll);
  fastify.get("/:id", controller.getById);
  fastify.put("/:id", controller.update);
  fastify.delete("/:id", controller.destroy);
}

// Public routes: active jobs that have not passed their closing date.
export async function jobPublicRoutes(fastify, options) {
  fastify.get("/", controller.getAllPublic);
  fastify.get("/by-slug/:slug", controller.getBySlug);
}
