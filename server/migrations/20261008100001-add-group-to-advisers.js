"use strict";

import { DataTypes } from "sequelize";

// Advisers are the people shown on the website's "About" page. `team_group`
// is the heading they appear under (Leadership, Experts, The Wider Team...).
export async function up({ context: queryInterface }) {
  await queryInterface.addColumn("advisers", "team_group", {
    type: DataTypes.STRING(100),
    allowNull: true,
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.removeColumn("advisers", "team_group");
}
