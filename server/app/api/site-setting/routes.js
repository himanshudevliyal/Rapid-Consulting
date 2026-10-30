"use strict";
import { requireRoles } from "../../helpers/authorize.js";
import controller from "./controller.js";

// Admin routes (JWT via routes/v1/index.js): admin only.
export default async function siteSettingRoutes(fastify, options) {
  fastify.addHook(
    "preHandler",
    requireRoles(["admin"], "Only an admin can change site settings such as the navigation."),
  );
  fastify.get("/:key", controller.get);
  fastify.put("/:key", controller.put);
}

// Public routes. Only "navigation" is public.
export async function siteSettingPublicRoutes(fastify, options) {
  fastify.get("/navigation", (req, res) => {
    req.params.key = "navigation";
    return controller.getPublic(req, res);
  });
}
