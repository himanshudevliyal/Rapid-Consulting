"use strict";

import { DataTypes } from "sequelize";

// Everything the website needs to stop carrying content of its own:
//  - industries get a full page (heading, intro, body, picture, SEO, the
//    services and schemes shown on it);
//  - articles can be a "guide" (type = "guide") - same editor, own URL;
//  - schemes can be marked featured (the few shown on the home page).
export async function up({ context: queryInterface }) {
  const industry = {
    h1: { type: DataTypes.STRING(255), allowNull: true },
    meta_title: { type: DataTypes.STRING(255), allowNull: true },
    meta_description: { type: DataTypes.TEXT, allowNull: true },
    intro: { type: DataTypes.TEXT, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: true },
    image: { type: DataTypes.STRING(500), allowNull: true },
    note: { type: DataTypes.TEXT, allowNull: true },
    service_slugs: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: [] },
    scheme_slugs: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: [] },
  };
  for (const [name, definition] of Object.entries(industry)) {
    await queryInterface.addColumn("industries", name, definition);
  }

  await queryInterface.addColumn("articles", "type", {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "article",
  });
  await queryInterface.addIndex("articles", ["type"], { name: "articles_type_idx" });

  await queryInterface.addColumn("schemes", "is_featured", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.removeColumn("schemes", "is_featured");
  await queryInterface.removeIndex("articles", "articles_type_idx");
  await queryInterface.removeColumn("articles", "type");
  for (const name of [
    "scheme_slugs", "service_slugs", "note", "image", "content",
    "intro", "meta_description", "meta_title", "h1",
  ]) {
    await queryInterface.removeColumn("industries", name);
  }
}
