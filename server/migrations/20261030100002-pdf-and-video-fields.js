"use strict";

import { DataTypes } from "sequelize";

// 30 October 2026: articles (guides, reports ...) and schemes can carry a PDF
// (`pdf_url`, an uploaded file path). The website shows it as a link that opens
// the PDF in a new tab. (Service video cards keep their YouTube address and poster
// inside the section itself, so they need no column.)
// Safe to run again: each step checks first.

const addColumnIfMissing = async (queryInterface, table, column, definition) => {
  if ((await queryInterface.describeTable(table))[column]) return;
  await queryInterface.addColumn(table, column, definition);
};

const removeColumnIfPresent = async (queryInterface, table, column) => {
  if (!(await queryInterface.describeTable(table))[column]) return;
  await queryInterface.removeColumn(table, column);
};

export async function up({ context: queryInterface }) {
  for (const table of ["articles", "schemes"]) {
    await addColumnIfMissing(queryInterface, table, "pdf_url", { type: DataTypes.STRING(500), allowNull: true });
  }
}

export async function down({ context: queryInterface }) {
  for (const table of ["articles", "schemes"]) await removeColumnIfPresent(queryInterface, table, "pdf_url");
}
