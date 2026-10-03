"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.CATEGORY_TABLE,
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        slug: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        featured: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        pictures: {
          type: DataTypes.JSONB,
          defaultValue: [],
        },
        meta_title: { type: DataTypes.TEXT, allowNull: true },
        meta_description: { type: DataTypes.TEXT, allowNull: true },
        meta_keywords: { type: DataTypes.TEXT, allowNull: true },
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

    await queryInterface.addIndex(constants.models.CATEGORY_TABLE, ["title"], {
      transaction: t,
    });
    await queryInterface.addIndex(constants.models.CATEGORY_TABLE, ["slug"], {
      transaction: t,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.dropTable(constants.models.CATEGORY_TABLE, {
      transaction: t,
    });
  });
}
