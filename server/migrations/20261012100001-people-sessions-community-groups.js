"use strict";

import { DataTypes, literal } from "sequelize";
import slugify from "slugify";

// Website design revision (October 2026):
//  1. advisers (the team): profile slug, expertise, is_placeholder. Existing
//     people get a slug made from their name.
//  2. articles, schemes, case_studies: author_id / reviewer_id (a team member)
//     and reviewed_at.
//  3. schemes: quick facts (assistance_type, relevant_activity, policy_period,
//     application_window, status).
//  4. case_studies: location, sector, rapid_role and the evidence block
//     (proof_image, proof_caption, milestone_label / date, quote).
//  5. New tables: sessions (expert sessions / webinars) and community_groups.
//
// Safe to run on a database where some of this already exists (for example
// tables the server created itself on start-up): every step checks first.

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

const removeColumnIfPresent = async (queryInterface, table, column) => {
  if (!(await tableExists(queryInterface, table))) return;
  if (!(await columnsOf(queryInterface, table))[column]) return;
  await queryInterface.removeColumn(table, column);
};

const addIndexIfMissing = async (queryInterface, table, fields, options) => {
  if (!(await tableExists(queryInterface, table))) return;
  const indexes = await queryInterface.showIndex(table);
  if (indexes.some((index) => index.name === options.name)) return;
  await queryInterface.addIndex(table, fields, options);
};

const removeIndexIfPresent = async (queryInterface, table, name) => {
  if (!(await tableExists(queryInterface, table))) return;
  const indexes = await queryInterface.showIndex(table);
  if (!indexes.some((index) => index.name === name)) return;
  await queryInterface.removeIndex(table, name);
};

const adviserRef = {
  type: DataTypes.UUID,
  allowNull: true,
  references: { model: "advisers", key: "id" },
  onUpdate: "CASCADE",
  onDelete: "SET NULL",
};

const stamps = {
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
};

export async function up({ context: queryInterface }) {
  // 1. Advisers ----------------------------------------------------------
  await addColumnIfMissing(queryInterface, "advisers", "slug", {
    type: DataTypes.STRING(200),
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, "advisers", "expertise", {
    type: DataTypes.TEXT,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, "advisers", "is_placeholder", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  // Slugs for the people that already exist (name-based, made unique).
  if (await tableExists(queryInterface, "advisers")) {
    const sequelize = queryInterface.sequelize;
    const rows = await sequelize.query("SELECT id, name, slug FROM advisers ORDER BY created_at, id", {
      type: "SELECT",
    });
    const used = new Set(rows.map((row) => row.slug).filter(Boolean));
    for (const row of rows.filter((entry) => !entry.slug)) {
      const base = slugify(row.name || "", { lower: true, strict: true }) || "team-member";
      let slug = base;
      for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
      used.add(slug);
      await sequelize.query("UPDATE advisers SET slug = :slug WHERE id = :id", {
        replacements: { slug, id: row.id },
      });
    }
  }
  await addIndexIfMissing(queryInterface, "advisers", ["slug"], {
    name: "advisers_slug_key",
    unique: true,
  });

  // 2. Author / reviewer on content ----------------------------------------
  for (const table of ["articles", "schemes", "case_studies"]) {
    await addColumnIfMissing(queryInterface, table, "author_id", adviserRef);
    await addColumnIfMissing(queryInterface, table, "reviewer_id", adviserRef);
    await addColumnIfMissing(queryInterface, table, "reviewed_at", {
      type: DataTypes.DATEONLY,
      allowNull: true,
    });
    await addIndexIfMissing(queryInterface, table, ["author_id"], { name: `${table}_author_id_idx` });
    await addIndexIfMissing(queryInterface, table, ["reviewer_id"], { name: `${table}_reviewer_id_idx` });
  }

  // 3. Scheme quick facts ---------------------------------------------------
  const schemeFacts = {
    assistance_type: { type: DataTypes.STRING(255), allowNull: true },
    relevant_activity: { type: DataTypes.STRING(255), allowNull: true },
    policy_period: { type: DataTypes.STRING(255), allowNull: true },
    application_window: { type: DataTypes.STRING(255), allowNull: true },
    // open | upcoming | closed | historical
    status: { type: DataTypes.STRING(20), allowNull: true },
  };
  for (const [name, definition] of Object.entries(schemeFacts)) {
    await addColumnIfMissing(queryInterface, "schemes", name, definition);
  }

  // 4. Case study details and evidence ---------------------------------------
  const caseFields = {
    location: { type: DataTypes.STRING(200), allowNull: true },
    sector: { type: DataTypes.STRING(200), allowNull: true },
    rapid_role: { type: DataTypes.TEXT, allowNull: true },
    proof_image: { type: DataTypes.STRING(500), allowNull: true },
    proof_caption: { type: DataTypes.STRING(500), allowNull: true },
    milestone_label: { type: DataTypes.STRING(200), allowNull: true },
    milestone_date: { type: DataTypes.DATEONLY, allowNull: true },
    quote_text: { type: DataTypes.TEXT, allowNull: true },
    quote_attribution: { type: DataTypes.STRING(255), allowNull: true },
  };
  for (const [name, definition] of Object.entries(caseFields)) {
    await addColumnIfMissing(queryInterface, "case_studies", name, definition);
  }

  // 5a. Sessions -----------------------------------------------------------------
  if (!(await tableExists(queryInterface, "sessions"))) {
    await queryInterface.createTable("sessions", {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      slug: { type: DataTypes.STRING(300), allowNull: false, unique: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      topic: { type: DataTypes.STRING(255), allowNull: true },
      audience: { type: DataTypes.STRING(255), allowNull: true },
      summary: { type: DataTypes.TEXT, allowNull: true },
      speaker_name: { type: DataTypes.STRING(160), allowNull: true },
      speaker_title: { type: DataTypes.STRING(200), allowNull: true },
      starts_at: { type: DataTypes.DATE, allowNull: true },
      duration_minutes: { type: DataTypes.INTEGER, allowNull: true },
      registration_url: { type: DataTypes.STRING(500), allowNull: true },
      registration_open: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      recording_url: { type: DataTypes.STRING(500), allowNull: true },
      related_resources: { type: DataTypes.TEXT, allowNull: true },
      cover_image: { type: DataTypes.STRING(500), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      ...stamps,
    });
  }
  await addIndexIfMissing(queryInterface, "sessions", ["starts_at"], { name: "sessions_starts_at_idx" });
  await addIndexIfMissing(queryInterface, "sessions", ["is_active"], { name: "sessions_is_active_idx" });

  // 5b. Community groups ----------------------------------------------------------
  if (!(await tableExists(queryInterface, "community_groups"))) {
    await queryInterface.createTable("community_groups", {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(200), allowNull: false },
      audience: { type: DataTypes.STRING(255), allowNull: true },
      updates: { type: DataTypes.TEXT, allowNull: true },
      cadence: { type: DataTypes.STRING(200), allowNull: true },
      join_url: { type: DataTypes.STRING(500), allowNull: true },
      placements: { type: DataTypes.JSONB, allowNull: false, defaultValue: literal("'[]'::jsonb") },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      ...stamps,
    });
  }
  await addIndexIfMissing(queryInterface, "community_groups", ["is_active"], {
    name: "community_groups_is_active_idx",
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable("community_groups");
  await queryInterface.dropTable("sessions");

  for (const name of [
    "quote_attribution", "quote_text", "milestone_date", "milestone_label",
    "proof_caption", "proof_image", "rapid_role", "sector", "location",
  ]) {
    await removeColumnIfPresent(queryInterface, "case_studies", name);
  }
  for (const name of ["status", "application_window", "policy_period", "relevant_activity", "assistance_type"]) {
    await removeColumnIfPresent(queryInterface, "schemes", name);
  }
  for (const table of ["case_studies", "schemes", "articles"]) {
    await removeIndexIfPresent(queryInterface, table, `${table}_reviewer_id_idx`);
    await removeIndexIfPresent(queryInterface, table, `${table}_author_id_idx`);
    for (const name of ["reviewed_at", "reviewer_id", "author_id"]) {
      await removeColumnIfPresent(queryInterface, table, name);
    }
  }

  await removeIndexIfPresent(queryInterface, "advisers", "advisers_slug_key");
  for (const name of ["is_placeholder", "expertise", "slug"]) {
    await removeColumnIfPresent(queryInterface, "advisers", name);
  }
}
