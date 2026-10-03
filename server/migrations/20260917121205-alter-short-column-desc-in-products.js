"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.changeColumn(constants.models.PRODUCT_TABLE, "short_description", {
    type: DataTypes.TEXT,
    allowNull: true,
  });
}

export async function down({ context: queryInterface }) {
   await queryInterface.changeColumn(constants.models.PRODUCT_TABLE, "short_description", {
    type: DataTypes.STRING,
    allowNull: true,
  });
}
