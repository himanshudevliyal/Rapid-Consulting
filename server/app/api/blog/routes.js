"use strict";

import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

// Admin / Protected routes
export default async function routes(fastify, options) {
  fastify.post(
    "/",
    {
      preHandler: multipartPreHandler(["packages"]),
    },
    controller.create
  );

  fastify.put(
    "/:id",
    {
      preHandler: multipartPreHandler(["packages", "picture_urls"]),
    },
    controller.updateById
  );

  fastify.delete("/:id", controller.deleteById);

  fastify.get("/:id", controller.getById);
}

// Public routes
export async function blogPublicRoutes(fastify, options) {
  fastify.get("/get-by-slug/:slug", controller.getBySlug);

  fastify.get("/", controller.get);
}