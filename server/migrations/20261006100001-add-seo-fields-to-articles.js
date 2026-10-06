"use strict";

import { DataTypes } from "sequelize";

// Search-engine title and description for each article (the dashboard form
// already had these fields, but there was nowhere to save them).
export async function up({ context: queryInterface }) {
  await queryInterface.addColumn("articles", "meta_title", {
    type: DataTypes.STRING(255),
    allowNull: true,
  });
  await queryInterface.addColumn("articles", "meta_description", {
    type: DataTypes.TEXT,
    allowNull: true,
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.removeColumn("articles", "meta_description");
  await queryInterface.removeColumn("articles", "meta_title");
}
