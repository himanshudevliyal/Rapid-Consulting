"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.addColumn(constants.models.QUERY_TABLE, "reason", {
    type: DataTypes.STRING,
    // Nullable at the DB level so existing rows don't break; the API
    // enforces it as required for new submissions via the zod schema.
    allowNull: true,
  });

  await queryInterface.addColumn(constants.models.QUERY_TABLE, "attachment", {
    type: DataTypes.STRING,
    allowNull: true,
  });

  await queryInterface.addIndex(constants.models.QUERY_TABLE, ["reason"]);
}

export async function down({ context: queryInterface }) {
  await queryInterface.removeColumn(constants.models.QUERY_TABLE, "reason");
  await queryInterface.removeColumn(
    constants.models.QUERY_TABLE,
    "attachment",
  );
}