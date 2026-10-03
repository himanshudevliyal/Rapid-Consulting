"use strict";
import controller from "./controller.js";

export async function paymentPublicRoutes(fastify, opts) {
  fastify.post("/success", {}, controller.success);
  fastify.post("/failure", {}, controller.failure);
}
