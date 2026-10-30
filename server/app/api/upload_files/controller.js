"use strict";

import fs from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { saveFile } from "../../utils/file.js";

const uploadFiles = async (req, res) => {
  let paths = [];
  try {
    const files = req.files();
    for await (const file of files) {
      paths.push(await saveFile(file));
    }
    return res.send({
      path: paths,
    });
  } catch (error) {
    console.log(error);
    return res.code(400).send({ message: error?.message || "Upload failed" });
  }
};

const PUBLIC_ROOT = path.resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../public"
);

// file_path is "public/images/x.webp" (what uploads return) or "images/x.webp".
// Returns the absolute path inside public/, or null when it points anywhere
// else ("../.env", absolute paths, …).
const resolvePublicPath = (filePath) => {
  const relative = String(filePath)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^public\//, "");
  const full = path.resolve(PUBLIC_ROOT, relative);
  return full.startsWith(PUBLIC_ROOT + path.sep) ? full : null;
};

const getFile = async (req, res) => {
  if (!req.query || !req.query.file_path) {
    return res.code(400).send({
      message: "file_path is required parameter",
    });
  }

  const publicPath = resolvePublicPath(req.query.file_path);

  if (!publicPath || !fs.existsSync(publicPath) || !fs.statSync(publicPath).isFile()) {
    console.log("file not found");
    return res.code(404).send({ message: "file not found" });
  }

  let mime = req.query.file_path.split(".").pop();
  if (["jpeg", "jpg", "png", "gif", "webp"].includes(mime)) {
    if (mime === "jpg") {
      res.type(`image/jpeg`);
    } else {
      res.type(`image/${mime}`);
    }
  }
  if (mime === "svg") {
    res.type("image/svg+xml");
  }
  if (["mp4", "mpeg", "ogg", "webm"].includes(mime)) {
    res.type(`video/${mime}`);
  }
  if (mime === "pdf") {
    res.type("application/pdf");
  }
  if (mime === "ppt") {
    res.type("application/vnd.ms-powerpoint");
  }

  if (mime === "docx") {
    res.type(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  }

  if (mime === "doc") {
    res.type("application/msword");
  }

  if (mime === "zip") {
    res.type("application/zip");
  }

  if (mime === "rar") {
    res.type("application/vnd.rar");
  }

  try {
    const filePath = await fs.readFileSync(publicPath);
    return res.send(filePath);
  } catch (error) {
    console.error({ error });
  }
};

const deleteFile = async (req, res) => {
  try {
    if (!req.query || !req.query.file_path) {
      return res.code(400).send({
        message: "file_path is required parameter",
      });
    }

    const publicPath = resolvePublicPath(req.query.file_path);
    if (!publicPath || !fs.existsSync(publicPath) || !fs.statSync(publicPath).isFile()) {
      return res.code(404).send({ message: "file not found" });
    }
    fs.unlinkSync(publicPath);
    return res.send({ message: "File deleted" });
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

export default {
  uploadFiles,
  getFile,
  deleteFile,
};
