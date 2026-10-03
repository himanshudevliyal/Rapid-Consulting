"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.USER_TABLE,
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        fullname: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        mobile_number: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        role: {
          type: DataTypes.ENUM("admin", "user"),
          allowNull: false,
          defaultValue: "user",
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

    await queryInterface.addIndex(constants.models.USER_TABLE, ["email"], {
      transaction: t,
    });
    await queryInterface.addIndex(
      constants.models.USER_TABLE,
      ["mobile_number"],
      { transaction: t },
    );
    await queryInterface.addIndex(constants.models.USER_TABLE, ["username"], {
      transaction: t,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.dropTable(constants.models.USER_TABLE, {
      transaction: t,
    });
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_${constants.models.USER_TABLE}_role";`,
      { transaction: t },
    );
  });
}
