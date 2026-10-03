"use strict";

import constants from "../app/lib/constants/index.js";

const TABLES = [
  constants.models.INVENTORY_TABLE, // "inventories"
  constants.models.CART_TABLE, // "carts"
  constants.models.ORDER_ITEM_TABLE, // "order_items"
];

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    for (const table of TABLES) {
      await queryInterface.removeConstraint(
        table,
        `${table}_product_variant_id_fkey`,
        { transaction: t },
      );

      await queryInterface.renameColumn(
        table,
        "product_variant_id",
        "product_id",
        { transaction: t },
      );

      await queryInterface.addConstraint(table, {
        fields: ["product_id"],
        type: "foreign key",
        name: `${table}_product_id_fkey`,
        references: {
          table: constants.models.PRODUCT_TABLE,
          field: "id",
        },
        onDelete: "cascade",
        transaction: t,
      });
    }
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    for (const table of TABLES) {
      await queryInterface.removeConstraint(
        table,
        `${table}_product_id_fkey`,
        { transaction: t },
      );

      await queryInterface.renameColumn(
        table,
        "product_id",
        "product_variant_id",
        { transaction: t },
      );

      await queryInterface.addConstraint(table, {
        fields: ["product_variant_id"],
        type: "foreign key",
        name: `${table}_product_variant_id_fkey`,
        references: {
          table: constants.models.PRODUCT_VARIANT_TABLE,
          field: "id",
        },
        onDelete: "cascade",
        transaction: t,
      });
    }
  });
}
