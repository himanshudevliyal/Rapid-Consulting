"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.PRODUCT_TABLE,
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        slug: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        short_description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        pictures: {
          type: DataTypes.JSONB,
          defaultValue: [],
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        category_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: constants.models.CATEGORY_TABLE,
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        sort_order: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        content: { type: DataTypes.TEXT, allowNull: true },
        ingredients: {
          type: DataTypes.JSONB,
          defaultValue: [],
        },
        delivery_info: {
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

    await queryInterface.addIndex(constants.models.PRODUCT_TABLE, ["title"], {
      transaction: t,
    });
    await queryInterface.addIndex(constants.models.PRODUCT_TABLE, ["slug"], {
      transaction: t,
    });
    await queryInterface.addIndex(
      constants.models.PRODUCT_TABLE,
      ["category_id"],
      { transaction: t },
    );
    await queryInterface.addIndex(
      constants.models.PRODUCT_TABLE,
      ["is_active"],
      { transaction: t },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.dropTable(constants.models.PRODUCT_TABLE, {
      transaction: t,
    });
  });
}
