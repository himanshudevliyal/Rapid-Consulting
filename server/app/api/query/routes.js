"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/:id", {}, controller.getById);
  fastify.get("/", {}, controller.get);
}

export async function queryPublicRoutes(fastify, options) {
  fastify.post("/", {}, controller.create);
}
