"use strict";
import controller from "./controller.js";

export default async function caseStudyRoutes(fastify, options) {
  fastify.post("/", controller.create);
  // fastify.get("/", controller.getAll);
  fastify.put("/:id", controller.update);
  fastify.delete("/:id", controller.destroy);
}

export async function caseStudyPublicRoutes(fastify, options) {
  fastify.get("/", controller.getAllPublic);
  fastify.get("/by-slug/:slug", controller.getBySlug);
}
