// scripts/seed.js
import { sequelize } from "../app/db/postgres.js";
import { Umzug, SequelizeStorage } from "umzug";

const seeder = new Umzug({
  migrations: { glob: "seeders/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    modelName: "SequelizeSeedMeta", // separate tracking table
  }),
  logger: console,
});

const command = process.argv[2]; // up | down | status
const target = process.argv[3];

async function run() {
  await sequelize.authenticate();
  console.log(`🚀 Running seeder command: ${command}`);

  switch (command) {
    case "up":
      if (target) {
        await seeder.up({ to: target });
        console.log(`✅ Seeded up to: ${target}`);
      } else {
        await seeder.up();
        console.log("✅ All seeders applied");
      }
      break;

    case "down":
      if (process.env.NODE_ENV === "production") {
        throw new Error("❌ Seed rollback blocked in production");
      }

      if (target) {
        await seeder.down({ to: target });
        console.log(`⚠️ Seed rollback to: ${target}`);
      } else {
        await seeder.down();
        console.log("⚠️ Last seeder reverted");
      }
      break;

    case "status":
    default: {
      const pending = await seeder.pending();
      const executed = await seeder.executed();

      console.log("\n📌 Pending Seeders:");
      if (!pending.length) console.log("  ✔ None");
      pending.forEach((m) => console.log(`  - ${m.name}`));

      console.log("\n📦 Executed Seeders:");
      if (!executed.length) console.log("  ✔ None");
      executed.forEach((m) => console.log(`  - ${m.name}`));

      break;
    }
  }

  await sequelize.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Seeder failed:", err);
  await sequelize.close();
  process.exit(1);
});
