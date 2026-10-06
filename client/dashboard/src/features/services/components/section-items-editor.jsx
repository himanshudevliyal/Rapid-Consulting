"use client";
import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import HtmlField from "./html-field";

// The list inside a features / benefits / process / faq section.
export default function SectionItemsEditor({ control, register, name, errors, itemLabel }) {
  const { fields, append, remove, move } = useFieldArray({ control, name });

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-3 rounded-md border bg-muted/20 p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor={`${name}.${index}.title`}>
                {itemLabel} {index + 1} title *
              </Label>
              <Input id={`${name}.${index}.title`} {...register(`${name}.${index}.title`)} />
              {errors?.[index]?.title && (
                <p className="text-sm text-red-500">{errors[index].title.message}</p>
              )}
            </div>
            <Button type="button" variant="outline" size="icon" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Move up">
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} aria-label="Move down">
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} aria-label="Remove item">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          <HtmlField control={control} name={`${name}.${index}.html`} label="Text" />
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => append({ key: "", title: "", html: "" })}>
        <Plus className="h-4 w-4" /> Add {itemLabel.toLowerCase()}
      </Button>
    </div>
  );
}
