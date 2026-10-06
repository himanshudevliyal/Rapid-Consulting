"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import Loader from "@/components/loader";
import TextEditor from "@/components/editor";
import CategoryField from "@/components/category-field";
import CommandMenu from "@/components/command-menu";
import FileUploaderServer from "@/components/file-uploader-server";
import { FieldError, FormCard as Card, FormColumns } from "@/components/form-layout";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAllServiceFamilyTopics } from "@/hooks/use-service-options";
import { useCreateScheme, useScheme, useUpdateScheme } from "@/hooks/use-schemes";
import { slugify } from "@/lib/service-form";
import { buildPayload, emptyScheme, RICH_FIELDS, toFormValues } from "@/lib/scheme-form";
import { cn } from "@/lib/utils";
import { schemeFormSchema } from "@/schemas/scheme";

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
            </Card>

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
