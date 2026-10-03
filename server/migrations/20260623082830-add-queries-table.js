"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.QUERY_TABLE,
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          unique: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        subject: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT,
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

    await queryInterface.addIndex(constants.models.QUERY_TABLE, ["email"], {
      transaction: t,
    });
    await queryInterface.addIndex(constants.models.QUERY_TABLE, ["phone"], {
      transaction: t,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.dropTable(constants.models.QUERY_TABLE, {
      transaction: t,
    });
  });
}
