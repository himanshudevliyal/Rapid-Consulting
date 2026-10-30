"use strict";

import { DataTypes } from "sequelize";

// 30 October 2026: a scheme gets
//   quick_facts  the "at a glance" rows as a list of { label, value, bold }
//   sections     extra page sections (same shape as a service's sections)
// Safe to run again: each step checks first.

const addColumnIfMissing = async (queryInterface, column, definition) => {
  if ((await queryInterface.describeTable("schemes"))[column]) return;
  await queryInterface.addColumn("schemes", column, definition);
};

const removeColumnIfPresent = async (queryInterface, column) => {
  if (!(await queryInterface.describeTable("schemes"))[column]) return;
  await queryInterface.removeColumn("schemes", column);
};

export async function up({ context: queryInterface }) {
  await addColumnIfMissing(queryInterface, "quick_facts", { type: DataTypes.JSONB, allowNull: false, defaultValue: [] });
  await addColumnIfMissing(queryInterface, "sections", { type: DataTypes.JSONB, allowNull: false, defaultValue: [] });
}

export async function down({ context: queryInterface }) {
  await removeColumnIfPresent(queryInterface, "sections");
  await removeColumnIfPresent(queryInterface, "quick_facts");
}
