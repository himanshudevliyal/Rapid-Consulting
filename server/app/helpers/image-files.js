import { cleanupFiles } from "./cleanup-files.js";

// Files saved by the upload API live under public/ (e.g. public/images/x.webp).
// Anything else - a full URL, a /assets path - is not ours to delete.
const isStoredFile = (value) =>
  typeof value === "string" && value.startsWith("public/") && !value.includes("..");

// Delete the previous image file once a record points at a different one
// (or at none), so replaced and removed images do not pile up on disk.
export const removeReplacedImage = async (previous, next) => {
  if (isStoredFile(previous) && previous !== next) {
    await cleanupFiles([previous]);
  }
};
