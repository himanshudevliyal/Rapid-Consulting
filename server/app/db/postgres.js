import { Sequelize } from "sequelize";
import config from "../config/index.js";
export const sequelize = new Sequelize(
  config.pg_database,
  config.pg_username,
  config.pg_password,
  {
    host: config.pg_host,
    dialect: config.pg_dialect,
    logging: false,
  },
);

async function postgresConnection(fastify, options) {
  let dbSuccess = null;

  try {
    await sequelize.authenticate();
    fastify.log.info(`Postgres Database connection OK!`);
    fastify.log.info(`Initializing sequelize connection and models...`);
    // await migration.init(sequelize);
    fastify.log.info("Migration successfully completed...");
  } catch (error) {
    console.log(error);
    dbSuccess == false;
    process.exit(1);
  }
}

export default postgresConnection;
