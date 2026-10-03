import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGE_CONFIG = {
  maxWidth: 1600,
  maxHeight: 1600,
  webpQuality: 75,
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const getFileCategory = (mime) => {
  const ext = mime.split("/").pop().toLowerCase();

  if (["jpeg", "jpg", "png", "webp", "heic", "avif"].includes(ext))
    return { type: "image", ext };
  if (["mpeg", "mp3", "wav", "ogg"].includes(ext))
    return { type: "audio", ext };
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext))
    return { type: "document", ext };
  if (["zip", "rar", "7z", "x-zip-compressed"].includes(ext))
    return { type: "archive", ext: ext === "x-zip-compressed" ? "zip" : ext };

  return { type: "other", ext };
};

export const saveFile = async (file) => {
  if (file.file.truncated) {
    throw new Error("File size limit exceeded");
  }

  const buffer = await file.toBuffer();
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("File too large");
  }

  const { type, ext } = getFileCategory(file.mimetype);

  const folderMap = {
    image: "public/images",
    audio: "public/audio",
    document: "public/docs",
    archive: "public/archives",
    other: "public/files",
  };

  const folder = folderMap[type];
  fs.mkdirSync(folder, { recursive: true });

  const safeBaseName = file.filename
    .replace(/[\s'/]/g, "_")
    .toLowerCase()
    .replace(/\.[^.]+$/, "");

  let filename;
  let filePath;

  if (type === "image") {
    filename = `${Date.now()}_${safeBaseName}.webp`;
    filePath = path.join(folder, filename);
    console.log({ filePath });
    await sharp(buffer)
      .rotate()
      .resize({
        width: IMAGE_CONFIG.maxWidth,
        height: IMAGE_CONFIG.maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: IMAGE_CONFIG.webpQuality })
      .toFile(filePath);
  } else {
    filename = `${Date.now()}_${safeBaseName}.${ext}`;
    filePath = path.join(folder, filename);
    await fs.promises.writeFile(filePath, buffer);
  }

  const normalizedPath = filePath.replace(/\\/g, "/");
  return normalizedPath;

  return {
    path: normalizedPath,
    url: normalizedPath,
    type,
  };
};

export const deleteFile = async (filePath) => {
  const fullPath = path.resolve(filePath);

  try {
    await fs.promises.unlink(fullPath); // Delete the file from disk
    console.log(`File deleted: ${filePath}`);
  } catch (err) {
    console.error(`Failed to delete file: ${filePath}`, err);
    throw err; // Optionally, rethrow or log the error
  }
};
