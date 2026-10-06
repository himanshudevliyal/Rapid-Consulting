"use client";
import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import TextEditor from "@/components/editor";

// Rich-text (HTML) field bound to a react-hook-form field name.
export default function HtmlField({ control, name, label, hint }) {
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <Controller
        control={control}
        name={name}
        render={({ field }) => <TextEditor value={field.value ?? ""} onChange={field.onChange} />}
      />
    </div>
  );
}
