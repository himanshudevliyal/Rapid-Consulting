"use strict";
import controller from "./controller.js";

export default async function jobRoutes(fastify, options) {
  fastify.post("/", controller.create);
  // fastify.get("/", controller.getAll);
  // fastify.get("/:id", controller.getById);
  fastify.put("/:id", controller.update);
  fastify.delete("/:id", controller.destroy);
}

export async function jobPublicRoutes(fastify, options) {
  fastify.get("/", controller.getAllPublic);
  fastify.get("/by-slug/:slug", controller.getBySlug);
  fastify.get("/:id", controller.getById);
}
