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
import { useScheme, useCreateScheme, useUpdateScheme } from "@/hooks/use-schemes";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import TextEditor from "@/components/editor";

const schemeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  ministry: z.string().optional(),
  eligibility: z.string().optional(),
  benefits: z.string().optional(),
  application_process: z.string().optional(),
  official_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  tags: z.string().optional(),
  is_published: z.boolean().default(false),
});

export default function SchemeForm({ id, type = "create" }) {
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm({
    resolver: zodResolver(schemeSchema),
    defaultValues: { is_published: false },
  });
  const router = useRouter();
  const handleSuccess = () => { reset(); router.replace("/schemes?page=1&limit=10"); };
  const createMutation = useCreateScheme(handleSuccess);
  const updateMutation = useUpdateScheme(id, handleSuccess);
  const { data, isLoading, isError, error } = useScheme(id);

  const onSubmit = (formData) => {
    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    type === "create" ? createMutation.mutate(payload) : updateMutation.mutate(payload);
  };

  useEffect(() => {
    if (!data) return;
    reset({
      title: data.title ?? "",
      ministry: data.ministry ?? "",
      eligibility: data.eligibility ?? "",
      benefits: data.benefits ?? "",
      application_process: data.application_process ?? "",
      official_url: data.official_url ?? "",
      tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags ?? "",
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
          <Input id="title" className={cn({ "border-red-500": errors.title })} {...register("title")} placeholder="Scheme title" />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="ministry">Ministry</Label>
          <Input id="ministry" {...register("ministry")} placeholder="Responsible ministry" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="official_url">Official URL</Label>
          <Input id="official_url" type="url" {...register("official_url")} placeholder="https://..." />
          {errors.official_url && <p className="mt-1 text-sm text-red-500">{errors.official_url.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" {...register("tags")} placeholder="tag1, tag2" />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input id="is_published" type="checkbox" className="h-4 w-4" {...register("is_published")} />
          <Label htmlFor="is_published">Published</Label>
        </div>
      </div>

      {[["eligibility", "Eligibility"], ["benefits", "Benefits"], ["application_process", "Application Process"]].map(([field, label]) => (
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
