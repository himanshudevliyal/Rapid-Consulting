"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import ImageArrayUploader from "@/components/image-array-uploader";

export default function ProductGalleryForm() {
  const { register, control } = useFormContext();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="gallery.heading">Heading</Label>
        <Input
          id="gallery.heading"
          {...register("gallery.heading")}
          placeholder="e.g. Product Gallery"
        />
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <Controller
          control={control}
          name="gallery.images"
          render={({ field }) => (
            <ImageArrayUploader value={field.value} onChange={field.onChange} />
          )}
        />
      </div>
    </div>
  );
}
