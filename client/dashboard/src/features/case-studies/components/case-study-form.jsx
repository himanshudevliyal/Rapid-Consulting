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
import AuthorReviewerCard from "@/components/author-reviewer-card";
import FileUploaderServer from "@/components/file-uploader-server";
import { FieldError, FormCard as Card, FormColumns } from "@/components/form-layout";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    watch,
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

                <div className="space-y-1">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...register("location")} placeholder="e.g. Hisar, Haryana" />
                  <FieldError error={errors.location} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sector">Sector</Label>
                  <Input id="sector" {...register("sector")} placeholder="e.g. Manufacturing" />
                  <FieldError error={errors.sector} />
                </div>

              </div>
            </Card>

            <Card title="Story" description="Shown on the case study page.">
              <div className="space-y-1">
                <Label htmlFor="rapid_role">Rapid's role</Label>
                <Textarea
                  id="rapid_role"
                  rows={3}
                  {...register("rapid_role")}
                  placeholder="What Rapid Consulting did on this engagement"
                />
                <FieldError error={errors.rapid_role} />
              </div>

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
              title="Evidence"
              description="Shown only if filled. Use approved or redacted material only (no confidential client documents)."
            >
              <div className="space-y-1">
                <Label>Proof image</Label>
                <Controller
                  control={control}
                  name="proof_image"
                  render={({ field }) => (
                    <FileUploaderServer value={field.value} onFileChange={(path) => field.onChange(path ?? "")} />
                  )}
                />
                <FieldError error={errors.proof_image} />
                <p className="text-xs text-muted-foreground">
                  For example an approval letter or certificate, redacted where needed.
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="proof_caption">Proof caption</Label>
                <Input id="proof_caption" {...register("proof_caption")} placeholder="What the image shows" />
                <FieldError error={errors.proof_caption} />
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="milestone_label">Milestone</Label>
                  <Input id="milestone_label" {...register("milestone_label")} placeholder="e.g. Subsidy sanctioned" />
                  <FieldError error={errors.milestone_label} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="milestone_date">Milestone date</Label>
                  <Input id="milestone_date" type="date" {...register("milestone_date")} />
                  <FieldError error={errors.milestone_date} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="quote_text">Client quote</Label>
                <Textarea id="quote_text" rows={3} {...register("quote_text")} placeholder="Only an approved quote" />
                <FieldError error={errors.quote_text} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quote_attribution">Quote attribution</Label>
                <Input
                  id="quote_attribution"
                  {...register("quote_attribution")}
                  placeholder="e.g. Owner, ABC Industries"
                />
                <FieldError error={errors.quote_attribution} />
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
                  <span className="block text-xs text-muted-foreground">Unticked case studies stay hidden on the website. The publish date is set the first time it is published.</span>
                </span>
              </label>
            </Card>

            <AuthorReviewerCard control={control} register={register} setValue={setValue} watch={watch} errors={errors} />

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
