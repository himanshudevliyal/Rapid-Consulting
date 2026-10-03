"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import ImageArrayUploader from "@/components/image-array-uploader";
import StringArrayField from "@/components/string-array-field";

export default function ProductHeroForm() {
  const { register, control } = useFormContext();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="hero.heading">Heading</Label>
        <Input
          id="hero.heading"
          {...register("hero.heading")}
          placeholder="e.g. Stool | XD-CH-573BY"
        />
      </div>
      <div>
        <Label htmlFor="hero.subheading">Subheading</Label>
        <Input
          id="hero.subheading"
          {...register("hero.subheading")}
          placeholder="e.g. Ergonomic Bar Stool"
        />
      </div>

      <div className="col-span-full space-y-2">
        <Label>Descriptions</Label>
        <StringArrayField
          control={control}
          name="hero.descriptions"
          placeholder="e.g. Breathable mesh back for improved airflow..."
          addLabel="Add description"
        />
      </div>

      <div className="col-span-full space-y-2">
        <Label>Images</Label>
        <Controller
          control={control}
          name="hero.images"
          render={({ field }) => (
            <ImageArrayUploader value={field.value} onChange={field.onChange} />
          )}
        />
      </div>
    </div>
  );
}
