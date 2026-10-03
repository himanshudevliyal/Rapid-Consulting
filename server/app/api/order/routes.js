"use strict";
import controller from "./controller.js";

export default async function routes(fastify, opts) {
  fastify.post("/", {}, controller.create);
  fastify.get("/", {}, controller.get);
  fastify.get("/:id/invoice", {}, controller.getOrderInvoice);
  fastify.get("/:id/shipping-label", {}, controller.getOrderShippingLabel);
  fastify.get("/:id/items", {}, controller.getOrderItems);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/:id", {}, controller.getById);
  fastify.put("/:id", {}, controller.update);
  fastify.put("/:order_id/items/:item_id", {}, controller.updateOrderItem);
}
