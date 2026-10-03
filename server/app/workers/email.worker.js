import { Worker } from "bullmq";
import Redis from "ioredis";
import config from "../config/index.js";
import { sendEmail } from "../services/mailer.js";

const connection = new Redis({
  host: config.redis_host,
  port: Number(config.redis_port),
  maxRetriesPerRequest: null, // ✅ REQUIRED for BullMQ
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 200, 3000);
  },
});

const worker = new Worker(
  "email-queue",
  async (job) => {
    console.log("📥 Job received:", job.id, job.data); // ✅ ADD THIS

    const { to, subject, templateKey, payload } = job.data;

    await sendEmail({
      to,
      subject,
      templateKey,
      payload,
    });

    console.log("📤 Email processed:", job.id); // ✅ ADD THIS
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 1,
      duration: 1000,
    },
  },
);

worker.on("completed", (job) => {
  console.log(`✅ Email sent: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Email failed: ${job?.id}`, err);
});
