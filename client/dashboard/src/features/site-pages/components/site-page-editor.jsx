"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, History, Loader2, Monitor, Save, Send, Trash2, Undo2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { DeleteDialog } from "@/components/delete-dialog";
import { FieldError, FormCard as Card, FormColumns } from "@/components/form-layout";
import Loader from "@/components/loader";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateSitePageTranslation,
  useDeleteSitePage,
  usePublishSitePage,
  useSitePage,
  useSitePageRegistry,
  useSubmitSitePageForReview,
  useUnpublishSitePage,
  useUpdateSitePage,
} from "@/hooks/use-site-pages";
import { handleError } from "@/lib/handle-error-toast";
import { handleSuccessToast } from "@/lib/handle-success-toast";
import {
  TRANSLATION_STATUS_OPTIONS,
  deepClone,
  formatDateTime,
  localeLabel,
  newId,
  otherLocale,
  pageChecks,
  recordOf,
  sectionsForPayload,
} from "@/lib/site-page";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { sectionsSchema, sitePageMetaSchema } from "@/schemas/site-page";
import PreviewDialog from "./preview-dialog";
import RevisionsSheet from "./revisions-sheet";
import SectionBuilder from "./section-builder";
import { LocaleChip, StatusChip, TranslationChip, UnpublishedChangesChip } from "./status-chips";

const LIST_URL = "/site-pages?page=1&limit=10";
const selectClass = "h-9 w-full rounded-md border bg-transparent px-3 text-sm";

const emptyMeta = {
  path: "",
  title: "",
  h1: "",
  meta_title: "",
  meta_description: "",
  translation_status: "not_needed",
};

const toMeta = (page) => ({
  path: page?.path ?? "",
  title: page?.title ?? "",
  h1: page?.h1 ?? "",
  meta_title: page?.meta_title ?? "",
  meta_description: page?.meta_description ?? "",
  translation_status: TRANSLATION_STATUS_OPTIONS.some((option) => option.value === page?.translation_status)
    ? page.translation_status
    : "not_needed",
});

// Sections from the API, made safe for the editor (ids, flags, objects).
const normalizeSections = (sections) =>
  (Array.isArray(sections) ? sections : []).map((section) => ({
    id: section?.id || newId(),
    type: section?.type ?? "",
    variant: section?.variant ?? "",
    visible: section?.visible !== false,
    label: section?.label ?? "",
    anchor: section?.anchor ?? "",
    data: section?.data && typeof section.data === "object" && !Array.isArray(section.data) ? deepClone(section.data) : {},
  }));

export default function SitePageEditor({ id }) {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const registryQuery = useSitePageRegistry();
  const pageQuery = useSitePage(id);
  const page = recordOf(pageQuery.data);
  const registry = registryQuery.data;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(sitePageMetaSchema),
    defaultValues: emptyMeta,
  });

  const [sections, setSections] = useState([]);
  const [baseline, setBaseline] = useState("[]");
  const sectionsDirty = useMemo(() => JSON.stringify(sections) !== baseline, [sections, baseline]);
  const dirty = isDirty || sectionsDirty;

  const [previewOpen, setPreviewOpen] = useState(false);
  const [savePromptOpen, setSavePromptOpen] = useState(false);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveTo, setLeaveTo] = useState(null);

  // Load the saved page into the form and the section list.
  useEffect(() => {
    if (!page?.id) return;
    const loaded = normalizeSections(page.sections);
    reset(toMeta(page));
    setSections(loaded);
    setBaseline(JSON.stringify(loaded));
  }, [page?.id, page?.version, page?.updated_at]); // eslint-disable-line react-hooks/exhaustive-deps

  // Browser warning when closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const updateMutation = useUpdateSitePage(id);
  const submitMutation = useSubmitSitePageForReview(id, () =>
    handleSuccessToast({ message: "Submitted for review." }),
  );
  const publishMutation = usePublishSitePage(id, () => {
    setPublishOpen(false);
    handleSuccessToast({ message: "Published. The website refreshes this page." });
  });
  const unpublishMutation = useUnpublishSitePage(id, () => {
    setUnpublishOpen(false);
    handleSuccessToast({ message: "Unpublished. The page is no longer on the website." });
  });
  const translationMutation = useCreateSitePageTranslation(id, (data) => {
    const created = recordOf(data);
    handleSuccessToast({ message: "Counterpart created as a draft." });
    if (created?.id) router.push(`/site-pages/${created.id}/edit`);
  });
  const deleteMutation = useDeleteSitePage(id, () => {
    setDeleteOpen(false);
    router.replace(LIST_URL);
  });

  const template = page?.template;
  const templateConfig = registry?.templates?.[template];
  const checks = useMemo(
    () => (registry && template ? pageChecks({ template, sections, registry }) : []),
    [registry, template, sections],
  );
  const blockingChecks = checks.filter((check) => check.level === "error");

  // Saves the draft. Resolves true when it was saved.
  const saveDraft = async () => {
    let saved = false;
    await handleSubmit(
      async (values) => {
        const payloadSections = sectionsForPayload(sections);
        const parsed = sectionsSchema.safeParse(payloadSections);
        if (!parsed.success) {
          handleError({ error: { message: parsed.error.issues[0]?.message ?? "Check the sections." } });
          return;
        }
        try {
          await updateMutation.mutateAsync({ ...values, sections: payloadSections });
          handleSuccessToast({ message: "Draft saved." });
          saved = true;
        } catch {
          // The error toast is shown by the query client.
        }
      },
      () => handleError({ error: { message: "Please fix the highlighted fields." } }),
    )();
    return saved;
  };

  const goTo = (href) => {
    if (dirty) setLeaveTo(href);
    else router.push(href);
  };

  const onPreview = () => {
    if (dirty) setSavePromptOpen(true);
    else setPreviewOpen(true);
  };

  const saveThenPreview = async () => {
    const saved = await saveDraft();
    setSavePromptOpen(false);
    if (saved) setPreviewOpen(true);
  };

  if (pageQuery.isLoading || registryQuery.isLoading) return <Loader />;
  if (pageQuery.isError) return <ErrorMessage error={pageQuery.error} />;
  if (registryQuery.isError) return <ErrorMessage error={registryQuery.error} />;
  if (!page?.id) return <ErrorMessage error={{ message: "Page not found." }} />;

  const other = otherLocale(page.locale);
  const counterparts = Array.isArray(page.counterparts) ? page.counterparts : [];
  const counterpart = counterparts.find((item) => item.locale === other);
  const busy = updateMutation.isPending || publishMutation.isPending || unpublishMutation.isPending || submitMutation.isPending;
  const published = page.status === "published";
  const metaTitleLength = (watch("meta_title") ?? "").length;
  const metaDescriptionLength = (watch("meta_description") ?? "").length;
  const pathValue = watch("path") ?? "";

  return (
    <div className="space-y-6">
      {/* Header: what this page is */}
      <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold">{page.title || "Untitled page"}</h2>
          <StatusChip status={page.status} />
          <UnpublishedChangesChip show={published && !!page.has_unpublished_changes} />
          <TranslationChip status={page.translation_status} />
          {dirty && (
            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300">
              Unsaved changes
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <LocaleChip locale={page.locale} />
            <span className="font-mono">/{page.locale}/{page.path}</span>
          </span>
          <span>
            Template: <span className="text-foreground">{templateConfig?.label ?? template}</span>
          </span>
          <span>Version {page.version ?? 1}</span>
          <span>Updated {formatDateTime(page.updated_at)}</span>
          {page.published_at && <span>Published {formatDateTime(page.published_at)}</span>}
        </div>

        {/* Language versions: each has its own sections and review state. */}
        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          <span className="text-sm font-medium">Language versions</span>
          <Badge variant="default">{localeLabel(page.locale)} (this one)</Badge>
          {counterpart ? (
            <>
              <Button type="button" size="sm" variant="outline" onClick={() => goTo(`/site-pages/${counterpart.id}/edit`)}>
                Open {localeLabel(other)} version
              </Button>
              <StatusChip status={counterpart.status} />
              <TranslationChip status={counterpart.translation_status} />
            </>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={dirty || translationMutation.isPending}
                onClick={() => translationMutation.mutate(other)}
              >
                {translationMutation.isPending && <Loader2 className="animate-spin" />}
                Create {localeLabel(other)} counterpart
              </Button>
              <span className="text-xs text-muted-foreground">
                {dirty ? "Save the draft first. " : ""}No {localeLabel(other)} version yet. It starts as a copy and has its own sections.
              </span>
            </>
          )}
        </div>
      </div>

      <form onSubmit={(event) => event.preventDefault()} className="space-y-6">
        <FormColumns
          main={
            <Card
              title="Sections"
              description="Build the page from the sections this template allows. Order here is the order on the page."
            >
              {templateConfig ? (
                <SectionBuilder
                  template={template}
                  registry={registry}
                  sections={sections}
                  onChange={setSections}
                  disabled={busy}
                />
              ) : (
                <ErrorMessage error={{ message: `The template "${template}" is not in the registry.` }} />
              )}
              {templateConfig && sections.length === 0 && templateConfig.first && (
                <p className="text-xs text-muted-foreground">
                  Required on this template: {(templateConfig.required ?? []).map((type) => registry.blocks?.[type]?.label ?? type).join(", ") || "none"}.
                </p>
              )}
            </Card>
          }
          side={
            <>
              <Card title="Page checks" description="What would stop this page from publishing.">
                {checks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing to fix.</p>
                ) : (
                  <ul className="space-y-1.5 text-sm">
                    {checks.map((check, index) => (
                      <li key={index} className="flex gap-2">
                        <AlertTriangle
                          className={cn("mt-0.5 size-4 shrink-0", check.level === "error" ? "text-red-500" : "text-amber-500")}
                        />
                        <span>{check.message}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card title="Page details" description="This page and language only.">
                <div className="space-y-1">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" {...register("title")} />
                  <FieldError error={errors.title} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="h1">Heading (H1)</Label>
                  <Input id="h1" {...register("h1")} placeholder="Defaults to the title" />
                  <FieldError error={errors.h1} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="path">Path *</Label>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-sm text-muted-foreground">/{page.locale}/</span>
                    <Input id="path" className="font-mono text-sm" readOnly={page.template === "managed"} {...register("path")} />
                  </div>
                  <FieldError error={errors.path} />
                  {published && pathValue !== page.path && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Changing the path of a published page changes its public address when the changes are published.
                    </p>
                  )}
                </div>
              </Card>

              <Card title="Search engines" description="Optional. Empty = the website uses the title.">
                <div className="space-y-1">
                  <Label htmlFor="meta_title">Meta title</Label>
                  <Input id="meta_title" {...register("meta_title")} />
                  <p className="text-xs text-muted-foreground">{metaTitleLength} characters (about 60 works best)</p>
                  <FieldError error={errors.meta_title} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="meta_description">Meta description</Label>
                  <Textarea id="meta_description" rows={3} {...register("meta_description")} />
                  <p className="text-xs text-muted-foreground">{metaDescriptionLength} characters (about 155 works best)</p>
                  <FieldError error={errors.meta_description} />
                </div>
              </Card>

              <Card title="Translation review" description={`Review state of this ${localeLabel(page.locale)} version.`}>
                <select id="translation_status" className={selectClass} {...register("translation_status")}>
                  {TRANSLATION_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FieldError error={errors.translation_status} />
                <p className="text-xs text-muted-foreground">
                  Rearranging this version never changes the other language. Facts must be checked in both.
                </p>
              </Card>

              {isAdmin && (
                <Card title="Delete page">
                  <p className="text-sm text-muted-foreground">
                    Removes this page and its revisions for good. The other language version is not touched.
                  </p>
                  <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                    <Trash2 /> Delete this page
                  </Button>
                </Card>
              )}
            </>
          }
        />
      </form>

      {/* Actions */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Button type="button" variant="ghost" asChild>
          <Link
            href={LIST_URL}
            onClick={(event) => {
              if (dirty) {
                event.preventDefault();
                setLeaveTo(LIST_URL);
              }
            }}
          >
            Back to list
          </Link>
        </Button>
        <Button type="button" variant="outline" onClick={() => setRevisionsOpen(true)}>
          <History /> Revisions
        </Button>
        <Button type="button" variant="outline" onClick={onPreview}>
          <Monitor /> Preview
        </Button>
        <Button type="button" onClick={saveDraft} disabled={busy || !dirty}>
          {updateMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />} Save draft
        </Button>
        {page.status !== "review" && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy || dirty}
            title={dirty ? "Save the draft first" : undefined}
            onClick={() => submitMutation.mutate()}
          >
            {submitMutation.isPending ? <Loader2 className="animate-spin" /> : <Send />} Submit for review
          </Button>
        )}
        {isAdmin && (!published || page.has_unpublished_changes) && (
          <Button
            type="button"
            disabled={busy || dirty || blockingChecks.length > 0}
            title={dirty ? "Save the draft first" : blockingChecks.length ? "Fix the page checks first" : undefined}
            onClick={() => setPublishOpen(true)}
          >
            <Upload /> {published ? "Publish changes" : "Publish"}
          </Button>
        )}
        {isAdmin && published && (
          <Button type="button" variant="outline" disabled={busy} onClick={() => setUnpublishOpen(true)}>
            <Undo2 /> Unpublish
          </Button>
        )}
        {!isAdmin && (
          <span className="text-xs text-muted-foreground">An administrator publishes the page after review.</span>
        )}
      </div>

      <PreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} pageId={id} locale={page.locale} />

      <RevisionsSheet
        open={revisionsOpen}
        onOpenChange={setRevisionsOpen}
        pageId={id}
        registry={registry}
        canRestore={isAdmin}
        hasUnsavedChanges={dirty}
        onRestored={() => setRevisionsOpen(false)}
      />

      {/* Save before preview */}
      <AlertDialog open={savePromptOpen} onOpenChange={setSavePromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save before previewing?</AlertDialogTitle>
            <AlertDialogDescription>
              The preview shows the last saved draft. You have unsaved changes, so save them first to see them in the preview.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="button" disabled={updateMutation.isPending} onClick={saveThenPreview}>
              {updateMutation.isPending && <Loader2 className="animate-spin" />} Save draft and preview
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish / unpublish */}
      <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{published ? "Publish these changes?" : "Publish this page?"}</AlertDialogTitle>
            <AlertDialogDescription>
              The {localeLabel(page.locale)} page at /{page.locale}/{page.path} goes live with the saved draft and the website is
              refreshed. The {localeLabel(other)} version is not published by this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={publishMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                publishMutation.mutate();
              }}
            >
              {publishMutation.isPending && <Loader2 className="animate-spin" />} Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={unpublishOpen} onOpenChange={setUnpublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish this page?</AlertDialogTitle>
            <AlertDialogDescription>
              The page is taken off the website. Its draft and revisions are kept and it can be published again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={unpublishMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                unpublishMutation.mutate();
              }}
            >
              {unpublishMutation.isPending && <Loader2 className="animate-spin" />} Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave with unsaved changes */}
      <AlertDialog open={leaveTo !== null} onOpenChange={(open) => !open && setLeaveTo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>Your unsaved changes to this page will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const href = leaveTo;
                setLeaveTo(null);
                if (href) router.push(href);
              }}
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={deleteOpen}
        setIsOpen={setDeleteOpen}
        id={id}
        title="Delete this page?"
        description="The page and its revisions are deleted for good, and it is removed from the website if it was published. The other language version is not touched."
      />
    </div>
  );
}
