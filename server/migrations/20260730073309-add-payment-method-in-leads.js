"use strict";

import { DataTypes } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("orders", "payment_method", {
    type: DataTypes.STRING,
    allowNull: false,
  });

  await queryInterface.addIndex("orders", ["payment_method"]);
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.removeIndex("orders", ["payment_method"]);
  await queryInterface.removeColumn("orders", "payment_method");
};
