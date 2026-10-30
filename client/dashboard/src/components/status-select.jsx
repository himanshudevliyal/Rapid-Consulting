"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Colours of the status pill: yellow draft, green published, grey for anything else.
const TONES = {
  draft: "border-amber-500 bg-amber-400 text-black hover:bg-amber-300",
  published: "border-green-700 bg-green-600 text-white hover:bg-green-500",
};
const OTHER_TONE = "border-slate-400 bg-slate-200 text-slate-900 hover:bg-slate-100";

export const PUBLISH_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

const titleCase = (value) => String(value ?? "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Status pill in a listing row that is also a dropdown: picking another status
 * saves it straight away (`onChange(value)` must return the save promise), then
 * refreshes the listing (`queryKey`). The pill changes at once and goes back if
 * the save fails. A status that is not in `options` (for example
 * "identity-review") is still shown and kept selectable.
 *
 *   <StatusSelect value={row.status} onChange={(status) => save(row.id, status)} queryKey={["articles"]} />
 */
export function StatusSelect({ value, onChange, queryKey, options = PUBLISH_OPTIONS, label = "Status" }) {
  const queryClient = useQueryClient();
  const [current, setCurrent] = useState(value ?? "draft");
  const [pending, setPending] = useState(false);
  useEffect(() => setCurrent(value ?? "draft"), [value]);

  const choices = options.some((option) => option.value === current)
    ? options
    : [...options, { value: current, label: titleCase(current) }];

  const change = async (next) => {
    if (next === current) return;
    const previous = current;
    setCurrent(next);
    setPending(true);
    try {
      await onChange(next);
      toast.success(`Status changed to ${choices.find((c) => c.value === next)?.label ?? next}`);
      if (queryKey) queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      setCurrent(previous);
      toast.error(error?.response?.data?.message || "Could not change the status");
    } finally {
      setPending(false);
    }
  };

  return (
    // The row may open the record on click: the dropdown must not.
    <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <Select value={current} onValueChange={change} disabled={pending}>
        <SelectTrigger
          size="sm"
          aria-label={label}
          className={cn(
            "h-7! w-fit gap-1 rounded-md px-2.5 text-xs font-semibold shadow-none [&_svg]:text-current! [&_svg]:opacity-80",
            TONES[current] ?? OTHER_TONE,
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {choices.map((choice) => (
            <SelectItem key={choice.value} value={choice.value} className="text-xs">
              {choice.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
