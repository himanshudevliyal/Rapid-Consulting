import cluster from "cluster";
import os from "os";
import fastify from "fastify";
import config from "./app/config/index.js";
import server from "./server.js";
import { sequelize } from "./app/db/postgres.js";
import models from "./app/db/index.js";

const numCPUs = Math.min(os.cpus().length, 4);

async function initDatabase() {
  await sequelize.authenticate();

  if (process.env.NODE_ENV === "development") {
    await sequelize.sync();
  }
  console.log("✅ Database connected");
}

if (cluster.isPrimary) {
  console.log(`🚀 Primary ${process.pid} running`);

  try {
    // Only verify DB connection once
    await initDatabase();

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker) => {
      console.log(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  } catch (err) {
    console.error("❌ Primary startup failed:", err);
    process.exit(1);
  }
} else {
  try {
    await sequelize.authenticate();

    await models.init(sequelize);

    const app = fastify({
      logger: {
        level: process.env.LOG_LEVEL || "info",
        transport: null,
        // process.env.NODE_ENV !== ""
        //   ? {
        //       target: "pino-pretty",
        //       options: {
        //         translateTime: "SYS:standard",
        //         ignore: "pid,hostname",
        //         colorize: true,
        //       },
        //     }
        //   : undefined,
        base: {
          service: "api-server",
        },
      },
    });

    await server(app);

    await app.listen({
      port: config.port,
      host: "0.0.0.0",
    });

    console.log(`✅ Worker ${process.pid} started`);
  } catch (err) {
    console.error(`❌ Worker ${process.pid} failed:`, err);
    process.exit(1);
  }
}
