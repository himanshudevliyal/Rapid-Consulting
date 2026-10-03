"use strict";

import fp from "fastify-plugin";

export default fp(async function initializeTenantContext(fastify) {
  fastify.addHook("onRequest", async (req, reply) => {
    if (!req.user_data?.role === "super_admin") {
      return;
    }

    const sequelize = fastify.sequelize; // inject sequelize in fastify instance

    const transaction = await sequelize.transaction();

    try {
      await sequelize.query(`SET app.current_organization_id = :orgId`, {
        replacements: { orgId: req.user.organization_id },
        transaction,
      });

      req.dbTransaction = transaction;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  });

  fastify.addHook("onResponse", async (req) => {
    if (req.dbTransaction) {
      await req.dbTransaction.commit();
    }
  });

  fastify.addHook("onError", async (req) => {
    if (req.dbTransaction) {
      await req.dbTransaction.rollback();
    }
  });
});
