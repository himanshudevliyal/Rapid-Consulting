"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import StringArrayField from "@/components/string-array-field";
import FileUrlUploader from "@/components/file-url-uploader";

export default function ProductOverviewForm() {
  const { register, control } = useFormContext();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-full">
        <Label htmlFor="overview.heading">Heading</Label>
        <Input
          id="overview.heading"
          {...register("overview.heading")}
          placeholder="e.g. Product Overview"
        />
      </div>

      <div className="col-span-full space-y-2">
        <Label>Descriptions</Label>
        <StringArrayField
          control={control}
          name="overview.descriptions"
          placeholder="Enter a description"
          addLabel="Add description"
        />
      </div>

      <div className="col-span-full space-y-2">
        <Label>Image</Label>
        <Controller
          control={control}
          name="overview.image"
          render={({ field }) => (
            <FileUrlUploader
              value={field.value}
              onUploaded={field.onChange}
              accept="image/*"
              label="Upload image"
            />
          )}
        />
      </div>

      <div>
        <Label htmlFor="overview.features.heading">Features heading</Label>
        <Input
          id="overview.features.heading"
          {...register("overview.features.heading")}
          placeholder="e.g. Features & Options"
        />
      </div>

      <div className="col-span-full space-y-2">
        <Label>Features list</Label>
        <StringArrayField
          control={control}
          name="overview.features.list"
          placeholder="Enter a feature"
          addLabel="Add feature"
        />
      </div>
    </div>
  );
}