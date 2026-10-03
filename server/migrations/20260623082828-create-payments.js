"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.PAYMENT_TABLE,
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          unique: true,
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
        amount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: "Amount in paisa",
        },
        payment_status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        remarks: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        response: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        transaction_id: {
          type: DataTypes.STRING,
          allowNull: true,
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
      constants.models.PAYMENT_TABLE,
      ["order_id"],
      { transaction: t },
    );
    await queryInterface.addIndex(
      constants.models.PAYMENT_TABLE,
      ["transaction_id"],
      { transaction: t },
    );
    await queryInterface.addIndex(
      constants.models.PAYMENT_TABLE,
      ["payment_status"],
      { transaction: t },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.dropTable(constants.models.PAYMENT_TABLE, {
      transaction: t,
    });
  });
}
