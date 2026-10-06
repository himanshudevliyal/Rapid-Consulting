"use strict";

import { DataTypes } from "sequelize";

const TABLES = ["services", "articles", "schemes"];

// A service, an article and a scheme can each belong to one category from the
// existing `categories` table. Optional; deleting a category just clears it.
export async function up({ context: queryInterface }) {
  for (const table of TABLES) {
    await queryInterface.addColumn(table, "category_id", {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "categories", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addIndex(table, ["category_id"], {
      name: `${table}_category_id_idx`,
    });
  }
}

export async function down({ context: queryInterface }) {
  for (const table of TABLES) {
    await queryInterface.removeIndex(table, `${table}_category_id_idx`);
    await queryInterface.removeColumn(table, "category_id");
  }
}
