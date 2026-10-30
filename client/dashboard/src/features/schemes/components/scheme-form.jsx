"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import Loader from "@/components/loader";
import TextEditor from "@/components/editor";
import AuthorReviewerCard from "@/components/author-reviewer-card";
import CategoryField from "@/components/category-field";
import CommandMenu from "@/components/command-menu";
import FileUploaderServer from "@/components/file-uploader-server";
import PdfUploader from "@/components/pdf-uploader";
import { FieldError, FormCard as Card, FormColumns } from "@/components/form-layout";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SectionsEditor from "@/features/services/components/sections-editor";
import { schemeSectionRoles } from "@/data/service-constants";
import { useAllServiceFamilyTopics } from "@/hooks/use-service-options";
import { useCreateScheme, useScheme, useUpdateScheme } from "@/hooks/use-schemes";
import { slugify } from "@/lib/service-form";
import { buildPayload, emptyScheme, RICH_FIELDS, toFormValues } from "@/lib/scheme-form";
import { cn } from "@/lib/utils";
import { SCHEME_STATUSES, schemeFormSchema } from "@/schemas/scheme";

const LIST_URL = "/schemes?page=1&limit=10";

export default function SchemeForm({ id, type = "create" }) {
  const isEdit = type === "edit";
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(schemeFormSchema),
    defaultValues: emptyScheme,
  });

  const quickFacts = useFieldArray({ control, name: "quick_facts" });

  const done = (message) => () => {
    toast.success(message);
    router.replace(LIST_URL);
  };
  const createMutation = useCreateScheme(done("Scheme created"));
  const updateMutation = useUpdateScheme(id, done("Scheme updated"));
  const { data, isLoading, isError, error } = useScheme(id);

  // Family / topics are picked by name; the scheme stores the code as a tag.
  const topics = useAllServiceFamilyTopics();
  const topicRows = topics.data?.data;
  const topicsReady = topics.isSuccess || topics.isError;
  const familyCode = watch("family_code");
  const topicOptions = useMemo(() => {
    const rows = topicRows ?? [];
    const list = rows.filter((row) => row.is_active).map((row) => ({ value: row.code, label: row.name }));
    if (familyCode && !list.some((o) => o.value === familyCode)) {
      const row = rows.find((r) => r.code === familyCode);
      list.push({ value: familyCode, label: `${row ? row.name : familyCode} (inactive)` });
    }
    return list;
  }, [topicRows, familyCode]);

  // Load the saved scheme into the form (edit only), once the topic names are
  // known so its Family / topic tag can be shown by name.
  useEffect(() => {
    if (isEdit && data && topicsReady) {
      reset(toFormValues(data, (topicRows ?? []).map((row) => row.code)));
    }
  }, [isEdit, data?.id, data?.updated_at, topicsReady, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  // On a new scheme, suggest the slug while the title is typed, until the
  // slug is edited by hand.
  const titleField = register("title");
  const suggestSlug = (event) => {
    titleField.onChange(event);
    if (!isEdit && !dirtyFields.slug) {
      setValue("slug", slugify(event.target.value), { shouldValidate: false });
    }
  };

  const submit = (values) => {
    const payload = buildPayload(values);
    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };
  const invalid = () => toast.error("Please fix the highlighted fields");

  if (isEdit && isLoading) return <Loader />;
  if (isEdit && isError) return <ErrorMessage error={error} />;

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(submit, invalid)} className="space-y-6">
      <FormColumns
        main={
          <>
            <Card title="Basics" description="The title, public address and official details of the scheme.">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    className={cn({ "border-red-500": errors.title })}
                    {...titleField}
                    onChange={suggestSlug}
                    placeholder="Scheme title"
                  />
                  <FieldError error={errors.title} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="slug">Slug (page address)</Label>
                  <Input
                    id="slug"
                    className={cn("font-mono text-sm", { "border-red-500": errors.slug })}
                    {...register("slug")}
                    placeholder="made-from-the-title"
                  />
                  <FieldError error={errors.slug} />
                  <p className="text-xs text-muted-foreground">
                    {isEdit
                      ? "Changing it changes the public link of this scheme."
                      : "Filled in from the title; leave it as it is or edit it."}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ministry">Ministry / department</Label>
                  <Input id="ministry" {...register("ministry")} placeholder="Responsible ministry" />
                  <FieldError error={errors.ministry} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="official_url">Official URL</Label>
                  <Input id="official_url" className={cn({ "border-red-500": errors.official_url })} {...register("official_url")} placeholder="https://…" />
                  <FieldError error={errors.official_url} />
                </div>

              </div>
            </Card>

            <Card
              title="Quick facts (at a glance)"
              description="The fact box at the top of the scheme page: one row = a label and its text. Add, remove or reorder rows. Rows with an empty text are not shown."
            >
              <div className="space-y-3">
                {quickFacts.fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border p-3">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`quick_facts.${index}.label`}>Label {index + 1}</Label>
                        <Input id={`quick_facts.${index}.label`} {...register(`quick_facts.${index}.label`)} placeholder="e.g. What it pays" />
                        <FieldError error={errors.quick_facts?.[index]?.label} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`quick_facts.${index}.value`}>Text</Label>
                        <Input
                          id={`quick_facts.${index}.value`}
                          {...register(`quick_facts.${index}.value`)}
                          placeholder={field.example || "Write the fact"}
                        />
                        <FieldError error={errors.quick_facts?.[index]?.value} />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="h-4 w-4" {...register(`quick_facts.${index}.bold`)} />
                        Show the text larger / bold
                      </label>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="icon" disabled={index === 0} onClick={() => quickFacts.move(index, index - 1)} aria-label="Move row up">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={index === quickFacts.fields.length - 1}
                          onClick={() => quickFacts.move(index, index + 1)}
                          aria-label="Move row down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="destructive" size="icon" onClick={() => quickFacts.remove(index)} aria-label="Remove row">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={() => quickFacts.append({ label: "", value: "", bold: false })}>
                  <Plus className="h-4 w-4" /> Add row
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                The ministry / department above is shown as the authority. A row labelled "Official source" with an empty text links to the Official URL.
              </p>
            </Card>

            <Card title="Card summary" description="Short facts used on scheme cards and lists (and as a fallback when there are no quick-facts rows).">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="assistance_type">Type of assistance</Label>
                  <Input id="assistance_type" {...register("assistance_type")} placeholder="e.g. Capital subsidy" />
                  <FieldError error={errors.assistance_type} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="relevant_activity">Relevant activity</Label>
                  <Input id="relevant_activity" {...register("relevant_activity")} placeholder="e.g. Manufacturing" />
                  <FieldError error={errors.relevant_activity} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="policy_period">Policy period</Label>
                  <Input id="policy_period" {...register("policy_period")} placeholder="e.g. 2022-2027" />
                  <FieldError error={errors.policy_period} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="application_window">Application window</Label>
                  <Input id="application_window" {...register("application_window")} placeholder="e.g. Open throughout the year" />
                  <FieldError error={errors.application_window} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                    {...register("status")}
                  >
                    <option value="">Not set</option>
                    {SCHEME_STATUSES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FieldError error={errors.status} />
                </div>
              </div>
            </Card>

            <Card title="Content" description="Shown on the scheme page.">
              {RICH_FIELDS.map(([name, label, hint]) => (
                <div key={name} className="space-y-1">
                  <Label>{label}</Label>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                  <Controller
                    control={control}
                    name={name}
                    render={({ field }) => <TextEditor value={field.value ?? ""} onChange={field.onChange} />}
                  />
                </div>
              ))}
            </Card>

            <Card
              title="More page sections"
              description="Extra sections of the scheme page, in order: Does it fit (cards), Who can apply, What you get, Watch out, How it's claimed (steps), FAQs. Pick the layout for each; the heading and text are yours."
            >
              <SectionsEditor control={control} register={register} name="sections" errors={errors.sections} roles={schemeSectionRoles} />
            </Card>
          </>
        }
        side={
          <>
            <Card title="Status">
              <label htmlFor="is_published" className="flex items-start gap-2 text-sm">
                <input id="is_published" type="checkbox" className="mt-0.5 h-4 w-4" {...register("is_published")} />
                <span>
                  Published
                  <span className="block text-xs text-muted-foreground">Unticked schemes stay hidden on the website.</span>
                </span>
              </label>
              <label htmlFor="is_featured" className="flex items-start gap-2 text-sm">
                <input id="is_featured" type="checkbox" className="mt-0.5 h-4 w-4" {...register("is_featured")} />
                <span>
                  Show on the home page
                  <span className="block text-xs text-muted-foreground">Featured, published schemes appear in the home page Schemes section.</span>
                </span>
              </label>
            </Card>

            <AuthorReviewerCard control={control} register={register} setValue={setValue} watch={watch} errors={errors} />

            <Card title="Family / topic">
              <Controller
                control={control}
                name="family_code"
                render={({ field }) => (
                  <CommandMenu
                    data={topicOptions}
                    value={field.value}
                    onChange={(val) => field.onChange(val ?? "")}
                    searchPlaceholder="Search family / topic"
                    isLoading={topics.isLoading}
                    isError={topics.isError}
                    error={topics.error}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">The group this scheme belongs to, same list as services.</p>
            </Card>

            <Card title="Category">
              <Controller
                control={control}
                name="category_id"
                render={({ field }) => (
                  <CategoryField value={field.value} onChange={field.onChange} hasError={!!errors.category_id} />
                )}
              />
              <FieldError error={errors.category_id} />
            </Card>

            <Card title="Image" description="Shown on cards and at the top of the page.">
              <Controller
                control={control}
                name="cover_image"
                render={({ field }) => (
                  <FileUploaderServer value={field.value} onFileChange={(path) => field.onChange(path ?? "")} />
                )}
              />
              <FieldError error={errors.cover_image} />
            </Card>

            <Card title="PDF" description="Optional. Shown on the page as a link that opens the PDF in a new tab.">
              <Controller
                control={control}
                name="pdf_url"
                render={({ field }) => <PdfUploader value={field.value} onChange={(path) => field.onChange(path ?? "")} />}
              />
              <FieldError error={errors.pdf_url} />
            </Card>

            <Card title="Tags">
              <Input id="tags" {...register("tags")} placeholder="S01, subsidy, msme" />
              <p className="text-xs text-muted-foreground">Separate with commas.</p>
            </Card>
          </>
        }
      />

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Button type="button" variant="outline" asChild>
          <Link href={LIST_URL}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 animate-spin" />} {isEdit ? "Save changes" : "Create scheme"}
        </Button>
      </div>
    </form>
  );
}
