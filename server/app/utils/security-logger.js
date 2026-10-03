"use strict";

export const logUnauthorized = (req) => {
  req.server.log.warn(
    {
      route: req.routerPath,
      method: req.method,
      ip: req.ip,
    },
    "Unauthorized access attempt"
  );
};

export const logForbidden = (req, user, allowedRoles) => {
  req.server.log.warn(
    {
      userId: user?.id,
      role: user?.role,
      allowedRoles,
      route: req.routerPath,
      method: req.method,
      ip: req.ip,
    },
    "Forbidden access attempt"
  );
};
