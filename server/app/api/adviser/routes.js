"use strict";
import controller from "./controller.js";

// Admin routes (JWT via routes/v1/index.js)
export default async function adviserRoutes(fastify, options) {
  fastify.post("/", controller.create);
  // Every adviser, hidden ones included ("/" is the public list of active ones).
  fastify.get("/all", controller.getAll);
  fastify.get("/:id", controller.getById);
  fastify.put("/:id", controller.update);
  fastify.delete("/:id", controller.destroy);
}

// Public routes: active advisers only, in display order.
export async function adviserPublicRoutes(fastify, options) {
  fastify.get("/", controller.getAllPublic);
}
