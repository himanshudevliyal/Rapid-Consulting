"use strict";

export async function up({ context: queryInterface }) {
  await queryInterface.renameColumn("schemes", "name", "title");
}

export async function down({ context: queryInterface }) {
  await queryInterface.renameColumn("schemes", "title", "name");
}