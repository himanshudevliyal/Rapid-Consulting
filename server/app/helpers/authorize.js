"use strict";

import { logForbidden, logUnauthorized } from "../utils/security-logger.js";

export const authorize =
  (...allowedRoles) =>
  async (req, reply) => {
    const user = req.user_data;

    if (!user) {
      logUnauthorized(req);
      return reply.code(401).send({ status: false, message: "Unauthorized" });
    }

    if (!allowedRoles.includes(user.role)) {
      logForbidden(req, user, allowedRoles);
      return reply
        .code(403)
        .send({ status: false, message: "Forbidden: unauthorized access!" });
    }
  };

export default authorize;
