import cluster from "cluster";
import os from "os";
import process from "process";
import config from "./app/config/index.js";
import { buildApp } from "./app.js";

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Starting ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const start = async () => {
    try {
      const app = await buildApp();
      await app.listen({
        port: config.port,
        host: "0.0.0.0", // IMPORTANT
      });
      console.log(`Worker ${process.pid} started`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  start();
}
