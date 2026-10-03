import fp from "fastify-plugin";
import { Sequelize } from "sequelize";
import pg_database from "../db/postgres.js";

export default fp(async (fastify) => {
  await fastify.register(pg_database);

  //   const sequelize = new Sequelize(process.env.DATABASE_URL, {
  //     dialect: "postgres",
  //     logging: false,
  //   });

  //   try {
  //     await sequelize.authenticate();
  //     fastify.log.info("Database connected");
  //   } catch (error) {
  //     fastify.log.error("Database connection failed:", error);
  //   }

  //   fastify.decorate("sequelize", sequelize);
});
