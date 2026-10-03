// scripts/migrate.js
import { sequelize } from "../app/db/postgres.js";
import { Umzug, SequelizeStorage } from "umzug";

const umzug = new Umzug({
  migrations: { glob: "migrations/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const command = process.argv[2]; // up | down | status
const target = process.argv[3]; // optional migration name

async function run() {
  await sequelize.authenticate();
  console.log(`🚀 Running migration command: ${command}`);

  switch (command) {
    case "up":
      if (target) {
        await umzug.up({ to: target });
        console.log(`✅ Migrated up to: ${target}`);
      } else {
        await umzug.up();
        console.log("✅ All migrations applied");
      }
      break;

    case "down":
      // 🔴 prevent production rollback stupidity
      if (process.env.NODE_ENV === "production") {
        throw new Error("❌ Down migrations are blocked in production");
      }

      if (target) {
        await umzug.down({ to: target });
        console.log(`⚠️ Rolled back to: ${target}`);
      } else {
        await umzug.down();
        console.log("⚠️ Last migration reverted");
      }
      break;

    case "status":
    default: {
      const pending = await umzug.pending();
      const executed = await umzug.executed();

      console.log("\n📌 Pending Migrations:");
      if (!pending.length) console.log("  ✔ None");
      pending.forEach((m) => console.log(`  - ${m.name}`));

      console.log("\n📦 Executed Migrations:");
      if (!executed.length) console.log("  ✔ None");
      executed.forEach((m) => console.log(`  - ${m.name}`));

      break;
    }
  }

  await sequelize.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Migration failed:", err);
  await sequelize.close();
  process.exit(1);
});
