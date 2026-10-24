"use strict";

import { DataTypes } from "sequelize";

// 1. Service / callback enquiries (table `enquiries`) also store which page the
//    form was on (address) and the service or product it was about.
//    page_title and page_id (page / service code) already exist.
// 2. Contact Us submissions get their own table `contact_enquiries`.
export async function up({ context: queryInterface }) {
  await queryInterface.addColumn("enquiries", "page_url", {
    type: DataTypes.STRING(500),
    allowNull: true,
  });
  await queryInterface.addColumn("enquiries", "service_name", {
    type: DataTypes.STRING(255),
    allowNull: true,
  });
  await queryInterface.addIndex("enquiries", ["page_id"]);

  await queryInterface.createTable("contact_enquiries", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(200), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    location: { type: DataTypes.STRING(200), allowNull: true },
    subject: { type: DataTypes.STRING(255), allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    // Where the form was submitted from.
    page_title: { type: DataTypes.STRING(255), allowNull: true },
    page_url: { type: DataTypes.STRING(500), allowNull: true },
    page_id: { type: DataTypes.STRING(100), allowNull: true },
    source: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: "contact-page",
    },
    status: {
      type: DataTypes.ENUM("new", "in-progress", "resolved", "spam"),
      allowNull: false,
      defaultValue: "new",
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
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

  await queryInterface.addIndex("contact_enquiries", ["status"]);
  await queryInterface.addIndex("contact_enquiries", ["created_at"]);
  await queryInterface.addIndex("contact_enquiries", ["email"]);
  await queryInterface.addIndex("contact_enquiries", ["phone"]);
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable("contact_enquiries");
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_contact_enquiries_status"');
  await queryInterface.removeIndex("enquiries", ["page_id"]);
  await queryInterface.removeColumn("enquiries", "service_name");
  await queryInterface.removeColumn("enquiries", "page_url");
}
