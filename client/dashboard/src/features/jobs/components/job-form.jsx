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
import { FieldError, FormCard as Card, FormColumns } from "@/components/form-layout";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateJob, useJob, useUpdateJob } from "@/hooks/use-jobs";
import { buildPayload, emptyJob, toFormValues } from "@/lib/job-form";
import { slugify } from "@/lib/service-form";
import { cn } from "@/lib/utils";
import { JOB_TYPES, jobFormSchema } from "@/schemas/job";

const LIST_URL = "/jobs?page=1&limit=10";

export default function JobForm({ id, type = "create" }) {
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
    resolver: zodResolver(jobFormSchema),
    defaultValues: emptyJob,
  });

  const done = (message) => () => {
    toast.success(message);
    router.replace(LIST_URL);
  };
  const createMutation = useCreateJob(done("Job created"));
  const updateMutation = useUpdateJob(id, done("Job updated"));
  const { data, isLoading, isError, error } = useJob(id);

  // Load the saved job into the form (edit only).
  useEffect(() => {
    if (isEdit && data) reset(toFormValues(data));
  }, [isEdit, data?.id, data?.updated_at, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  // On a new job, suggest the slug while the title is typed, until the slug
  // is edited by hand.
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
            <Card title="Basics" description="The role and the public address of its page (/careers/<slug>).">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    className={cn({ "border-red-500": errors.title })}
                    {...titleField}
                    onChange={suggestSlug}
                    placeholder="Accountant"
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
                      ? "Changing it changes the public link of this job."
                      : "Filled in from the title; leave it as it is or edit it."}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...register("location")} placeholder="Hisar" />
                  <FieldError error={errors.location} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="experience">Experience</Label>
                  <Input id="experience" {...register("experience")} placeholder="e.g. 2-3 years" />
                  <FieldError error={errors.experience} />
                </div>
              </div>
            </Card>

            <Card title="Job details" description="Shown on the job page. Each box becomes its own section.">
              <div className="space-y-1">
                <Label>About the role</Label>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => <TextEditor value={field.value ?? ""} onChange={field.onChange} />}
                />
              </div>
              <div className="space-y-1">
                <Label>Responsibilities (the work)</Label>
                <Controller
                  control={control}
                  name="responsibilities"
                  render={({ field }) => <TextEditor value={field.value ?? ""} onChange={field.onChange} />}
                />
              </div>
              <div className="space-y-1">
                <Label>Requirements (relevant skills)</Label>
                <Controller
                  control={control}
                  name="requirements"
                  render={({ field }) => <TextEditor value={field.value ?? ""} onChange={field.onChange} />}
                />
              </div>
            </Card>
          </>
        }
        side={
          <>
            <Card title="Status">
              <label htmlFor="is_active" className="flex items-start gap-2 text-sm">
                <input id="is_active" type="checkbox" className="mt-0.5 h-4 w-4" {...register("is_active")} />
                <span>
                  Active
                  <span className="block text-xs text-muted-foreground">
                    Unticked jobs are hidden from the website (closed).
                  </span>
                </span>
              </label>
              <div className="space-y-1">
                <Label htmlFor="closing_date">Closing date</Label>
                <Input id="closing_date" type="date" {...register("closing_date")} />
                <FieldError error={errors.closing_date} />
                <p className="text-xs text-muted-foreground">
                  Optional. The job leaves the website after this date.
                </p>
              </div>
            </Card>

            <Card title="Job type">
              <select
                id="job_type"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                {...register("job_type")}
              >
                {JOB_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Card>
          </>
        }
      />

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Button type="button" variant="outline" asChild>
          <Link href={LIST_URL}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 animate-spin" />} {isEdit ? "Save changes" : "Create job"}
        </Button>
      </div>
    </form>
  );
}
