"use client";
import { Button } from "@/components/ui/button";
import FieldError from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import config from "@/config";
import { cn } from "@/lib/utils";
import { Plus, Trash, XIcon } from "lucide-react";
import Image from "next/image";
import { useFieldArray, useFormContext } from "react-hook-form";

export default function ProductVariants({ fileUrls, setFileUrls }) {
  const {
    control,
    register,
    formState: { errors },
    setValue,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        return (
          <div key={field.id} className="space-y-4 border p-4 rounded relative">
            {/* Upload */}
            <Input
              type="file"
              multiple
              onChange={(e) =>
                setValue(
                  `variants.${index}.pictures`,
                  Array.from(e.target.files),
                )
              }
            />

            {/* Existing Images */}
            <div className="flex gap-3 flex-wrap ">
              {fileUrls?.[index]?.map((src, i) => (
                <div key={i} className="relative w-24 h-24">
                  <Image
                    src={`${config.file_base}/${src}`}
                    fill
                    className="object-cover rounded"
                    alt=""
                    unoptimized
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() =>
                      setFileUrls((prev) => ({
                        ...prev,
                        [index]: prev[index]?.filter((img) => img !== src),
                      }))
                    }
                    className="absolute -top-2 -right-2 size-6 rounded-full"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Fields */}
            <div className="flex gap-2">
              <div>
                <Label>Pack size *</Label>
                <Input
                  type="number"
                  placeholder="Pack Size"
                  {...register(`variants.${index}.pack_size`, {
                    valueAsNumber: true,
                  })}
                  className={cn({
                    "border-destructive": errors?.variants?.[index]?.pack_size,
                  })}
                />
                {errors?.variants?.[index]?.pack_size && (
                  <FieldError
                    message={errors?.variants?.[index]?.pack_size?.message}
                  />
                )}
              </div>

              <div>
                <Label>Price *</Label>
                <Input
                  type="number"
                  placeholder="Price"
                  {...register(`variants.${index}.price`, {
                    valueAsNumber: true,
                  })}
                  className={cn({
                    "border-destructive": errors?.variants?.[index]?.price,
                  })}
                />
                {errors?.variants?.[index]?.price && (
                  <FieldError
                    message={errors?.variants?.[index]?.price?.message}
                  />
                )}
              </div>

              <div>
                <Label>Display price *</Label>
                <Input
                  type="number"
                  placeholder="Display Price"
                  {...register(`variants.${index}.display_price`, {
                    valueAsNumber: true,
                  })}
                  className={cn({
                    "border-destructive":
                      errors?.variants?.[index]?.display_price,
                  })}
                />
                {errors?.variants?.[index]?.display_price && (
                  <FieldError
                    message={errors?.variants?.[index]?.display_price?.message}
                  />
                )}
              </div>

              <div>
                <Label>SKU *</Label>
                <Input
                  placeholder="SKU"
                  {...register(`variants.${index}.sku`)}
                  className={cn({
                    "border-destructive": errors?.variants?.[index]?.sku,
                  })}
                />
                {errors?.variants?.[index]?.sku && (
                  <FieldError
                    message={errors?.variants?.[index]?.sku?.message}
                  />
                )}
              </div>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(index)}
              className={"absolute bottom-2 right-2"}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size={"sm"}
        onClick={() =>
          append({
            pack_size: "",
            price: "",
            display_price: "",
            sku: "",
            pictures: [],
          })
        }
      >
        <Plus className="h-4 w-4" /> Add Variant
      </Button>
    </div>
  );
}
