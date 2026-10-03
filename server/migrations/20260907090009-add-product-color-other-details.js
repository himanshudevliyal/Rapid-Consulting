"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.addColumn(constants.models.PRODUCT_TABLE, "color", {
    type: DataTypes.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn(
    constants.models.PRODUCT_TABLE,
    "other_details",
    {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  );
}

export async function down({ context: queryInterface }) {
  await queryInterface.removeColumn(constants.models.PRODUCT_TABLE, "color");
  await queryInterface.removeColumn(
    constants.models.PRODUCT_TABLE,
    "other_details",
  );
}
