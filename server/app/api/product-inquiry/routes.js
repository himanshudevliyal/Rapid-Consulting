"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.get("/", {}, controller.get);
  fastify.get("/:id", {}, controller.getById);
  fastify.put("/:id/status", {}, controller.updateStatus);
  fastify.delete("/:id", {}, controller.deleteById);
}

export async function productInquiryPublicRoutes(fastify, options) {
  fastify.post("/", {}, controller.create);
}
