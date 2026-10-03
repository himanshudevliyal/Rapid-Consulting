"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.ORDER_TABLE,
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
          unique: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: constants.models.USER_TABLE,
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        order_no: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        subtotal: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        tax: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        shipping_fee: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        total: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        shipping_address: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        billing_address: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        order_status: {
          type: DataTypes.ENUM(
            "Pending",
            "Order Accepted",
            "Order Processing",
            "In Transit",
            "Out For Delivery",
            "Delivered",
            "Canceled",
          ),
          defaultValue: "Pending",
        },
        is_inter_state: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        is_paid: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
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

    await queryInterface.addIndex(constants.models.ORDER_TABLE, ["user_id"], {
      transaction: t,
    });
    await queryInterface.addIndex(
      constants.models.ORDER_TABLE,
      ["order_status"],
      { transaction: t },
    );
    await queryInterface.addIndex(constants.models.ORDER_TABLE, ["is_paid"], {
      transaction: t,
    });
    await queryInterface.addIndex(
      constants.models.ORDER_TABLE,
      ["transaction_id"],
      { transaction: t },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.dropTable(constants.models.ORDER_TABLE, {
      transaction: t,
    });
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_${constants.models.ORDER_TABLE}_order_status";`,
      { transaction: t },
    );
  });
}
