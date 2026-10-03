"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.dropTable(constants.models.PRODUCT_VARIANT_TABLE, {
      transaction: t,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.PRODUCT_VARIANT_TABLE,
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        product_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: constants.models.PRODUCT_TABLE,
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        pack_size: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: "Number of bottles per pack",
        },
        unit: {
          type: DataTypes.STRING,
          defaultValue: "bottle",
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        display_price: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0.0,
        },
        sku: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: true,
        },
        pictures: {
          type: DataTypes.JSONB,
          defaultValue: [],
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
      constants.models.PRODUCT_VARIANT_TABLE,
      ["product_id"],
      { transaction: t },
    );
    await queryInterface.addIndex(
      constants.models.PRODUCT_VARIANT_TABLE,
      ["product_id", "pack_size"],
      { unique: true, transaction: t },
    );
    await queryInterface.addIndex(
      constants.models.PRODUCT_VARIANT_TABLE,
      ["sku"],
      { transaction: t },
    );
  });
}
