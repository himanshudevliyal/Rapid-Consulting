"use client";
import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";
import config from "@/config";
import axios from "axios";
import { ImageUpIcon, Loader2, XIcon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// value: string[] of already-uploaded image URLs
// onChange: (nextArray) => void
export default function ImageArrayUploader({ value = [], onChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError(null);
    setIsUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
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
        if (url) uploaded.push(url);
      }
      onChange([...(value || []), ...uploaded]);
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async (src) => {
    onChange((value || []).filter((i) => i !== src));
    try {
      await http().delete(`${endpoints.files.getFiles}?file_path=${src}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
        {(value || []).map((src, index) => (
          <div
            key={index}
            className="bg-accent relative aspect-square w-24 rounded-md"
          >
            <Image
              src={`${config.file_base}/${src}`}
              width={200}
              height={200}
              className="size-full rounded-[inherit] object-cover"
              alt={`image-${index}`}
              unoptimized
            />
            <Button
              type="button"
              onClick={() => handleRemove(src)}
              size="icon"
              className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
              aria-label="Remove image"
            >
              <XIcon className="size-3.5" />
            </Button>
          </div>
        ))}

        <label className="border-input hover:bg-accent/50 relative flex aspect-square w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-center">
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImageUpIcon className="size-5 opacity-60" />
          )}
          <span className="text-muted-foreground text-[10px]">Add</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleAdd}
            disabled={isUploading}
          />
        </label>
      </div>
      {error && <span className="text-destructive text-xs">{error}</span>}
    </div>
  );
}
