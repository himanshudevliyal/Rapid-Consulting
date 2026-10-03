"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldError from "@/components/ui/field-error";
import { Plus, Trash } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import FileUrlUploader from "@/components/file-url-uploader";

export default function ProductMaterialsForm() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "materials.sections",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="relative space-y-3 rounded-md border p-4">
          <div>
            <Label>Heading *</Label>
            <Input
              {...register(`materials.sections.${index}.heading`)}
              placeholder="e.g. Frame Materials"
            />
            {errors?.materials?.sections?.[index]?.heading && (
              <FieldError
                message={errors.materials.sections[index].heading.message}
              />
            )}
          </div>

          <MaterialItems sectionIndex={index} />

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
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ heading: "", items: [] })}
      >
        <Plus className="h-4 w-4" /> Add material section
      </Button>
    </div>
  );
}

function MaterialItems({ sectionIndex }) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `materials.sections.${sectionIndex}.items`,
  });

  return (
    <div className="space-y-2 pl-2">
      <Label>Items</Label>
      {fields.map((item, itemIndex) => (
        <div
          key={item.id}
          className="border-muted flex flex-wrap items-center gap-2 rounded border p-2"
        >
          <div className="min-w-40 flex-1">
            <Input
              {...register(
                `materials.sections.${sectionIndex}.items.${itemIndex}.title`,
              )}
              placeholder="e.g. Cold Rolled Steel"
            />
            {errors?.materials?.sections?.[sectionIndex]?.items?.[itemIndex]
              ?.title && (
              <FieldError
                message={
                  errors.materials.sections[sectionIndex].items[itemIndex]
                    .title.message
                }
              />
            )}
          </div>

          <Controller
            control={control}
            name={`materials.sections.${sectionIndex}.items.${itemIndex}.image`}
            render={({ field }) => (
              <FileUrlUploader
                value={field.value}
                onUploaded={field.onChange}
                accept="image/*"
                label="Upload image"
              />
            )}
          />

          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => remove(itemIndex)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => append({ title: "", image: "" })}
      >
        <Plus className="h-4 w-4" /> Add item
      </Button>
    </div>
  );
}
