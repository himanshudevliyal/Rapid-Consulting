"use client";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sectionRoles } from "@/data/service-constants";
import { emptySection, htmlSnippet } from "@/lib/service-form";
import { cn } from "@/lib/utils";
import HtmlField from "./html-field";
import SectionItemsEditor from "./section-items-editor";

const selectClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

const itemLabels = { features: "Feature", benefits: "Benefit", process: "Step", faq: "Question" };

function SectionCard({ index, name, control, register, errors, open, onToggle, onMove, onRemove, isFirst, isLast }) {
  const section = useWatch({ control, name: `${name}.${index}` }) ?? {};
  const roleInfo = sectionRoles.find((r) => r.value === section.role) ?? sectionRoles[0];
  const sectionErrors = errors?.[index];
  const preview = roleInfo.items
    ? `${section.items?.length ?? 0} item${section.items?.length === 1 ? "" : "s"}${section.intro_html ? " · " + htmlSnippet(section.intro_html, 90) : ""}`
    : htmlSnippet(section.html, 140);

  return (
    <div className={cn("rounded-lg border", sectionErrors && "border-red-500")}>
      <div className="flex items-start gap-2 p-3">
        <button type="button" onClick={onToggle} className="flex flex-1 items-start gap-2 text-left" aria-expanded={open}>
          {open ? <ChevronDown className="mt-1 h-4 w-4 shrink-0" /> : <ChevronRight className="mt-1 h-4 w-4 shrink-0" />}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">{index + 1}.</span>
              <span className="font-medium">{section.title || "Untitled section"}</span>
              <Badge variant="outline">{roleInfo.label}</Badge>
              {sectionErrors && <Badge variant="destructive">Needs attention</Badge>}
            </div>
            {!open && preview && <p className="mt-1 text-sm text-muted-foreground">{preview}</p>}
          </div>
        </button>
        <Button type="button" variant="outline" size="icon" disabled={isFirst} onClick={() => onMove(index, index - 1)} aria-label="Move section up">
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" disabled={isLast} onClick={() => onMove(index, index + 1)} aria-label="Move section down">
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button type="button" variant="destructive" size="icon" onClick={() => onRemove(index)} aria-label="Remove section">
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      {open && (
        <div className="space-y-4 border-t p-3">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <div className="space-y-1">
              <Label htmlFor={`${name}.${index}.title`}>Section title *</Label>
              <Input id={`${name}.${index}.title`} {...register(`${name}.${index}.title`)} />
              {sectionErrors?.title && <p className="text-sm text-red-500">{sectionErrors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${name}.${index}.role`}>Layout on the website</Label>
              <select id={`${name}.${index}.role`} className={selectClass} {...register(`${name}.${index}.role`)}>
                {sectionRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">{roleInfo.help}</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${name}.${index}.nav_label`}>Menu label</Label>
              <Input id={`${name}.${index}.nav_label`} placeholder="Short name in “On this page” (optional)" {...register(`${name}.${index}.nav_label`)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${name}.${index}.key`}>Anchor key</Label>
              <Input id={`${name}.${index}.key`} placeholder="Auto from title" {...register(`${name}.${index}.key`)} />
              <p className="text-xs text-muted-foreground">Used in the link to this section. Leave blank to generate it.</p>
            </div>
          </div>

          {roleInfo.items ? (
            <>
              <HtmlField control={control} name={`${name}.${index}.intro_html`} label="Intro text" />
              <SectionItemsEditor
                control={control}
                register={register}
                name={`${name}.${index}.items`}
                errors={sectionErrors?.items}
                itemLabel={itemLabels[section.role] ?? "Item"}
              />
              <HtmlField control={control} name={`${name}.${index}.outro_html`} label="Closing text" />
            </>
          ) : (
            <HtmlField control={control} name={`${name}.${index}.html`} label="Content" />
          )}
        </div>
      )}
    </div>
  );
}

// Add, edit, reorder and remove the ordered sections of one language version.
export default function SectionsEditor({ control, register, name, errors }) {
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const [openIds, setOpenIds] = useState(() => new Set());

  const toggle = (id) =>
    setOpenIds((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // A newly added section opens straight away.
  const previousCount = useRef(fields.length);
  useEffect(() => {
    if (fields.length > previousCount.current) {
      const newest = fields[fields.length - 1].id;
      setOpenIds((current) => new Set(current).add(newest));
    }
    previousCount.current = fields.length;
  }, [fields]);

  // A section with a validation error opens so it can be fixed.
  const isOpen = (field, index) => openIds.has(field.id) || !!errors?.[index];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {fields.length} section{fields.length === 1 ? "" : "s"}. Click a section to read and edit its content.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpenIds(new Set(fields.map((f) => f.id)))}>
            Expand all
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpenIds(new Set())}>
            Collapse all
          </Button>
        </div>
      </div>

      {fields.map((field, index) => (
        <SectionCard
          key={field.id}
          index={index}
          name={name}
          control={control}
          register={register}
          errors={errors}
          open={isOpen(field, index)}
          onToggle={() => toggle(field.id)}
          onMove={move}
          onRemove={remove}
          isFirst={index === 0}
          isLast={index === fields.length - 1}
        />
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append(emptySection())}
      >
        <Plus className="h-4 w-4" /> Add section
      </Button>
    </div>
  );
}
