"use strict";

import { DataTypes } from "sequelize";

export async function up({ context: queryInterface }) {
  await queryInterface.createTable("jobs", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(300),
      allowNull: false,
      unique: true,
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    job_type: {
      type: DataTypes.ENUM("full-time", "part-time", "contract", "internship", "remote"),
      allowNull: false,
      defaultValue: "full-time",
    },
    experience: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responsibilities: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    closing_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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

  await queryInterface.addIndex("jobs", ["slug"]);
  await queryInterface.addIndex("jobs", ["is_active"]);
  await queryInterface.addIndex("jobs", ["closing_date"]);
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable("jobs");
}
