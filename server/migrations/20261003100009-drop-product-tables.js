"use strict";

export async function up({ context: queryInterface }) {
  await queryInterface.dropTable("order_items", { cascade: true });
  await queryInterface.dropTable("payments", { cascade: true });
  await queryInterface.dropTable("orders", { cascade: true });
  await queryInterface.dropTable("carts", { cascade: true });
  await queryInterface.dropTable("inventories", { cascade: true });
  await queryInterface.dropTable("product_inquiries", { cascade: true });
  await queryInterface.dropTable("product_variants", { cascade: true });
  await queryInterface.dropTable("products", { cascade: true });
}

export async function down({ context: queryInterface }) {
  // Restore would require re-running original migrations — not practical
  throw new Error("Down migration not supported — restore from original migrations");
}