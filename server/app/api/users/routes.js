"use strict";

import authorize from "../../helpers/authorize.js";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/", {  }, controller.create);
  fastify.post(
    "/:id/change-password",
    { preHandler: [authorize("admin")] },
    controller.updatePassword,
  );
  fastify.put(
    "/:id",
    { preHandler: [authorize("admin", "user")] },
    controller.update,
  );
  fastify.get("/me", { preHandler: [] }, controller.getUser);
  fastify.get("/", { preHandler: [authorize("admin")] }, controller.get);
  fastify.get("/:id", { preHandler: [authorize("admin")] }, controller.getById);
  fastify.delete(
    "/:id",
    { preHandler: [authorize("admin")] },
    controller.deleteById,
  );
}
