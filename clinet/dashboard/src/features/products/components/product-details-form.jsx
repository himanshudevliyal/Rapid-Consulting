"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FieldError from "@/components/ui/field-error";
import { Plus, Trash } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import StringArrayField from "@/components/string-array-field";
import FileUrlUploader from "@/components/file-url-uploader";

export default function ProductDetailsForm() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details.sections",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const hasFeatures = watch(`details.sections.${index}.has_features`);

        return (
          <div
            key={field.id}
            className="relative space-y-3 rounded-md border p-4"
          >
            <div>
              <Label>Heading *</Label>
              <Input
                {...register(`details.sections.${index}.heading`)}
                placeholder="e.g. Modular Frame Construction"
              />
              {errors?.details?.sections?.[index]?.heading && (
                <FieldError
                  message={errors.details.sections[index].heading.message}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Descriptions</Label>
              <StringArrayField
                control={control}
                name={`details.sections.${index}.descriptions`}
                placeholder="Enter a description"
                addLabel="Add description"
              />
            </div>

            <div className="space-y-2">
              <Label>Section image</Label>
              <Controller
                control={control}
                name={`details.sections.${index}.image`}
                render={({ field: f }) => (
                  <FileUrlUploader
                    value={f.value}
                    onUploaded={f.onChange}
                    accept="image/*"
                    label="Upload image"
                  />
                )}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Controller
                control={control}
                name={`details.sections.${index}.has_features`}
                render={({ field: f }) => (
                  <Checkbox
                    checked={f.value}
                    onCheckedChange={f.onChange}
                    id={`has_features_${index}`}
                  />
                )}
              />
              <Label htmlFor={`has_features_${index}`} className="text-sm">
                Show features for this section
              </Label>
            </div>

            {hasFeatures && (
              <div className="space-y-3 border-l-2 pl-4">
                <div>
                  <Label>Features heading</Label>
                  <Input
                    {...register(`details.sections.${index}.features.heading`)}
                    placeholder="e.g. Key Benefits"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Features list</Label>
                  <StringArrayField
                    control={control}
                    name={`details.sections.${index}.features.list`}
                    placeholder="Enter a feature"
                    addLabel="Add feature"
                  />
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(index)}
              className="absolute top-2 right-2"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          append({
            heading: "",
            descriptions: [],
            image: "",
            has_features: false,
            features: { heading: "", list: [] },
          })
        }
      >
        <Plus className="h-4 w-4" /> Add section
      </Button>

      {/* Banner - separate from the sections above, one image for the whole Details block */}
      <div className="space-y-2 rounded-md border p-4">
        <Label>Banner image</Label>
        <Controller
          control={control}
          name="details.banner.image"
          render={({ field }) => (
            <FileUrlUploader
              value={field.value}
              onUploaded={field.onChange}
              accept="image/*"
              label="Upload banner image"
            />
          )}
        />
      </div>
    </div>
  );
}