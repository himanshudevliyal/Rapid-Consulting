"use client";
import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";
import config from "@/config";
import axios from "axios";
import { FileIcon, Loader2, UploadIcon, XIcon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Uploads a single file (any type - pdf, zip, image, etc.) and hands back
// the resulting URL string via onUploaded. Mirrors image-array-uploader.jsx's
// tile layout exactly: the "Add" label+input tile is ALWAYS rendered (never
// swapped out based on `value`), and an uploaded file shows as a separate
// tile next to it - same structure that already works there.
export default function FileUrlUploader({
  value,
  onUploaded,
  accept,
  label = "Upload",
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const isImage = accept?.includes("image");

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        `${config.api_base}${endpoints.files.upload}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );
      const url = response.data?.path?.[0];
      onUploaded(url);
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async () => {
    if (value) {
      try {
        await http().delete(`${endpoints.files.getFiles}?file_path=${value}`);
      } catch (err) {
        console.error(err);
      }
    }
    onUploaded("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-4">
        {value && (
          <div className="bg-accent relative aspect-square w-24 rounded-md">
            {isImage ? (
              <Image
                src={`${config.file_base}/${value}`}
                width={200}
                height={200}
                className="size-full rounded-[inherit] object-cover"
                alt="file"
                unoptimized
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1 px-1 text-center">
                <FileIcon className="size-6 opacity-60" />
                <span className="text-muted-foreground w-full truncate text-[10px]">
                  {value.split("/").pop()}
                </span>
              </div>
            )}
            <Button
              type="button"
              onClick={handleRemove}
              size="icon"
              className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
              aria-label="Remove file"
            >
              <XIcon className="size-3.5" />
            </Button>
          </div>
        )}

        <label className="border-input hover:bg-accent/50 relative flex aspect-square w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-center">
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <UploadIcon className="size-5 opacity-60" />
          )}
          <span className="text-muted-foreground text-[10px]">
            {isUploading ? "Uploading..." : label}
          </span>
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={handleChange}
            disabled={isUploading}
          />
        </label>
      </div>

      {error && <span className="text-destructive text-xs">{error}</span>}
    </div>
  );
}