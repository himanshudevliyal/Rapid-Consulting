"use strict";

import constants from "../app/lib/constants/index.js";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    const tableName = constants.models.CATEGORY_TABLE;

    // Add parent_id only if it does not already exist
    await queryInterface.sequelize.query(
      `ALTER TABLE "${tableName}"
       ADD COLUMN IF NOT EXISTS "parent_id"
       UUID
       REFERENCES "${tableName}" ("id")
       ON DELETE CASCADE
       ON UPDATE CASCADE;`,
      { transaction: t },
    );

    // Add index only if it does not already exist
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS "${tableName}_parent_id_idx"
       ON "${tableName}" ("parent_id");`,
      { transaction: t },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    const tableName = constants.models.CATEGORY_TABLE;

    // Remove index safely
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS "${tableName}_parent_id_idx";`,
      { transaction: t },
    );

    // Remove parent_id safely
    await queryInterface.sequelize.query(
      `ALTER TABLE "${tableName}"
       DROP COLUMN IF EXISTS "parent_id";`,
      { transaction: t },
    );
  });
}