"use strict";

import { DataTypes } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("users", "gstin", { type: DataTypes.STRING });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("users", "gstin");
};
