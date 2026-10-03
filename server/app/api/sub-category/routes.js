"use strict";
import { multipartPreHandler } from "../../middlewares/multipart-prehandler.js";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post(
    "/",
    { preHandler: multipartPreHandler(["packages"]) },
    controller.create,
  );
  fastify.put(
    "/:id",
    { preHandler: multipartPreHandler(["packages", "picture_urls"]) },
    controller.updateById,
  );
  fastify.delete("/:id", {}, controller.deleteById);
}

export async function subCategoryPublicRoutes(fastify, opt) {
  fastify.get("/", {}, controller.get);
    fastify.get("/:id", {}, controller.getById);

}
