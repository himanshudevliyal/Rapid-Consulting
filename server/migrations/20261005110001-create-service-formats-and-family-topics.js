"use strict";

import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import constants from "../app/lib/constants/index.js";

// Two admin-managed option lists used by the service form:
//   service_formats        -> the value stored in services.type
//   service_family_topics  -> the value stored in services.family_code
// The reference rows below are the values the website already uses, so the
// existing services keep working without any data change.

const FORMATS = [
  {
    code: "service",
    name: "Service",
    description: "A single service page, for example Fire NOC.",
    sort_order: 10,
    is_system: true,
  },
  {
    code: "service-family",
    name: "Service family",
    description: "A topic landing page that groups related services.",
    sort_order: 20,
    is_system: true,
  },
  {
    code: "additional-service",
    name: "Additional service",
    description: "A supporting service shown alongside the main services.",
    sort_order: 30,
    is_system: true,
  },
  {
    code: "service-index",
    name: "Service index",
    description: "The /services listing page. It is not shown in service lists.",
    sort_order: 40,
    is_system: true,
  },
];

const FAMILY_TOPICS = [
  { code: "S01", name: "Subsidies & Incentives", icon: "hand-coins", sort_order: 10 },
  { code: "S02", name: "Statutory Approvals", icon: "stamp", sort_order: 20 },
  { code: "S03", name: "Licences & Certifications", icon: "certificate", sort_order: 30 },
  { code: "S04", name: "Industrial Insurance", icon: "shield-check", sort_order: 40 },
  { code: "S05", name: "Finance & Other Services", icon: "bank", sort_order: 50 },
];

const lookupColumns = () => ({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  // Stable value stored on the service. It never changes after creation.
  code: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});

export async function up({ context: queryInterface }) {
  const now = new Date();

  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.SERVICE_FORMAT_TABLE,
      {
        ...lookupColumns(),
        // Built-in formats the website depends on cannot be deleted.
        is_system: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      },
      { transaction: t },
    );

    await queryInterface.createTable(
      constants.models.SERVICE_FAMILY_TOPIC_TABLE,
      {
        ...lookupColumns(),
        icon: { type: DataTypes.STRING(80), allowNull: true },
      },
      { transaction: t },
    );

    await queryInterface.bulkInsert(
      constants.models.SERVICE_FORMAT_TABLE,
      FORMATS.map((row) => ({ id: uuidv4(), is_active: true, created_at: now, updated_at: now, ...row })),
      { transaction: t, ignoreDuplicates: true },
    );

    await queryInterface.bulkInsert(
      constants.models.SERVICE_FAMILY_TOPIC_TABLE,
      FAMILY_TOPICS.map((row) => ({
        id: uuidv4(),
        description: null,
        is_active: true,
        created_at: now,
        updated_at: now,
        ...row,
      })),
      { transaction: t, ignoreDuplicates: true },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable(constants.models.SERVICE_FAMILY_TOPIC_TABLE);
  await queryInterface.dropTable(constants.models.SERVICE_FORMAT_TABLE);
}
