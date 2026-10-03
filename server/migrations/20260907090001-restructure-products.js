"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    // Drop columns that no longer apply now that products have no variants/pricing
    await queryInterface.removeColumn(constants.models.PRODUCT_TABLE, "pictures", {
      transaction: t,
    });
    await queryInterface.removeColumn(
      constants.models.PRODUCT_TABLE,
      "ingredients",
      { transaction: t },
    );
    await queryInterface.removeColumn(
      constants.models.PRODUCT_TABLE,
      "delivery_info",
      { transaction: t },
    );

    // Add new rich-content sections
    await queryInterface.addColumn(
      constants.models.PRODUCT_TABLE,
      "hero",
      { type: DataTypes.JSONB, defaultValue: {} },
      { transaction: t },
    );
    await queryInterface.addColumn(
      constants.models.PRODUCT_TABLE,
      "overview",
      { type: DataTypes.JSONB, defaultValue: {} },
      { transaction: t },
    );
    await queryInterface.addColumn(
      constants.models.PRODUCT_TABLE,
      "details",
      { type: DataTypes.JSONB, defaultValue: {} },
      { transaction: t },
    );
    await queryInterface.addColumn(
      constants.models.PRODUCT_TABLE,
      "materials",
      { type: DataTypes.JSONB, defaultValue: {} },
      { transaction: t },
    );
    await queryInterface.addColumn(
      constants.models.PRODUCT_TABLE,
      "specifications",
      { type: DataTypes.JSONB, defaultValue: [] },
      { transaction: t },
    );
    await queryInterface.addColumn(
      constants.models.PRODUCT_TABLE,
      "models_3d",
      { type: DataTypes.JSONB, defaultValue: [] },
      { transaction: t },
    );
    await queryInterface.addColumn(
      constants.models.PRODUCT_TABLE,
      "downloads",
      { type: DataTypes.JSONB, defaultValue: [] },
      { transaction: t },
    );
    await queryInterface.addColumn(
      constants.models.PRODUCT_TABLE,
      "gallery",
      { type: DataTypes.JSONB, defaultValue: {} },
      { transaction: t },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.removeColumn(constants.models.PRODUCT_TABLE, "hero", {
      transaction: t,
    });
    await queryInterface.removeColumn(
      constants.models.PRODUCT_TABLE,
      "overview",
      { transaction: t },
    );
    await queryInterface.removeColumn(
      constants.models.PRODUCT_TABLE,
      "details",
      { transaction: t },
    );
    await queryInterface.removeColumn(
      constants.models.PRODUCT_TABLE,
      "materials",
      { transaction: t },
    );
    await queryInterface.removeColumn(
      constants.models.PRODUCT_TABLE,
      "specifications",
      { transaction: t },
    );
    await queryInterface.removeColumn(
      constants.models.PRODUCT_TABLE,
      "models_3d",
      { transaction: t },
    );
    await queryInterface.removeColumn(
      constants.models.PRODUCT_TABLE,
      "downloads",
      { transaction: t },
    );
    await queryInterface.removeColumn(
      constants.models.PRODUCT_TABLE,
      "gallery",
      { transaction: t },
    );

    await queryInterface.addColumn(
      constants.models.PRODUCT_TABLE,
      "pictures",
      { type: DataTypes.JSONB, defaultValue: [] },
      { transaction: t },
    );
    await queryInterface.addColumn(
      constants.models.PRODUCT_TABLE,
      "ingredients",
      { type: DataTypes.JSONB, defaultValue: [] },
      { transaction: t },
    );
    await queryInterface.addColumn(
      constants.models.PRODUCT_TABLE,
      "delivery_info",
      { type: DataTypes.JSONB, defaultValue: [] },
      { transaction: t },
    );
  });
}
