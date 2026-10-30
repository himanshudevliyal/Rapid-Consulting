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

// Same as authorize(), but with a message that says what is not allowed and
// what to do instead (used where the role matrix has a reason people should see).
export const requireRoles =
  (allowedRoles, message) =>
  async (req, reply) => {
    const user = req.user_data;

    if (!user) {
      logUnauthorized(req);
      return reply.code(401).send({ status: false, message: "Unauthorized" });
    }

    if (!allowedRoles.includes(user.role)) {
      logForbidden(req, user, allowedRoles);
      return reply.code(403).send({ status: false, error: "Forbidden", message });
    }
  };

// Role "editor" (page-builder editors) may use the Site pages module, and may
// only READ the content lists they need to link records into a page (pickers)
// plus their own profile. Everything else under /v1 (users, enquiries, orders,
// settings, writes to articles / schemes / cases ...) stays closed to them,
// exactly as for any module that is not theirs. Other roles are not affected.
const EDITOR_FULL = new Set(["site-pages"]);
const EDITOR_READ_ONLY = new Set([
  "articles",
  "case-studies",
  "schemes",
  "advisers",
  "services",
  "industries",
  "categories",
  "sub-categories",
  "sessions",
  "community-groups",
]);

// Everything under the signed-in /v1 API is the admin panel: only "admin" and
// "editor" accounts may use it. Without this, any valid token (for example a
// self-registered "user") could create, edit and delete content.
export const staffOnly = async (req, reply) => {
  const user = req.user_data;
  if (!user) {
    logUnauthorized(req);
    return reply.code(401).send({ status: false, message: "Unauthorized" });
  }
  if (user.role !== "admin" && user.role !== "editor") {
    logForbidden(req, user, ["admin", "editor"]);
    return reply.code(403).send({ status: false, message: "Forbidden: unauthorized access!" });
  }
};

export const editorBoundary = async (req, reply) => {
  const user = req.user_data;
  if (!user || user.role !== "editor") return;

  // "/v1/<area>/<second>?query" -> area, second
  const [, , area, second] = req.url.split("?")[0].split("/");
  const method = req.method.toUpperCase();
  const readOnly = method === "GET" || method === "HEAD";

  if (EDITOR_FULL.has(area)) return;
  if (readOnly && EDITOR_READ_ONLY.has(area)) return;
  if (readOnly && area === "users" && second === "me") return;

  logForbidden(req, user, ["admin"]);
  return reply.code(403).send({
    status: false,
    message: "Forbidden: the editor role can edit site pages and read content lists only.",
  });
};

export default authorize;
