"use strict";
import controller from "./controller.js";

// Admin routes (JWT via routes/v1/index.js)
export default async function enquiryRoutes(fastify, options) {
  fastify.get("/", controller.list);
  fastify.get("/:id", controller.getById);
  fastify.patch("/:id", controller.update);
  fastify.delete("/:id", controller.destroy);
}

// Public route — no JWT required
export async function enquiryPublicRoutes(fastify, options) {
  fastify.post("/", controller.create);
}
