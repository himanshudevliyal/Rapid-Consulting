"use strict";

import { DataTypes } from "sequelize";

// Round 2 (October 2026):
//  1. users.role gains the value "editor" (can edit site pages, cannot publish).
//  2. articles, schemes, case_studies: review_status
//     (none | assigned | pending | completed) - recorded separately from the
//     reviewer and the review date.
//
// Safe to run again: every step checks first.
//
// Note on (1): ALTER TYPE ... ADD VALUE is run on its own connection with no
// surrounding transaction (Umzug does not open one), which is what Postgres
// needs on older versions. The new value is not used in this migration.

const tableExists = async (queryInterface, table) => {
  const tables = await queryInterface.showAllTables();
  return tables.some((entry) => (typeof entry === "string" ? entry : entry.tableName) === table);
};

const addColumnIfMissing = async (queryInterface, table, column, definition) => {
  if (!(await tableExists(queryInterface, table))) return;
  if ((await queryInterface.describeTable(table))[column]) return;
  await queryInterface.addColumn(table, column, definition);
};

const removeColumnIfPresent = async (queryInterface, table, column) => {
  if (!(await tableExists(queryInterface, table))) return;
  if (!(await queryInterface.describeTable(table))[column]) return;
  await queryInterface.removeColumn(table, column);
};

export async function up({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;

  // 1. "editor" role ---------------------------------------------------------
  if (await tableExists(queryInterface, "users")) {
    const [types] = await sequelize.query(
      `SELECT t.typname AS name, t.typtype AS kind
         FROM pg_attribute a
         JOIN pg_class c ON c.oid = a.attrelid
         JOIN pg_type t ON t.oid = a.atttypid
        WHERE c.relname = 'users'
          AND a.attname = 'role'
          AND a.attnum > 0
          AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())`,
    );
    const roleType = types[0];
    if (roleType && roleType.kind === "e") {
      // The name comes from the catalog; quote it as an identifier.
      const name = String(roleType.name).replace(/"/g, '""');
      await sequelize.query(`ALTER TYPE "${name}" ADD VALUE IF NOT EXISTS 'editor'`);
    } else {
      console.log("users.role is not an enum here; nothing to add for the editor role");
    }
  }

  // 2. review_status ------------------------------------------------------------
  for (const table of ["articles", "schemes", "case_studies"]) {
    await addColumnIfMissing(queryInterface, table, "review_status", {
      type: DataTypes.STRING(20),
      allowNull: true,
    });
  }
}

export async function down({ context: queryInterface }) {
  for (const table of ["case_studies", "schemes", "articles"]) {
    await removeColumnIfPresent(queryInterface, table, "review_status");
  }
  // A value cannot be removed from a Postgres enum, so "editor" stays in
  // users.role. Nothing uses it once the editors are moved to another role:
  //   UPDATE users SET role = 'user' WHERE role = 'editor';
  console.log("users.role keeps the 'editor' value (Postgres cannot drop an enum value)");
}
