"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Copy, Plus, Trash2 } from "lucide-react";
import TextEditor from "@/components/editor";
import FileUploaderServer from "@/components/file-uploader-server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { deepClone, emptyListItem, emptyValue, moveItem } from "@/lib/site-page";
import RecordPicker from "./record-picker";

const selectClass = "h-9 w-full rounded-md border bg-transparent px-3 text-sm";

function Counter({ value, max }) {
  if (!max) return null;
  const length = String(value ?? "").length;
  return (
    <span className={cn("text-xs text-muted-foreground", { "text-red-500": length > max })}>
      {length}/{max}
    </span>
  );
}

// The input for one field, chosen by its kind in the registry.
export function FieldControl({ field, value, onChange, id }) {
  switch (field.kind) {
    case "textarea":
      return (
        <Textarea id={id} rows={4} maxLength={field.max || undefined} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
      );
    case "html":
      return (
        <div className="rounded-md">
          <TextEditor value={value ?? ""} onChange={(next) => onChange(next)} />
        </div>
      );
    case "url":
      return (
        <Input
          id={id}
          type="text"
          inputMode="url"
          maxLength={field.max || undefined}
          placeholder="/path-on-this-site or https://..."
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "select": {
      const options = field.options ?? [];
      const hasValue = value !== undefined && value !== null && value !== "";
      return (
        <select id={id} className={selectClass} value={hasValue ? value : ""} onChange={(event) => onChange(event.target.value)}>
          {(!hasValue || !field.required) && <option value="">{field.required ? "Select..." : "None"}</option>}
          {options.map((option) => (
            <option key={String(option.value)} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
    case "boolean":
      return (
        <div className="flex items-center gap-2">
          <Switch id={id} checked={!!value} onCheckedChange={onChange} />
          <span className="text-sm text-muted-foreground">{value ? "Yes" : "No"}</span>
        </div>
      );
    case "image":
      return <FileUploaderServer value={value ?? ""} onFileChange={(path) => onChange(path ?? "")} className="min-h-40" />;
    case "number":
      return (
        <Input
          id={id}
          type="number"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
        />
      );
    case "list":
      return <ListField field={field} value={value} onChange={onChange} id={id} />;
    case "record":
      return <RecordPicker field={field} value={value} onChange={onChange} />;
    default:
      return (
        <Input id={id} type="text" maxLength={field.max || undefined} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
      );
  }
}

// One labelled field: label, input, help text and a character counter.
export function FieldRow({ field, value, onChange, id }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>
          {field.label}
          {field.required ? " *" : ""}
        </Label>
        {["text", "textarea", "url"].includes(field.kind) || !field.kind ? <Counter value={value} max={field.max} /> : null}
      </div>
      <FieldControl field={field} value={value} onChange={onChange} id={id} />
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}

// All fields of an object (a section's data, or one list item).
export function FieldsForm({ fields, data, onChange, idPrefix }) {
  const values = data ?? {};
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FieldRow
          key={field.key}
          field={field}
          id={`${idPrefix}-${field.key}`}
          value={values[field.key] ?? emptyValue(field)}
          onChange={(next) => onChange({ ...values, [field.key]: next })}
        />
      ))}
    </div>
  );
}

// A short name for a list item: its first filled text field.
const itemTitle = (field, item, index) => {
  if (typeof item === "string") return item || `Item ${index + 1}`;
  const textField = (field.item_fields ?? []).find((sub) => ["text", "textarea"].includes(sub.kind) && String(item?.[sub.key] ?? "").trim());
  const text = textField ? String(item[textField.key]).trim() : "";
  return text ? (text.length > 60 ? `${text.slice(0, 57)}...` : text) : `Item ${index + 1}`;
};

// Repeater for a "list" field: add, remove, duplicate, move up / down.
function ListField({ field, value, onChange, id }) {
  const items = Array.isArray(value) ? value : [];
  const itemFields = Array.isArray(field.item_fields) ? field.item_fields : [];
  const plain = itemFields.length === 0;
  // Which items are open. Items past the first three start closed.
  const [openState, setOpenState] = useState({});
  const isOpen = (index) => openState[index] ?? index < 3;
  const setOpen = (index, open) => setOpenState((state) => ({ ...state, [index]: open }));

  const swapOpen = (from, to) =>
    setOpenState((state) => ({ ...state, [from]: state[to] ?? to < 3, [to]: state[from] ?? from < 3 }));

  const update = (index, next) => onChange(items.map((item, i) => (i === index ? next : item)));
  const move = (from, to) => {
    onChange(moveItem(items, from, to));
    swapOpen(from, to);
  };
  const remove = (index) => {
    onChange(items.filter((_, i) => i !== index));
    setOpenState({});
  };
  const add = () => {
    onChange([...items, emptyListItem(field)]);
    setOpen(items.length, true);
  };
  const duplicate = (index) => {
    const copy = deepClone(items[index]);
    onChange([...items.slice(0, index + 1), copy, ...items.slice(index + 1)]);
    setOpenState({});
  };

  return (
    <div className="space-y-2" id={id}>
      {items.length === 0 && <p className="text-sm text-muted-foreground">No items yet.</p>}
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border bg-background">
          <div className="flex items-center gap-1 px-2 py-1.5">
            {plain ? (
              <Input
                aria-label={`${field.label} ${index + 1}`}
                className="h-8"
                value={item ?? ""}
                onChange={(event) => update(index, event.target.value)}
              />
            ) : (
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-sm font-medium"
                onClick={() => setOpen(index, !isOpen(index))}
                aria-expanded={isOpen(index)}
              >
                {isOpen(index) ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                <span className="text-muted-foreground">{index + 1}.</span>
                <span className="truncate">{itemTitle(field, item, index)}</span>
              </button>
            )}
            <Button type="button" variant="ghost" size="icon-xs" disabled={index === 0} onClick={() => move(index, index - 1)}>
              <ArrowUp />
              <span className="sr-only">Move up</span>
            </Button>
            <Button type="button" variant="ghost" size="icon-xs" disabled={index === items.length - 1} onClick={() => move(index, index + 1)}>
              <ArrowDown />
              <span className="sr-only">Move down</span>
            </Button>
            {!plain && (
              <Button type="button" variant="ghost" size="icon-xs" onClick={() => duplicate(index)}>
                <Copy />
                <span className="sr-only">Duplicate</span>
              </Button>
            )}
            <Button type="button" variant="ghost" size="icon-xs" onClick={() => remove(index)}>
              <Trash2 />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
          {!plain && isOpen(index) && (
            <div className="border-t px-3 py-3">
              <FieldsForm
                fields={itemFields}
                data={item && typeof item === "object" ? item : {}}
                onChange={(next) => update(index, next)}
                idPrefix={`${id}-${index}`}
              />
            </div>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus /> Add {plain ? "item" : (field.item_label ?? "item")}
      </Button>
    </div>
  );
}
