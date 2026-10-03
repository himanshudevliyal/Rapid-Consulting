"use strict";

import { DataTypes } from "sequelize";
import constants from "../app/lib/constants/index.js";

// Services are language-neutral records (identity, URL, relationships,
// ordering). Everything a visitor reads lives in service_translations, one
// row per locale, so a new language never needs a schema change.
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
      constants.models.SERVICE_TABLE,
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        // Stable content identity (e.g. "D077"). Relationships use this, not
        // the slug, so a URL change never breaks related-service links.
        code: { type: DataTypes.STRING(32), allowNull: false, unique: true },
        slug: { type: DataTypes.TEXT, allowNull: false, unique: true },
        // service | service-family | additional-service | service-index
        type: {
          type: DataTypes.STRING(40),
          allowNull: false,
          defaultValue: "service",
        },
        // Code of the parent service family (e.g. "S02"), null for families.
        family_code: { type: DataTypes.STRING(32), allowNull: true },
        icon: { type: DataTypes.STRING(80), allowNull: true },
        pictures: { type: DataTypes.JSONB, defaultValue: [] },
        // Codes of explicitly related pages, in editorial order.
        related_codes: { type: DataTypes.JSONB, defaultValue: [] },
        // Earlier public URLs of this service, kept for redirects/migration.
        legacy_urls: { type: DataTypes.JSONB, defaultValue: [] },
        sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction: t },
    );

    await queryInterface.addIndex(constants.models.SERVICE_TABLE, ["type"], {
      transaction: t,
    });
    await queryInterface.addIndex(
      constants.models.SERVICE_TABLE,
      ["family_code"],
      { transaction: t },
    );

    await queryInterface.createTable(
      constants.models.SERVICE_TRANSLATION_TABLE,
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        service_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: constants.models.SERVICE_TABLE,
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        locale: { type: DataTypes.STRING(10), allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        h1: { type: DataTypes.TEXT, allowNull: true },
        eyebrow: { type: DataTypes.STRING, allowNull: true },
        short_description: { type: DataTypes.TEXT, allowNull: true },
        intro_html: { type: DataTypes.TEXT, allowNull: true },
        // Ordered page sections: [{ key, title, nav_label, role, html,
        // intro_html, items: [{ key, title, html }], outro_html }]
        sections: { type: DataTypes.JSONB, defaultValue: [] },
        source_urls: { type: DataTypes.JSONB, defaultValue: [] },
        status: {
          type: DataTypes.STRING(40),
          allowNull: false,
          defaultValue: "draft",
        },
        review_label: { type: DataTypes.STRING(80), allowNull: true },
        meta_title: { type: DataTypes.TEXT },
        meta_description: { type: DataTypes.TEXT },
        meta_keywords: { type: DataTypes.TEXT },
        og_image: { type: DataTypes.TEXT },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction: t },
    );

    await queryInterface.addIndex(
      constants.models.SERVICE_TRANSLATION_TABLE,
      ["service_id", "locale"],
      { unique: true, transaction: t },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable(constants.models.SERVICE_TRANSLATION_TABLE);
  await queryInterface.dropTable(constants.models.SERVICE_TABLE);
}
