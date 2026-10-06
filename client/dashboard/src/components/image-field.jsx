"use client";
import axios from "axios";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import config from "@/config";
import { cn } from "@/lib/utils";
import { endpoints } from "@/utils/endpoints";

const MAX_MB = 5;

// Address to show for a saved value: files uploaded through the API are saved
// as a path (public/images/…) served from the file base; a full URL is used as is.
export const imageSrc = (value) => {
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("/")) return value;
  return `${config.file_base}/${value}`;
};

// One image: upload, preview, replace, remove. `value` is the saved path or
// URL (empty when there is no image); `onChange` gets the new path, or "" when
// removed. A replaced or removed file is deleted by the server when the record
// is saved, so nothing is lost if the form is abandoned.
export default function ImageField({ value, onChange, disabled, className, hint }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [broken, setBroken] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (JPG, PNG or WebP).");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`The image is larger than ${MAX_MB} MB.`);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${config.api_base}${endpoints.files.upload}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      const path = response.data?.path?.[0];
      if (!path) throw new Error("No file path returned");
      setBroken(false);
      onChange(path);
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const src = imageSrc(value);

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative flex aspect-video w-full max-w-md items-center justify-center overflow-hidden rounded-lg border bg-muted/30",
          !src && "border-dashed",
        )}
      >
        {src && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="size-full object-cover" onError={() => setBroken(true)} />
        ) : (
          <div className="flex flex-col items-center gap-1 px-4 text-center text-sm text-muted-foreground">
            <ImageUp className="size-6 opacity-60" aria-hidden="true" />
            {src ? (
              <span className="break-all text-xs">Preview not available here: {value}</span>
            ) : (
              <span>No image yet</span>
            )}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-6 animate-spin" aria-label="Uploading" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Choose an image"
          disabled={disabled || uploading}
          onChange={(event) => upload(event.target.files?.[0])}
        />
        <Button type="button" variant="outline" size="sm" disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
          <ImageUp className="mr-2 size-4" /> {value ? "Replace image" : "Upload image"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600"
            disabled={disabled || uploading}
            onClick={() => {
              setBroken(false);
              onChange("");
            }}
          >
            <Trash2 className="mr-2 size-4" /> Remove
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">{hint ?? `JPG, PNG or WebP, up to ${MAX_MB} MB. It is resized and saved as WebP.`}</p>
    </div>
  );
}
