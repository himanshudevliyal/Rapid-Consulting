"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldError from "@/components/ui/field-error";
import { Plus, Trash } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

export default function ProductSpecificationsForm() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications",
  });

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <div className="flex-1 space-y-1">
            <Label>Label</Label>
            <Input
              {...register(`specifications.${index}.label`)}
              placeholder="e.g. Brand"
            />
            {errors?.specifications?.[index]?.label && (
              <FieldError
                message={errors.specifications[index].label.message}
              />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <Label>Value</Label>
            <Input
              {...register(`specifications.${index}.value`)}
              placeholder="e.g. Sulwhasoo"
            />
            {errors?.specifications?.[index]?.value && (
              <FieldError
                message={errors.specifications[index].value.message}
              />
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="mt-6"
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
        onClick={() => append({ label: "", value: "" })}
      >
        <Plus className="h-4 w-4" /> Add specification
      </Button>
    </div>
  );
}
