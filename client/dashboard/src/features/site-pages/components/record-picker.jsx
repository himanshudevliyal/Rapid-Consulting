"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Check, ChevronsUpDown, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RECORD_TYPE_LABELS, useRecordOptions } from "@/hooks/use-record-options";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { RECORD_EDIT_ROUTES, moveItem } from "@/lib/site-page";

// Searchable picker for a linked record (scheme, case study, article, person,
// service, industry). The page stores only a reference { id, slug, title };
// removing it here never deletes the record itself.
export default function RecordPicker({ field, value, onChange }) {
  const recordType = field.record_type;
  const multiple = !!field.multiple;
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { options, isLoading, isError, error, supported } = useRecordOptions(recordType);

  const selected = multiple ? (Array.isArray(value) ? value : []) : value && value.id ? [value] : [];
  const selectedIds = new Set(selected.map((item) => String(item.id)));
  const known = new Map(options.map((option) => [option.id, option]));
  const noun = RECORD_TYPE_LABELS[recordType] ?? "record";
  const canOpenRecord = user?.role === "admin" && !!RECORD_EDIT_ROUTES[recordType];

  const reference = (option) => ({ id: option.id, slug: option.slug || undefined, title: option.title });

  const toggle = (option) => {
    if (multiple) {
      onChange(
        selectedIds.has(option.id)
          ? selected.filter((item) => String(item.id) !== option.id)
          : [...selected, reference(option)],
      );
    } else {
      onChange(selectedIds.has(option.id) ? null : reference(option));
      setOpen(false);
    }
  };

  const removeAt = (index) => {
    if (multiple) onChange(selected.filter((_, i) => i !== index));
    else onChange(null);
  };

  if (!supported) {
    return <p className="text-sm text-red-500">Unknown record type &quot;{String(recordType)}&quot;.</p>;
  }

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <ul className="space-y-1.5">
          {selected.map((item, index) => {
            const match = known.get(String(item.id));
            const missing = !isLoading && !isError && !match;
            return (
              <li key={`${item.id}-${index}`} className="flex items-center gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{match?.title || item.title || item.slug || item.id}</div>
                  {missing ? (
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      Not found in the {noun} list any more. The website skips it.
                    </div>
                  ) : (
                    match?.hint && <div className="truncate text-xs text-muted-foreground">{match.hint}</div>
                  )}
                </div>
                {canOpenRecord && (
                  <Link
                    href={RECORD_EDIT_ROUTES[recordType](item.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    title={`Edit the ${noun} itself (changes every page that uses it)`}
                  >
                    <ExternalLink className="size-4" />
                    <span className="sr-only">Edit the {noun} itself</span>
                  </Link>
                )}
                {multiple && selected.length > 1 && (
                  <>
                    <Button type="button" variant="ghost" size="icon-xs" disabled={index === 0} onClick={() => onChange(moveItem(selected, index, index - 1))}>
                      <ArrowUp />
                      <span className="sr-only">Move up</span>
                    </Button>
                    <Button type="button" variant="ghost" size="icon-xs" disabled={index === selected.length - 1} onClick={() => onChange(moveItem(selected, index, index + 1))}>
                      <ArrowDown />
                      <span className="sr-only">Move down</span>
                    </Button>
                  </>
                )}
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeAt(index)}>
                  <X />
                  <span className="sr-only">Remove from this page</span>
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between font-normal">
            <span className="text-muted-foreground">
              {multiple ? `Add ${noun}s` : selected.length ? `Change ${noun}` : `Choose ${noun}`}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) min-w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${noun}s`} className="h-9" />
            <CommandList>
              {isLoading && <div className="px-3 py-4 text-sm text-muted-foreground">Loading...</div>}
              {isError && (
                <div className="px-3 py-4 text-sm text-red-500">
                  Could not load the {noun} list{error?.response?.data?.message ? `: ${error.response.data.message}` : "."}
                </div>
              )}
              {!isLoading && !isError && <CommandEmpty>No {noun} found.</CommandEmpty>}
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem key={option.id} value={`${option.title} ${option.hint} ${option.slug} ${option.id}`} onSelect={() => toggle(option)}>
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{option.title}</div>
                      {option.hint && <div className="truncate text-xs text-muted-foreground">{option.hint}</div>}
                    </div>
                    <Check className={cn("ml-auto opacity-0", { "opacity-100": selectedIds.has(option.id) })} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        Removing a {noun} here only removes it from this page. The {noun} itself is not deleted.
      </p>
    </div>
  );
}
