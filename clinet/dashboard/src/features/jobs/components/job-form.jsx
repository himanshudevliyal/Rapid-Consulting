"use client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/loader";
import { useJob, useCreateJob, useUpdateJob } from "@/hooks/use-jobs";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import TextEditor from "@/components/editor";

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  job_type: z.enum(["full-time", "part-time", "contract", "internship", "remote"]).default("full-time"),
  location: z.string().optional(),
  experience: z.string().optional(),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  closing_date: z.string().optional(),
  is_active: z.boolean().default(true),
});

export default function JobForm({ id, type = "create" }) {
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: { is_active: true, job_type: "full-time" },
  });
  const router = useRouter();
  const handleSuccess = () => { reset(); router.replace("/jobs?page=1&limit=10"); };
  const createMutation = useCreateJob(handleSuccess);
  const updateMutation = useUpdateJob(id, handleSuccess);
  const { data, isLoading, isError, error } = useJob(id);

  const onSubmit = (formData) => {
    type === "create" ? createMutation.mutate(formData) : updateMutation.mutate(formData);
  };

  useEffect(() => {
    if (!data) return;
    reset({
      title: data.title ?? "",
      job_type: data.job_type ?? "full-time",
      location: data.location ?? "",
      experience: data.experience ?? "",
      responsibilities: data.responsibilities ?? "",
      requirements: data.requirements ?? "",
      closing_date: data.closing_date ? data.closing_date.split("T")[0] : "",
      is_active: data.is_active ?? true,
    });
  }, [data, reset]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;
  const isFormPending = (type === "create" && createMutation.isPending) || (type === "edit" && updateMutation.isPending);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" className={cn({ "border-red-500": errors.title })} {...register("title")} placeholder="Job title" />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="job_type">Job Type</Label>
          <select id="job_type" className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm" {...register("job_type")}>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register("location")} placeholder="Enter location" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="experience">Experience</Label>
          <Input id="experience" {...register("experience")} placeholder="e.g. 2-3 years" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="closing_date">Closing Date</Label>
          <Input id="closing_date" type="date" {...register("closing_date")} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input id="is_active" type="checkbox" className="h-4 w-4" {...register("is_active")} />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      {[["responsibilities", "Responsibilities"], ["requirements", "Requirements"]].map(([field, label]) => (
        <div key={field} className="space-y-1">
          <Label>{label}</Label>
          <Controller control={control} name={field}
            render={({ field: f }) => <TextEditor value={f.value} onChange={f.onChange} />}
          />
        </div>
      ))}

      <div className="text-end">
        <Button type="submit" disabled={isFormPending}>
          {isFormPending && <Loader2 className="animate-spin" />} Submit
        </Button>
      </div>
    </form>
  );
}
