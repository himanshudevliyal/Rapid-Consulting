"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.PRODUCT_INQUIRY_TABLE,
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        full_name: { type: DataTypes.STRING, allowNull: false },
        company_name: { type: DataTypes.STRING, allowNull: true },
        email: { type: DataTypes.STRING, allowNull: false },
        contact_number: { type: DataTypes.STRING, allowNull: false },
        city: { type: DataTypes.STRING, allowNull: false },
        state: { type: DataTypes.STRING, allowNull: false },
        message: { type: DataTypes.TEXT, allowNull: true },
        products: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: [],
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "pending",
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
      constants.models.PRODUCT_INQUIRY_TABLE,
      ["email"],
      { transaction: t },
    );
    await queryInterface.addIndex(
      constants.models.PRODUCT_INQUIRY_TABLE,
      ["status"],
      { transaction: t },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable(constants.models.PRODUCT_INQUIRY_TABLE);
}
