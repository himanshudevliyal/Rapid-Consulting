"use strict";

import controller from "./controller.js";

import jwtVerify from "../../helpers/auth.js";
import { authorize } from "../../helpers/authorize.js";

// Reading a file stays public (it is limited to public/); uploading and
// deleting need a signed-in admin or editor (the dashboard sends its token).
const signedIn = {
  onRequest: jwtVerify.verifyToken,
  preHandler: authorize("admin", "editor"),
};

export default async (fastify, options) => {
  fastify.get("/", {}, controller.getFile);
  fastify.delete("/", signedIn, controller.deleteFile);
  fastify.post("/files", signedIn, controller.uploadFiles);
  //   fastify.post("/video", {}, controller.uploadVideo);
  //   fastify.delete("/video", {}, controller.deleteVideoFile);
};
