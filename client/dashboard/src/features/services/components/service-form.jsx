"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/delete-dialog";
import StringArrayField from "@/components/string-array-field";
import CategoryField from "@/components/category-field";
import CommandMenu from "@/components/command-menu";
import FileUploaderServer from "@/components/file-uploader-server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { serviceIcons } from "@/data/service-constants";
import { useDeleteServiceTranslation } from "@/hooks/use-services";
import { useAllServiceFamilyTopics, useAllServiceFormats } from "@/hooks/use-service-options";
import { buildPayload, emptyContent, LOCALES, toFormValues } from "@/lib/service-form";
import { cn } from "@/lib/utils";
import { serviceFormSchema } from "@/schemas/service";
import LocaleContent from "./locale-content";

const selectClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

// Active options, plus the service's current value even if it is no longer
// active (so editing an old service never silently changes its Format/topic).
const optionList = (rows = [], current) => {
  const list = rows.filter((row) => row.is_active).map((row) => ({ value: row.code, label: row.name }));
  if (current && !list.some((o) => o.value === current)) {
    const row = rows.find((r) => r.code === current);
    list.push({ value: current, label: `${row ? row.name : current} (inactive)` });
  }
  return list;
};

function Card({ title, description, children }) {
  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function ServiceForm({ initialData, onSubmit, loading }) {
  const isEdit = !!initialData;
  const serverHasHindi = !!initialData?.translations?.some((t) => t.locale === "hi");

  const [activeLocale, setActiveLocale] = useState("en");
  const [hasHindi, setHasHindi] = useState(serverHasHindi);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: toFormValues(initialData),
  });

  // Load a different service (or a fresh save) into the form.
  useEffect(() => {
    if (!initialData) return;
    reset(toFormValues(initialData));
    setHasHindi(initialData.translations?.some((t) => t.locale === "hi") ?? false);
  }, [initialData?.id, initialData?.updated_at, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  const formats = useAllServiceFormats();
  const topics = useAllServiceFamilyTopics();
  const type = watch("type");
  const isFamilyPage = type === "service-family";
  const familyCode = watch("family_code");
  const pageCode = watch("code");
  const formatOptions = useMemo(() => optionList(formats.data?.data, type), [formats.data, type]);
  const topicOptions = useMemo(() => optionList(topics.data?.data, isFamilyPage ? pageCode : familyCode), [topics.data, isFamilyPage, pageCode, familyCode]);

  const removeServerHindi = useDeleteServiceTranslation(initialData?.id, "hi", () => {
    toast.success("Hindi version deleted");
    setIsRemoveOpen(false);
    setHasHindi(false);
    setValue("content.hi", emptyContent());
    setActiveLocale("en");
  });

  const addHindi = () => {
    // Start from the English text so it can be translated in place.
    const copy = JSON.parse(JSON.stringify(getValues("content.en")));
    setValue("content.hi", { ...copy, status: "draft" });
    setHasHindi(true);
    setActiveLocale("hi");
  };

  const removeHindi = () => {
    if (serverHasHindi) {
      setIsRemoveOpen(true);
      return;
    }
    setHasHindi(false);
    setValue("content.hi", emptyContent());
    setActiveLocale("en");
  };

  const submit = (values) => {
    if (hasHindi && !values.content.hi.title?.trim()) {
      setError("content.hi.title", { message: "Title is required" });
      setActiveLocale("hi");
      toast.error("Add a title for the Hindi version, or remove it.");
      return;
    }
    if (!isEdit && isFamilyPage && !values.code?.trim()) {
      setError("code", { message: "Choose the Family / topic this page is for" });
      toast.error("Choose the Family / topic this page is for.");
      return;
    }
    onSubmit(buildPayload(values, { locales: hasHindi ? ["en", "hi"] : ["en"], isEdit }));
  };

  const invalid = (formErrors) => {
    if (formErrors.content?.en) {
      setActiveLocale("en");
      toast.error("Please fix the highlighted fields in the English content.");
    } else if (formErrors.content?.hi && hasHindi) {
      setActiveLocale("hi");
      toast.error("Please fix the highlighted fields in the Hindi content.");
    } else {
      toast.error("Please fix the highlighted fields.");
    }
  };

  const tabHasError = (locale) => !!errors.content?.[locale] && (locale === "en" || hasHindi);

  return (
    <form onSubmit={handleSubmit(submit, invalid)} className="space-y-6">
      <Card title="Basics" description="Where this service sits and how it is addressed. The Format and Family / topic lists are managed under Services.">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          <div className="space-y-1">
            <Label htmlFor="type">Format *</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <CommandMenu
                  data={formatOptions}
                  value={field.value}
                  onChange={(val) => field.onChange(val ?? "")}
                  searchPlaceholder="Search format"
                  isLoading={formats.isLoading}
                  isError={formats.isError}
                  error={formats.error}
                  className={cn({ "border-red-500": errors.type })}
                />
              )}
            />
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            <p className="text-xs text-muted-foreground">
              The kind of page. <Link className="underline" href="/services/format?page=1&limit=10">Manage formats</Link>
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="family_code">{isFamilyPage ? "Family / topic this page is for *" : "Family / topic"}</Label>
            <Controller
              control={control}
              name={isFamilyPage ? "code" : "family_code"}
              render={({ field }) => (
                <CommandMenu
                  data={topicOptions}
                  value={field.value}
                  onChange={(val) => field.onChange(val ?? "")}
                  searchPlaceholder="Search family / topic"
                  isLoading={topics.isLoading}
                  isError={topics.isError}
                  error={topics.error}
                  disabled={isFamilyPage && isEdit}
                  className={cn({ "border-red-500": errors.code })}
                />
              )}
            />
            {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            <p className="text-xs text-muted-foreground">
              {isFamilyPage
                ? isEdit
                  ? "A Service family page is the landing page of one topic; the topic cannot be changed."
                  : "A Service family page is the landing page of one topic. Pick the topic by name."
                : "The group this service belongs to."}{" "}
              <Link className="underline" href="/services/family-topic?page=1&limit=10">Manage topics</Link>
            </p>
          </div>

          <div className="space-y-1">
            <Label>Category</Label>
            <Controller
              control={control}
              name="category_id"
              render={({ field }) => (
                <CategoryField value={field.value} onChange={field.onChange} hasError={!!errors.category_id} />
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="slug">URL slug</Label>
            <Input id="slug" className={cn({ "border-red-500": errors.slug })} {...register("slug")} placeholder="Auto from the English title" />
            {errors.slug ? (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">/en/services/<b>{watch("slug") || "slug"}</b>. Changing it changes the public link.</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="icon">Icon</Label>
            <select id="icon" className={selectClass} {...register("icon")}>
              <option value="">No icon</option>
              {watch("icon") && !serviceIcons.includes(watch("icon")) && <option value={watch("icon")}>{watch("icon")}</option>}
              {serviceIcons.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input id="sort_order" type="number" {...register("sort_order")} />
            <p className="text-xs text-muted-foreground">Smaller numbers come first.</p>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input id="is_active" type="checkbox" className="h-4 w-4" {...register("is_active")} />
            <Label htmlFor="is_active">Active (visible on the website)</Label>
          </div>
        </div>
      </Card>

      <Card title="Image" description="The main picture of the service. It is also used when the page is shared.">
        <Controller
          control={control}
          name="pictures"
          render={({ field }) => (
            <div className="max-w-md">
              <FileUploaderServer
                value={field.value?.[0] ?? ""}
                // Only the first picture is edited here; any others stay as they are.
                onFileChange={(path) => field.onChange(path ? [path, ...(field.value ?? []).slice(1)] : (field.value ?? []).slice(1))}
              />
            </div>
          )}
        />
      </Card>

      <Card title="Content" description="What visitors read. Each language has its own title, text and sections.">
        <div className="flex flex-wrap items-center gap-2 border-b pb-3">
          {LOCALES.map((locale) => {
            const exists = locale.value === "en" || hasHindi;
            if (!exists) return null;
            return (
              <Button
                key={locale.value}
                type="button"
                size="sm"
                variant={activeLocale === locale.value ? "default" : "outline"}
                onClick={() => setActiveLocale(locale.value)}
              >
                {locale.label}
                {tabHasError(locale.value) && <span className="ml-2 h-2 w-2 rounded-full bg-red-500" aria-label="has errors" />}
              </Button>
            );
          })}
          {!hasHindi && (
            <Button type="button" size="sm" variant="secondary" onClick={addHindi}>
              <Plus className="h-4 w-4" /> Add Hindi version
            </Button>
          )}
          {hasHindi && activeLocale === "hi" && (
            <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={removeHindi}>
              <Trash className="h-4 w-4" /> Remove Hindi version
            </Button>
          )}
        </div>

        {/* Both versions stay mounted so nothing typed is lost when switching tabs. */}
        <div className={activeLocale === "en" ? "block" : "hidden"}>
          <LocaleContent locale="en" control={control} register={register} errors={errors} />
        </div>
        {hasHindi && (
          <div className={activeLocale === "hi" ? "block" : "hidden"}>
            <p className="mb-4 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              The Hindi version started as a copy of the English text. Translate each field; visitors only see Hindi once it is saved.
            </p>
            <LocaleContent locale="hi" control={control} register={register} errors={errors} />
          </div>
        )}
      </Card>

      <Card title="Earlier URLs" description="Related services are picked automatically from the same Family / topic. Old links of this service are kept here for redirects.">
        <div className="space-y-1">
          <Label>Earlier URLs</Label>
          <p className="text-xs text-muted-foreground">Old public links of this service, kept for redirects.</p>
          <StringArrayField control={control} name="legacy_urls" placeholder="https://…" addLabel="Add URL" />
          {Array.isArray(errors.legacy_urls) && errors.legacy_urls.some(Boolean) && (
            <p className="text-sm text-red-500">One of the earlier URLs is not a full URL.</p>
          )}
        </div>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Button type="button" variant="outline" asChild>
          <Link href="/services?page=1&limit=10">Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 animate-spin" />} Save service
        </Button>
      </div>

      <DeleteDialog
        isOpen={isRemoveOpen}
        setIsOpen={setIsRemoveOpen}
        deleteMutation={removeServerHindi}
        id={initialData?.id}
        title="Delete the Hindi version?"
        description="The saved Hindi text of this service is deleted. Visitors then see the English page. The English version is not changed."
      />
    </form>
  );
}
