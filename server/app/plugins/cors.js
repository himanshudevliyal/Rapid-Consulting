import fp from "fastify-plugin";
import cors from "@fastify/cors";
import config from "../config/index.js";

export default fp(async (fastify) => {
  return fastify.register(cors, {
    origin: config.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  });
});
