"use strict";

import { DataTypes } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("orders", "invoice_number", {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  });

  await queryInterface.addIndex("orders", ["invoice_number"]);
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.removeIndex("orders", ["invoice_number"]);
  await queryInterface.removeColumn("orders", "invoice_number");
};
