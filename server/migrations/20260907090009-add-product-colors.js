"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.addColumn(constants.models.PRODUCT_TABLE, "colors", {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.removeColumn(constants.models.PRODUCT_TABLE, "colors");
}
