// import fp from "fastify-plugin";
// import fastifySchedule from "@fastify/schedule";

// export default fp(async (fastify) => {
//   await fastify.register(fastifySchedule);
// });

import fp from "fastify-plugin";
import { ToadScheduler } from "toad-scheduler";

export default fp(async (fastify) => {
  // ✅ Create a single scheduler instance
  const scheduler = new ToadScheduler();
  fastify.decorate("scheduler", scheduler);

  // Stop scheduler on shutdown
  fastify.addHook("onClose", async () => {
    scheduler.stop();
  });

  console.log("🟢 ToadScheduler initialized");
});
