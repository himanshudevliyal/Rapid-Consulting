import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PAGE_STATUSES, TRANSLATION_STATUSES, localeLabel } from "@/lib/site-page";

export function StatusChip({ status }) {
  const item = PAGE_STATUSES[status] ?? { label: status || "Unknown", className: "" };
  return <Badge variant="outline" className={cn(item.className)}>{item.label}</Badge>;
}

export function TranslationChip({ status }) {
  if (!status) return null;
  const item = TRANSLATION_STATUSES[status] ?? { label: status, className: "" };
  return <Badge variant="outline" className={cn(item.className)}>{item.label}</Badge>;
}

export function LocaleChip({ locale }) {
  return (
    <Badge variant="secondary" title={localeLabel(locale)}>
      {(locale || "").toUpperCase()}
    </Badge>
  );
}

export function UnpublishedChangesChip({ show }) {
  if (!show) return null;
  return (
    <Badge variant="outline" className="border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300">
      Unpublished changes
    </Badge>
  );
}
