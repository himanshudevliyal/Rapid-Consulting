"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, History, Loader2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRestoreSitePageRevision, useSitePageRevisions } from "@/hooks/use-site-pages";
import { fetchSitePageRevision } from "@/services/site-page-service";
import { handleSuccessToast } from "@/lib/handle-success-toast";
import { formatDateTime, listOf } from "@/lib/site-page";

const ACTION_LABELS = {
  save: "Saved",
  submit: "Submitted for review",
  publish: "Published",
  unpublish: "Unpublished",
  restore: "Restored",
  translate: "Counterpart created",
};

// What a revision held: the details and the list of sections.
function RevisionDetails({ pageId, revisionId, registry }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["site-pages", "revision", pageId, revisionId],
    queryFn: () => fetchSitePageRevision(pageId, revisionId),
  });
  if (isLoading) return <p className="text-xs text-muted-foreground">Loading...</p>;
  if (isError) return <p className="text-xs text-red-500">Could not load this revision.</p>;
  const snapshot = data?.snapshot ?? data?.data?.snapshot ?? {};
  const sections = Array.isArray(snapshot.sections) ? snapshot.sections : [];
  return (
    <div className="space-y-2 text-xs">
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-muted-foreground">Title</dt>
        <dd>{snapshot.title || "-"}</dd>
        <dt className="text-muted-foreground">Path</dt>
        <dd className="font-mono">/{snapshot.path || ""}</dd>
        <dt className="text-muted-foreground">Sections</dt>
        <dd>{sections.length}</dd>
      </dl>
      {sections.length > 0 && (
        <ol className="list-decimal space-y-0.5 pl-5">
          {sections.map((section, index) => (
            <li key={section.id ?? index} className={section.visible === false ? "text-muted-foreground line-through" : ""}>
              {section.label || registry?.blocks?.[section.type]?.label || section.type}
              <span className="text-muted-foreground"> ({registry?.blocks?.[section.type]?.label ?? section.type})</span>
              {section.visible === false ? " - hidden" : ""}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// Revision history of a page. Anyone who can edit may read it; restoring a
// revision puts its content into the draft and is for administrators.
export default function RevisionsSheet({ open, onOpenChange, pageId, registry, canRestore, hasUnsavedChanges, onRestored }) {
  const { data, isLoading, isError, error } = useSitePageRevisions(pageId, open);
  const [details, setDetails] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const restoreMutation = useRestoreSitePageRevision(pageId, () => {
    setConfirmId(null);
    handleSuccessToast({ message: "Revision restored into the draft." });
    onRestored?.();
  });
  const revisions = listOf(data);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="size-5" /> Revisions
          </SheetTitle>
          <SheetDescription>
            The last 50 saves and actions on this page. Restoring puts that version into the draft; it does not publish it.
          </SheetDescription>
        </SheetHeader>
        <SheetPanel>
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" /> Loading...
            </div>
          )}
          {isError && (
            <p className="text-sm text-red-500">
              Could not load the revisions{error?.response?.data?.message ? `: ${error.response.data.message}` : "."}
            </p>
          )}
          {!isLoading && !isError && revisions.length === 0 && (
            <p className="text-sm text-muted-foreground">No revisions yet. One is added each time the page is saved.</p>
          )}
          <ul className="space-y-2">
            {revisions.map((revision) => {
              const showDetails = details === revision.id;
              const confirming = confirmId === revision.id;
              return (
                <li key={revision.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">v{revision.version}</Badge>
                    <span className="font-medium">{ACTION_LABELS[revision.action] ?? revision.action}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{formatDateTime(revision.created_at)}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {revision.created_by_name ? `by ${revision.created_by_name}` : ""}
                    {revision.note ? ` - ${revision.note}` : ""}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button type="button" size="xs" variant="ghost" onClick={() => setDetails(showDetails ? null : revision.id)}>
                      {showDetails ? <ChevronDown /> : <ChevronRight />} What it held
                    </Button>
                    {canRestore && !confirming && (
                      <Button type="button" size="xs" variant="outline" onClick={() => setConfirmId(revision.id)}>
                        <RotateCcw /> Restore
                      </Button>
                    )}
                  </div>

                  {showDetails && (
                    <div className="mt-2 rounded-md bg-muted/40 p-2">
                      <RevisionDetails pageId={pageId} revisionId={revision.id} registry={registry} />
                    </div>
                  )}

                  {confirming && (
                    <div className="mt-2 space-y-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs">
                      <p>
                        Replace the current draft with version {revision.version}?
                        {hasUnsavedChanges ? " Your unsaved changes in the editor will be lost." : ""} The current draft stays
                        in the history.
                      </p>
                      <div className="flex gap-2">
                        <Button type="button" size="xs" disabled={restoreMutation.isPending} onClick={() => restoreMutation.mutate(revision.id)}>
                          {restoreMutation.isPending && <Loader2 className="animate-spin" />} Yes, restore
                        </Button>
                        <Button type="button" size="xs" variant="outline" onClick={() => setConfirmId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </SheetPanel>
      </SheetContent>
    </Sheet>
  );
}
