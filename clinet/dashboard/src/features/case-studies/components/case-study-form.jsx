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
import { useCaseStudy, useCreateCaseStudy, useUpdateCaseStudy } from "@/hooks/use-case-studies";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import TextEditor from "@/components/editor";

const caseStudySchema = z.object({
  title: z.string().min(1, "Title is required"),
  client_name: z.string().optional(),
  industry: z.string().optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  result: z.string().optional(),
  is_published: z.boolean().default(false),
});

export default function CaseStudyForm({ id, type = "create" }) {
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm({
    resolver: zodResolver(caseStudySchema),
    defaultValues: { is_published: false },
  });
  const router = useRouter();
  const handleSuccess = () => { reset(); router.replace("/case-studies?page=1&limit=10"); };
  const createMutation = useCreateCaseStudy(handleSuccess);
  const updateMutation = useUpdateCaseStudy(id, handleSuccess);
  const { data, isLoading, isError, error } = useCaseStudy(id);

  const onSubmit = (formData) => {
    type === "create" ? createMutation.mutate(formData) : updateMutation.mutate(formData);
  };

  useEffect(() => {
    if (!data) return;
    reset({
      title: data.title ?? "",
      client_name: data.client_name ?? "",
      industry: data.industry ?? "",
      challenge: data.challenge ?? "",
      solution: data.solution ?? "",
      result: data.result ?? "",
      is_published: data.is_published ?? false,
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
          <Input id="title" className={cn({ "border-red-500": errors.title })} {...register("title")} placeholder="Enter title" />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="client_name">Client Name</Label>
          <Input id="client_name" {...register("client_name")} placeholder="Enter client name" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" {...register("industry")} placeholder="Enter industry" />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input id="is_published" type="checkbox" className="h-4 w-4" {...register("is_published")} />
          <Label htmlFor="is_published">Published</Label>
        </div>
      </div>

      {[["challenge", "Challenge"], ["solution", "Solution"], ["result", "Result"]].map(([field, label]) => (
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
