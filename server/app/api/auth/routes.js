"use strict";
import controller from "./controller.js";
import userController from "../users/controller.js";

export default async function routes(fastify, options) {
  fastify.addHook("preHandler", async (request, reply) => {
    request.body && console.log("body", request.body);
  });
  fastify.post(
    "/login",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    controller.verifyUserCredentials,
  );
  fastify.post(
    "/register",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    controller.register,
  );
  fastify.post(
    "/login-request",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    controller.loginRequest,
  );
  fastify.post(
    "/login-verify",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    controller.loginVerify,
  );
  fastify.post(
    "/register-request",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    controller.registerRequest,
  );
  fastify.post(
    "/register-verify",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    controller.registerVerify,
  );
  fastify.post("/refresh", {}, controller.verifyRefreshToken);
  fastify.post("/username", {}, userController.checkUsername);
  fastify.post("/accept-invite", {}, controller.acceptInvite);

  fastify.post(
    "/forgot-password",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    (req, res) => controller.sendResetToken(req, res, "password"),
  );
  fastify.post(
    "/reset-password",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    userController.resetPassword,
  );

  fastify.post(
    "/forgot-username",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    (req, res) => controller.sendResetToken(req, res, "username"),
  );
  fastify.post(
    "/reset-username",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    userController.resetUsername,
  );
}
