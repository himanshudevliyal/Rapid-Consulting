"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.ORDER_ITEM_TABLE,
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
          unique: true,
        },
        order_item_no: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        order_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: constants.models.ORDER_TABLE,
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        product_variant_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: constants.models.PRODUCT_VARIANT_TABLE,
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        product_price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        sub_total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
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
      constants.models.ORDER_ITEM_TABLE,
      ["order_id"],
      { transaction: t },
    );
    await queryInterface.addIndex(
      constants.models.ORDER_ITEM_TABLE,
      ["product_variant_id"],
      { transaction: t },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.dropTable(constants.models.ORDER_ITEM_TABLE, {
      transaction: t,
    });
  });
}
