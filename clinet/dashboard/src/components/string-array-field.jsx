"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { Controller } from "react-hook-form";

// Renders a string[] RHF field (e.g. descriptions, features.list) as
// individual rows with an "Add" button, instead of a single textarea.
export default function StringArrayField({
  control,
  name,
  placeholder,
  addLabel = "Add",
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const items = field.value || [];

        const updateItem = (index, value) => {
          const next = [...items];
          next[index] = value;
          field.onChange(next);
        };

        const removeItem = (index) => {
          field.onChange(items.filter((_, i) => i !== index));
        };

        const addItem = () => field.onChange([...items, ""]);

        return (
          <div className="space-y-2">
            {items.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={value}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder={placeholder}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeItem(index)}
                  aria-label="Remove"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4" /> {addLabel}
            </Button>
          </div>
        );
      }}
    />
  );
}
