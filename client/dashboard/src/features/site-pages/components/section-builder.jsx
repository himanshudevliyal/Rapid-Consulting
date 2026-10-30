"use client";
import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Info,
  Plus,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  anchorsOf,
  blankSection,
  duplicateSection,
  missingRequired,
  moveItem,
  slugifyText,
  uniqueAnchor,
} from "@/lib/site-page";
import { FieldsForm } from "./field-editor";

const selectClass = "h-9 w-full rounded-md border bg-transparent px-3 text-sm";

// The sections of one page: add from the blocks the template allows, reorder
// (buttons or drag and drop), show / hide, duplicate, remove, and edit the
// fields of each block. Hiding keeps the content; removing deletes only this
// section, never a linked record.
export default function SectionBuilder({ template, registry, sections, onChange, disabled = false }) {
  const config = registry?.templates?.[template];
  const blocks = registry?.blocks ?? {};
  const first = config?.first ?? null;
  const railLayout = config?.layout === "rail";

  const [expanded, setExpanded] = useState(() => new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [removeIndex, setRemoveIndex] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const dragging = useRef(false);

  // The first block (e.g. masthead) is pinned to the top when it is there.
  const pinned = !!first && sections[0]?.type === first;
  const canMove = (from, to) => {
    if (from === to || from < 0 || to < 0 || from >= sections.length || to >= sections.length) return false;
    if (pinned && (from === 0 || to === 0)) return false;
    return true;
  };

  const toggleExpanded = (id) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const patchSection = (index, patch) =>
    onChange(sections.map((section, i) => (i === index ? { ...section, ...patch } : section)));

  const move = (from, to) => {
    if (canMove(from, to)) onChange(moveItem(sections, from, to));
  };

  const duplicate = (index) => {
    const copy = duplicateSection(sections[index], sections);
    onChange([...sections.slice(0, index + 1), copy, ...sections.slice(index + 1)]);
    setExpanded((current) => new Set(current).add(copy.id));
  };

  const addBlock = (type) => {
    const section = blankSection(type, blocks[type], sections);
    const atTop = !!first && type === first && sections[0]?.type !== first;
    onChange(atTop ? [section, ...sections] : [...sections, section]);
    setExpanded((current) => new Set(current).add(section.id));
    setAddOpen(false);
  };

  const confirmRemove = () => {
    if (removeIndex === null) return;
    onChange(sections.filter((_, i) => i !== removeIndex));
    setRemoveIndex(null);
  };

  // Native drag and drop (the handle starts the drag).
  const onDragStart = (event, index) => {
    if (pinned && index === 0) {
      event.preventDefault();
      return;
    }
    dragging.current = true;
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
    const card = event.currentTarget.closest("[data-section-card]");
    if (card) event.dataTransfer.setDragImage(card, 16, 16);
  };
  const onDragOver = (event, index) => {
    if (!dragging.current || dragIndex === null || !canMove(dragIndex, index)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (overIndex !== index) setOverIndex(index);
  };
  const onDrop = (event, index) => {
    event.preventDefault();
    if (dragIndex !== null && canMove(dragIndex, index)) onChange(moveItem(sections, dragIndex, index));
    endDrag();
  };
  const endDrag = () => {
    dragging.current = false;
    setDragIndex(null);
    setOverIndex(null);
  };

  const allowed = (config?.allowed ?? Object.keys(blocks)).filter((type) => blocks[type]);

  return (
    <div className="space-y-4">
      <Alert>
        <Info />
        <AlertTitle>Linked records and this page</AlertTitle>
        <AlertDescription>
          <p>
            Edits to a linked record (scheme, case, person) update every page that uses it; edits here change this page
            only.
          </p>
        </AlertDescription>
      </Alert>

      {sections.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {first
            ? `This page has no sections yet. Start with the ${blocks[first]?.label ?? first} section, then add the others.`
            : "This page has no sections yet."}
        </div>
      )}

      <ol className="space-y-2">
        {sections.map((section, index) => {
          const block = blocks[section.type];
          const open = expanded.has(section.id);
          const missing = block ? missingRequired(section, block) : [];
          const isPinned = pinned && index === 0;
          const variantLabel = block?.variants?.find((variant) => variant.key === section.variant)?.label;
          return (
            <li
              key={section.id}
              data-section-card
              onDragOver={(event) => onDragOver(event, index)}
              onDrop={(event) => onDrop(event, index)}
              className={cn("rounded-xl border bg-card shadow-sm transition-colors", {
                "opacity-50": dragIndex === index,
                "border-primary ring-2 ring-primary/30": overIndex === index && dragIndex !== null && dragIndex !== index,
                "bg-muted/40": section.visible === false,
              })}
            >
              <div className="flex flex-wrap items-center gap-1.5 px-2 py-2 sm:flex-nowrap">
                <span
                  draggable={!disabled && !isPinned}
                  onDragStart={(event) => onDragStart(event, index)}
                  onDragEnd={endDrag}
                  title={isPinned ? "Stays at the top" : "Drag to reorder"}
                  className={cn("flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground", {
                    "cursor-grab hover:bg-accent active:cursor-grabbing": !disabled && !isPinned,
                    "opacity-30": isPinned,
                  })}
                >
                  <GripVertical className="size-4" />
                  <span className="sr-only">Drag to reorder</span>
                </span>

                <button
                  type="button"
                  onClick={() => toggleExpanded(section.id)}
                  aria-expanded={open}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                  <span className="text-xs tabular-nums text-muted-foreground">{index + 1}</span>
                  <span className="min-w-0">
                    <span className={cn("block truncate text-sm font-medium", { "line-through decoration-muted-foreground/50": section.visible === false })}>
                      {section.label || block?.label || section.type}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {block?.label ?? section.type}
                      {variantLabel ? ` - ${variantLabel}` : ""}
                      {section.anchor ? ` - #${section.anchor}` : ""}
                    </span>
                  </span>
                </button>

                <div className="flex flex-wrap items-center gap-1">
                  {section.visible === false && <Badge variant="secondary">Hidden</Badge>}
                  {!block && (
                    <Badge variant="destructive">
                      <AlertTriangle /> Unknown block
                    </Badge>
                  )}
                  {missing.length > 0 && section.visible !== false && (
                    <Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-300" title={`Fill in: ${missing.join(", ")}`}>
                      <AlertTriangle /> Needs content
                    </Badge>
                  )}
                  {railLayout && block && (
                    <Badge variant="outline" className="hidden lg:inline-flex" title={block.rail ? "Sits beside the sticky enquiry form" : "Full width; the enquiry form column ends above it"}>
                      {block.rail ? "With enquiry rail" : "Full width"}
                    </Badge>
                  )}
                </div>

                <div className="flex shrink-0 items-center">
                  <Button type="button" variant="ghost" size="icon-sm" disabled={disabled || !canMove(index, index - 1)} onClick={() => move(index, index - 1)}>
                    <ArrowUp />
                    <span className="sr-only">Move up</span>
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" disabled={disabled || !canMove(index, index + 1)} onClick={() => move(index, index + 1)}>
                    <ArrowDown />
                    <span className="sr-only">Move down</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={disabled}
                    onClick={() => patchSection(index, { visible: section.visible === false })}
                    title={section.visible === false ? "Show on the page" : "Hide from the page (content is kept)"}
                  >
                    {section.visible === false ? <EyeOff /> : <Eye />}
                    <span className="sr-only">{section.visible === false ? "Show section" : "Hide section"}</span>
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" disabled={disabled || (!!first && section.type === first)} onClick={() => duplicate(index)} title="Duplicate">
                    <Copy />
                    <span className="sr-only">Duplicate section</span>
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" disabled={disabled} onClick={() => setRemoveIndex(index)} title="Remove">
                    <Trash2 />
                    <span className="sr-only">Remove section</span>
                  </Button>
                </div>
              </div>

              {open && (
                <div className="space-y-4 border-t px-4 py-4">
                  {!block ? (
                    <p className="text-sm text-red-500">
                      This block type is not in the registry any more. Remove the section or ask a developer.
                    </p>
                  ) : (
                    <>
                      {block.description && <p className="text-sm text-muted-foreground">{block.description}</p>}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <div className="flex items-baseline justify-between">
                            <Label htmlFor={`s-${section.id}-label`}>Section label</Label>
                            <span className={cn("text-xs text-muted-foreground", { "text-red-500": (section.label ?? "").length > 40 })}>
                              {(section.label ?? "").length}/40
                            </span>
                          </div>
                          <Input
                            id={`s-${section.id}-label`}
                            maxLength={40}
                            value={section.label ?? ""}
                            onChange={(event) => patchSection(index, { label: event.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">Shown in the page contents and jump links.</p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-baseline justify-between">
                            <Label htmlFor={`s-${section.id}-anchor`}>Anchor</Label>
                            <button
                              type="button"
                              className="text-xs text-primary underline-offset-4 hover:underline"
                              onClick={() =>
                                patchSection(index, { anchor: uniqueAnchor(section.label || block.label, anchorsOf(sections, section.id)) })
                              }
                            >
                              Use the label
                            </button>
                          </div>
                          <Input
                            id={`s-${section.id}-anchor`}
                            className="font-mono text-sm"
                            value={section.anchor ?? ""}
                            onChange={(event) => patchSection(index, { anchor: slugifyText(event.target.value) })}
                            placeholder="made-from-the-label"
                          />
                          <p className="text-xs text-muted-foreground">The #link of this section. Must be unique on the page.</p>
                        </div>
                        {Array.isArray(block.variants) && block.variants.length > 1 && (
                          <div className="space-y-1.5">
                            <Label htmlFor={`s-${section.id}-variant`}>Variant</Label>
                            <select
                              id={`s-${section.id}-variant`}
                              className={selectClass}
                              value={section.variant ?? ""}
                              onChange={(event) => patchSection(index, { variant: event.target.value })}
                            >
                              {block.variants.map((variant) => (
                                <option key={variant.key} value={variant.key}>
                                  {variant.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-4">
                        <FieldsForm
                          fields={block.fields ?? []}
                          data={section.data}
                          idPrefix={`s-${section.id}`}
                          onChange={(data) => patchSection(index, { data })}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" disabled={disabled || allowed.length === 0} onClick={() => setAddOpen(true)}>
          <Plus /> Add section
        </Button>
        {sections.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setExpanded((current) => (current.size ? new Set() : new Set(sections.map((section) => section.id))))
            }
          >
            {expanded.size ? "Collapse all" : "Expand all"}
          </Button>
        )}
        <span className="text-xs text-muted-foreground">
          {sections.filter((section) => section.visible !== false).length} of {sections.length} shown
        </span>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add a section</DialogTitle>
            <DialogDescription>Sections available on the {config?.label ?? template} template.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 sm:grid-cols-2">
            {allowed.map((type) => {
              const block = blocks[type];
              const taken = type === first && sections.some((section) => section.type === first);
              return (
                <button
                  key={type}
                  type="button"
                  disabled={taken}
                  onClick={() => addBlock(type)}
                  className="rounded-lg border p-3 text-left transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="block text-sm font-medium">{block.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {taken ? "Already on this page." : block.description}
                  </span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removeIndex !== null} onOpenChange={(open) => !open && setRemoveIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this section?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeIndex !== null && sections[removeIndex]
                ? `"${sections[removeIndex].label || sections[removeIndex].type}" and the text typed into it are removed from this page. `
                : ""}
              Linked schemes, case studies, people and other records are not deleted. To keep the content for later, hide the
              section instead.
              {removeIndex !== null && sections[removeIndex]?.type === first
                ? " This template needs this section to publish."
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>Remove section</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
