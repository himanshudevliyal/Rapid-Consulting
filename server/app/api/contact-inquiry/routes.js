"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.get("/", {}, controller.get);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/:id", {}, controller.getById);
}

export async function contactInquiryPublicRoutes(fastify, opt) {
  fastify.post("/", {}, controller.create);
}
