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
    return res.send(error);
  }
};

const getFile = async (req, res) => {
  if (!req.query || !req.query.file_path) {
    return res.send({
      message: "file_path is required parameter",
    });
  }

  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirPath = dirname(currentFilePath);
  const publicPath = path.join(
    currentDirPath,
    "../../../public",
    req.query.file_path
  );

  if (!fs.existsSync(publicPath)) {
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
      return res.send({
        message: "file_path is required parameter",
      });
    }

    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDirPath = dirname(currentFilePath);
    const publicPath = path.join(
      currentDirPath,
      "../../..",
      req.query.file_path
    );
    if (fs.existsSync(publicPath)) {
      fs.unlinkSync(publicPath);
      res.send({ message: "File deleted" });
    }
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
