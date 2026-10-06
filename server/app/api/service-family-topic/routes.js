"use strict";
import authorize from "../../helpers/authorize.js";
import controller from "./controller.js";
import { lookupRoutes } from "../service-lookup/controller-factory.js";

// /v1/service/family-topic  (admin only, JWT via routes/v1/index.js)
export default async function serviceFamilyTopicRoutes(fastify) {
  fastify.addHook("preHandler", authorize("admin"));
  await fastify.register(lookupRoutes(controller));
}
