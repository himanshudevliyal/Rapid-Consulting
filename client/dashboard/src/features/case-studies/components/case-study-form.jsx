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
import FileUploaderServer from "@/components/file-uploader-server";
import { FieldError, FormCard as Card, FormColumns } from "@/components/form-layout";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCaseStudy, useCreateCaseStudy, useUpdateCaseStudy } from "@/hooks/use-case-studies";
import { buildPayload, emptyCaseStudy, RICH_FIELDS, toFormValues } from "@/lib/case-study-form";
import { slugify } from "@/lib/service-form";
import { cn } from "@/lib/utils";
import { caseStudyFormSchema } from "@/schemas/case-study";

const LIST_URL = "/case-studies?page=1&limit=10";

export default function CaseStudyForm({ id, type = "create" }) {
  const isEdit = type === "edit";
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(caseStudyFormSchema),
    defaultValues: emptyCaseStudy,
  });

  const done = (message) => () => {
    toast.success(message);
    router.replace(LIST_URL);
  };
  const createMutation = useCreateCaseStudy(done("Case study created"));
  const updateMutation = useUpdateCaseStudy(id, done("Case study updated"));
  const { data, isLoading, isError, error } = useCaseStudy(id);

  // Load the saved case study into the form (edit only).
  useEffect(() => {
    if (isEdit && data) reset(toFormValues(data));
  }, [isEdit, data?.id, data?.updated_at, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  // On a new case study, suggest the slug while the title is typed, until the
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
            <Card title="Basics" description="The title, client and industry of the case study.">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    className={cn({ "border-red-500": errors.title })}
                    {...titleField}
                    onChange={suggestSlug}
                    placeholder="Case study title"
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
                      ? "Changing it changes the public link of this case study."
                      : "Filled in from the title; leave it as it is or edit it."}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="client_name">Client</Label>
                  <Input id="client_name" {...register("client_name")} placeholder="Client or company name" />
                  <FieldError error={errors.client_name} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" {...register("industry")} placeholder="e.g. Textiles" />
                  <FieldError error={errors.industry} />
                </div>

              </div>
            </Card>

            <Card title="Story" description="Shown on the case study page.">
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
                  <span className="block text-xs text-muted-foreground">Unticked case studies stay hidden on the website. The publish date is set the first time it is published.</span>
                </span>
              </label>
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
              <Input id="tags" {...register("tags")} placeholder="subsidy, MSME" />
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
          {loading && <Loader2 className="mr-2 animate-spin" />} {isEdit ? "Save changes" : "Create case study"}
        </Button>
      </div>
    </form>
  );
}
