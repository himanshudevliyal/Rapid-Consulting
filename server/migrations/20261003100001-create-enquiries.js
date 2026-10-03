"use strict";

import { DataTypes } from "sequelize";

export async function up({ context: queryInterface }) {
  await queryInterface.createTable("enquiries", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    requirement: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    page_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    page_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: "contact-form",
    },
    status: {
      type: DataTypes.ENUM("new", "in-progress", "resolved", "spam"),
      allowNull: false,
      defaultValue: "new",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
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
  });

  await queryInterface.addIndex("enquiries", ["status"]);
  await queryInterface.addIndex("enquiries", ["source"]);
  await queryInterface.addIndex("enquiries", ["created_at"]);
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable("enquiries");
}
