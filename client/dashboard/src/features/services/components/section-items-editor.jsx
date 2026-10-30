"use client";
import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import HtmlField from "./html-field";

const selectClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

// The list inside a features / benefits / process / faq section. `reviews`
// turns each item into a review card: quote (title), stars and the reviewer.
export default function SectionItemsEditor({ control, register, name, errors, itemLabel, reviews = false }) {
  const { fields, append, remove, move } = useFieldArray({ control, name });

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-3 rounded-md border bg-muted/20 p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor={`${name}.${index}.title`}>
                {itemLabel} {index + 1} {reviews ? "quote" : "title"} *
              </Label>
              <Input id={`${name}.${index}.title`} placeholder={reviews ? "“What the client said …”" : undefined} {...register(`${name}.${index}.title`)} />
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
          {reviews ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="space-y-1">
                <Label htmlFor={`${name}.${index}.rating`}>Stars</Label>
                <select id={`${name}.${index}.rating`} className={selectClass} {...register(`${name}.${index}.rating`)}>
                  <option value="">5 (default)</option>
                  {["5", "4", "3", "2", "1"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${name}.${index}.name`}>Client name</Label>
                <Input id={`${name}.${index}.name`} {...register(`${name}.${index}.name`)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${name}.${index}.business`}>Business name</Label>
                <Input id={`${name}.${index}.business`} {...register(`${name}.${index}.business`)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${name}.${index}.location`}>Location</Label>
                <Input id={`${name}.${index}.location`} placeholder="Hisar, Haryana" {...register(`${name}.${index}.location`)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor={`${name}.${index}.services`}>Services taken</Label>
                <Input id={`${name}.${index}.services`} placeholder="Change of Land Use (CLU), Fire NOC" {...register(`${name}.${index}.services`)} />
                <p className="text-xs text-muted-foreground">Separate several services with commas.</p>
              </div>
            </div>
          ) : (
            <HtmlField control={control} name={`${name}.${index}.html`} label="Text" />
          )}
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => append({ key: "", title: "", html: "", name: "", business: "", location: "", rating: "", services: "" })}>
        <Plus className="h-4 w-4" /> Add {itemLabel.toLowerCase()}
      </Button>
    </div>
  );
}
