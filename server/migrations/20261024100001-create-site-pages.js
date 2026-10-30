"use strict";

import { DataTypes, literal } from "sequelize";

// Round 2 (October 2026): modular page builder.
//   site_pages          - pages built from sections (one row per language version)
//   site_page_revisions - history of each page (the newest 50 are kept)
//   site_settings       - small shared settings, e.g. the site navigation
//
// Safe to run on a database where some of this already exists (for example
// tables the server created itself on start-up): every step checks first and
// only adds what is missing.

const tableExists = async (queryInterface, table) => {
  const tables = await queryInterface.showAllTables();
  return tables.some((entry) => (typeof entry === "string" ? entry : entry.tableName) === table);
};

const columnsOf = async (queryInterface, table) => queryInterface.describeTable(table);

const addColumnIfMissing = async (queryInterface, table, column, definition) => {
  if (!(await tableExists(queryInterface, table))) return;
  if ((await columnsOf(queryInterface, table))[column]) return;
  await queryInterface.addColumn(table, column, definition);
};

const addIndexIfMissing = async (queryInterface, table, fields, options) => {
  if (!(await tableExists(queryInterface, table))) return;
  const indexes = await queryInterface.showIndex(table);
  if (indexes.some((index) => index.name === options.name)) return;
  await queryInterface.addIndex(table, fields, options);
};

const stamps = {
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
};

const emptyList = () => literal("'[]'::jsonb");

// Every column of site_pages except the primary key (also used to add what a
// partly created table is missing).
const SITE_PAGE_COLUMNS = {
  page_key: { type: DataTypes.STRING(40), allowNull: false },
  group_id: { type: DataTypes.UUID, allowNull: false },
  template: { type: DataTypes.STRING(20), allowNull: false },
  locale: { type: DataTypes.STRING(5), allowNull: false },
  path: { type: DataTypes.STRING(300), allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  h1: { type: DataTypes.STRING(300), allowNull: true },
  meta_title: { type: DataTypes.STRING(255), allowNull: true },
  meta_description: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "draft" },
  translation_status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "missing" },
  sections: { type: DataTypes.JSONB, allowNull: false, defaultValue: emptyList() },
  published_sections: { type: DataTypes.JSONB, allowNull: true },
  published_meta: { type: DataTypes.JSONB, allowNull: true },
  published_at: { type: DataTypes.DATE, allowNull: true },
  version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  has_unpublished_changes: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  created_by: { type: DataTypes.UUID, allowNull: true },
  updated_by: { type: DataTypes.UUID, allowNull: true },
  ...stamps,
};

export async function up({ context: queryInterface }) {
  // 1. site_pages -------------------------------------------------------------
  if (!(await tableExists(queryInterface, "site_pages"))) {
    await queryInterface.createTable("site_pages", {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      ...SITE_PAGE_COLUMNS,
    });
  } else {
    for (const [name, definition] of Object.entries(SITE_PAGE_COLUMNS)) {
      // A column added to a table that already has rows cannot be NOT NULL
      // without a default; page_key / group_id / template / locale / path /
      // title would only be missing on a hand-made table, so allow null there.
      const safe = definition.allowNull === false && definition.defaultValue === undefined
        ? { ...definition, allowNull: true }
        : definition;
      await addColumnIfMissing(queryInterface, "site_pages", name, safe);
    }
  }
  await addIndexIfMissing(queryInterface, "site_pages", ["page_key"], {
    name: "site_pages_page_key_key",
    unique: true,
  });
  await addIndexIfMissing(queryInterface, "site_pages", ["locale", "path"], {
    name: "site_pages_locale_path_key",
    unique: true,
  });
  await addIndexIfMissing(queryInterface, "site_pages", ["group_id", "locale"], {
    name: "site_pages_group_locale_key",
    unique: true,
  });
  await addIndexIfMissing(queryInterface, "site_pages", ["status"], { name: "site_pages_status_idx" });
  await addIndexIfMissing(queryInterface, "site_pages", ["template"], { name: "site_pages_template_idx" });

  // 2. site_page_revisions --------------------------------------------------------
  if (!(await tableExists(queryInterface, "site_page_revisions"))) {
    await queryInterface.createTable("site_page_revisions", {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      site_page_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "site_pages", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      version: { type: DataTypes.INTEGER, allowNull: false },
      action: { type: DataTypes.STRING(20), allowNull: false },
      note: { type: DataTypes.TEXT, allowNull: true },
      snapshot: { type: DataTypes.JSONB, allowNull: false, defaultValue: literal("'{}'::jsonb") },
      created_by: { type: DataTypes.UUID, allowNull: true },
      created_by_name: { type: DataTypes.STRING(255), allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    });
  }
  await addIndexIfMissing(queryInterface, "site_page_revisions", ["site_page_id", "created_at"], {
    name: "site_page_revisions_page_created_idx",
  });

  // 3. site_settings -------------------------------------------------------------------
  if (!(await tableExists(queryInterface, "site_settings"))) {
    await queryInterface.createTable("site_settings", {
      key: { type: DataTypes.STRING(100), primaryKey: true },
      value: { type: DataTypes.JSONB, allowNull: false, defaultValue: literal("'{}'::jsonb") },
      updated_by: { type: DataTypes.UUID, allowNull: true },
      ...stamps,
    });
  }
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable("site_page_revisions");
  await queryInterface.dropTable("site_pages");
  await queryInterface.dropTable("site_settings");
}
