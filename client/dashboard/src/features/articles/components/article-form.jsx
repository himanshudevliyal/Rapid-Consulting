"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import Loader from "@/components/loader";
import TextEditor from "@/components/editor";
import CategoryField from "@/components/category-field";
import FileUploaderServer from "@/components/file-uploader-server";
import { FieldError, FormCard as Card, FormColumns } from "@/components/form-layout";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useArticle, useCreateArticle, useUpdateArticle } from "@/hooks/use-articles";
import { buildPayload, emptyArticle, toFormValues } from "@/lib/article-form";
import { slugify } from "@/lib/service-form";
import { cn } from "@/lib/utils";
import { articleFormSchema } from "@/schemas/article";

const LIST_URL = "/articles?page=1&limit=10";

export default function ArticleForm({ id, type = "create" }) {
  const isEdit = type === "edit";
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(articleFormSchema),
    defaultValues: emptyArticle,
  });

  const done = (message) => () => {
    toast.success(message);
    router.replace(LIST_URL);
  };
  const createMutation = useCreateArticle(done("Article created"));
  const updateMutation = useUpdateArticle(id, done("Article updated"));
  const { data, isLoading, isError, error } = useArticle(id);

  // Load the saved article into the form (edit only).
  useEffect(() => {
    if (isEdit && data) reset(toFormValues(data));
  }, [isEdit, data?.id, data?.updated_at, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  // On a new article, suggest the slug while the title is typed, until the
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

  const metaTitleLength = (watch("meta_title") ?? "").length;
  const metaDescriptionLength = (watch("meta_description") ?? "").length;

  if (isEdit && isLoading) return <Loader />;
  if (isEdit && isError) return <ErrorMessage error={error} />;

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(submit, invalid)} className="space-y-6">
      <FormColumns
        main={
          <>
            <Card title="Basics" description="The title and the public address of the article.">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    className={cn({ "border-red-500": errors.title })}
                    {...titleField}
                    onChange={suggestSlug}
                    placeholder="Article title"
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
                      ? "Changing it changes the public link of this article."
                      : "Filled in from the title; leave it as it is or edit it."}
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Content" description="A short summary for lists, and the article itself.">
              <div className="space-y-1">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea id="excerpt" rows={3} {...register("excerpt")} placeholder="One or two sentences shown on article cards" />
                <FieldError error={errors.excerpt} />
              </div>

              <div className="space-y-1">
                <Label>Article</Label>
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => <TextEditor value={field.value ?? ""} onChange={field.onChange} />}
                />
              </div>
            </Card>

            <Card title="Search engines" description="Optional. If left empty, the website uses the title and excerpt.">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="meta_title">Meta title</Label>
                  <Input id="meta_title" {...register("meta_title")} placeholder="Shown as the title in search results" />
                  <p className="text-xs text-muted-foreground">{metaTitleLength} characters (about 60 works best)</p>
                  <FieldError error={errors.meta_title} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="meta_description">Meta description</Label>
                  <Textarea id="meta_description" rows={3} {...register("meta_description")} placeholder="Shown under the title in search results" />
                  <p className="text-xs text-muted-foreground">{metaDescriptionLength} characters (about 155 works best)</p>
                  <FieldError error={errors.meta_description} />
                </div>
              </div>
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
                  <span className="block text-xs text-muted-foreground">
                    Unticked articles stay hidden on the website. The publish date is set the first time it is published.
                  </span>
                </span>
              </label>
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
              <Input id="tags" {...register("tags")} placeholder="Licences & Certifications, MSME" />
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
          {loading && <Loader2 className="mr-2 animate-spin" />} {isEdit ? "Save changes" : "Create article"}
        </Button>
      </div>
    </form>
  );
}
