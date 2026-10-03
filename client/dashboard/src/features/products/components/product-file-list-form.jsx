"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldError from "@/components/ui/field-error";
import { Plus, Trash } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import FileUrlUploader from "@/components/file-url-uploader";

// name: "models_3d" | "downloads"
export default function ProductFileListForm({ name, addLabel }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const sectionErrors = errors?.[name];

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-wrap items-end gap-2 rounded-md border p-3"
        >
          <div className="min-w-40 flex-1 space-y-1">
            <Label>Title</Label>
            <Input
              {...register(`${name}.${index}.title`)}
              placeholder="e.g. Product Brochure"
            />
            {sectionErrors?.[index]?.title && (
              <FieldError message={sectionErrors[index].title.message} />
            )}
          </div>

          <div className="min-w-28 space-y-1">
            <Label>File type</Label>
            <Input
              {...register(`${name}.${index}.fileType`)}
              placeholder="pdf / zip"
            />
          </div>

          <div className="space-y-1">
            <Label>File</Label>
            <Controller
              control={control}
              name={`${name}.${index}.file`}
              render={({ field: f }) => (
                <FileUrlUploader
                  value={f.value}
                  onUploaded={f.onChange}
                  label="Upload"
                />
              )}
            />
            {sectionErrors?.[index]?.file && (
              <FieldError message={sectionErrors[index].file.message} />
            )}
          </div>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ title: "", file: "", fileType: "" })}
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}
