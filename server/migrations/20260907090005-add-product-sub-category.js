"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.addColumn(
    constants.models.PRODUCT_TABLE,
    "sub_category_id",
    {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: constants.models.SUB_CATEGORY_TABLE,
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
  );

  await queryInterface.addIndex(
    constants.models.PRODUCT_TABLE,
    ["sub_category_id"],
  );
}

export async function down({ context: queryInterface }) {
  await queryInterface.removeColumn(
    constants.models.PRODUCT_TABLE,
    "sub_category_id",
  );
}
