"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.INVENTORY_TABLE,
      {
        product_variant_id: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          references: {
            model: constants.models.PRODUCT_VARIANT_TABLE,
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        stock: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction: t },
    );

    await queryInterface.addIndex(
      constants.models.INVENTORY_TABLE,
      ["product_variant_id"],
      { transaction: t },
    );
    await queryInterface.addIndex(
      constants.models.INVENTORY_TABLE,
      ["stock"],
      { transaction: t },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.dropTable(constants.models.INVENTORY_TABLE, {
      transaction: t,
    });
  });
}
