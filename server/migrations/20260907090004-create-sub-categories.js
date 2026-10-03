"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.SUB_CATEGORY_TABLE,
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        title: { type: DataTypes.STRING, allowNull: false },
        slug: { type: DataTypes.STRING, allowNull: false, unique: true },
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
        featured: { type: DataTypes.BOOLEAN, defaultValue: false },
        pictures: { type: DataTypes.JSONB, defaultValue: [] },
        meta_title: { type: DataTypes.TEXT },
        meta_description: { type: DataTypes.TEXT },
        meta_keywords: { type: DataTypes.TEXT },
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
      constants.models.SUB_CATEGORY_TABLE,
      ["title"],
      { transaction: t },
    );
    await queryInterface.addIndex(
      constants.models.SUB_CATEGORY_TABLE,
      ["category_id"],
      { transaction: t },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable(constants.models.SUB_CATEGORY_TABLE);
}
