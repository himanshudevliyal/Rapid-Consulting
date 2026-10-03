"use strict";
import fp from "fastify-plugin";
import { Queue } from "bullmq";

export default fp(async (fastify) => {
  const emailQueue = new Queue("email-queue", {
    connection: fastify.redis,
  });

  fastify.decorate("emailQueue", emailQueue);

  fastify.addHook("onClose", async () => {
    await emailQueue.close();
  });
});
