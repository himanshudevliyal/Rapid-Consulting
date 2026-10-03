import fp from "fastify-plugin";
import table from "../db/models.js";
import { StatusCodes } from "http-status-codes";

export default fp(async function orgContextPlugin(fastify) {
  if (!fastify.hasRequestDecorator("org")) {
    fastify.decorateRequest("org", null);
  }

  fastify.addHook("preHandler", async (request, reply) => {
    const user = request.user_data;

    if (!user) {
      return reply
        .code(StatusCodes.UNAUTHORIZED)
        .send({ status: false, message: "Unauthorized" });
    }

    if (user.role === "super_admin") {
      const orgId = request.headers["x-org-id"];
      request.org = orgId ? { id: orgId } : null;
      return;
    }

    if (!user.org_id) {
      return reply
        .code(StatusCodes.FORBIDDEN)
        .send({ status: false, message: "Organization missing" });
    }

    const userOrg = await table.UserOrganizationModel.exists(
      user.id,
      user.org_id
    );

    if (!userOrg) {
      return res
        .code(StatusCodes.FORBIDDEN)
        .send({ message: "Access denied to this organization" });
    }

    request.org = { id: user.org_id };
  });
});
