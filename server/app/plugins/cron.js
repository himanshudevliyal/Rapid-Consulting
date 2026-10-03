import fp from "fastify-plugin";
import { loadAllTasks } from "../cron-tasks/schedule-tasks.js";
import { registerDailyTaskSummary } from "../cron-tasks/daily-task-summary.js";
import { registerTeamTaskSummary } from "../cron-tasks/team-task-summary.js";
import { registerMonthlyPerformanceTask } from "../cron-tasks/monthly-performance-summary.js";
import { registerMonthlyKpiReport } from "../cron-tasks/monthly-kpi-report.js";
import { registerTaskOverdueAlert } from "../cron-tasks/task-overdue-alert.js";
// import { registerUpdateDealyedTasksCron } from "../cron-tasks/update-delayed-task.js";

export default fp(async (fastify) => {
  fastify.decorate("startScheduledJobs", () => {
    registerDailyTaskSummary(fastify.scheduler);
    registerTeamTaskSummary(fastify.scheduler);
    registerMonthlyPerformanceTask(fastify.scheduler);
    registerMonthlyKpiReport(fastify.scheduler);
    registerTaskOverdueAlert(fastify.scheduler);
    // registerUpdateDealyedTasksCron(fastify.scheduler);

    loadAllTasks(fastify.scheduler);
    // registerTestCron(fastify.scheduler);
    // cleanupRemovedTasks(fastify.scheduler);
  });

  fastify.startScheduledJobs();
});
