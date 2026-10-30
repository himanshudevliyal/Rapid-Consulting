"use strict";
import controller from "./controller.js";

// Admin routes (JWT via routes/v1/index.js)
export default async function communityGroupRoutes(fastify, options) {
  fastify.post("/", controller.create);
  // Every group, hidden ones included ("/" is the public list of active ones).
  fastify.get("/all", controller.getAll);
  fastify.get("/:id", controller.getById);
  fastify.put("/:id", controller.update);
  fastify.delete("/:id", controller.destroy);
}

// Public routes: active groups only, as a plain array.
export async function communityGroupPublicRoutes(fastify, options) {
  fastify.get("/", controller.getAllPublic);
}
