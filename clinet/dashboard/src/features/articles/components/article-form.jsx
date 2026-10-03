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
import { useArticle, useCreateArticle, useUpdateArticle } from "@/hooks/use-articles";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import TextEditor from "@/components/editor";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  tags: z.string().optional(),
  is_published: z.boolean().default(false),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

export default function ArticleForm({ id, type = "create" }) {
  const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm({
    resolver: zodResolver(articleSchema),
    defaultValues: { is_published: false },
  });

  const router = useRouter();
  const handleSuccess = () => { reset(); router.replace("/articles?page=1&limit=10"); };

  const createMutation = useCreateArticle(handleSuccess);
  const updateMutation = useUpdateArticle(id, handleSuccess);
  const { data, isLoading, isError, error } = useArticle(id);

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
      content: data.content ?? "",
      excerpt: data.excerpt ?? "",
      tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags ?? "",
      is_published: data.is_published ?? false,
      meta_title: data.meta_title ?? "",
      meta_description: data.meta_description ?? "",
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
          <Input id="title" type="text" className={cn({ "border-red-500": errors.title })} {...register("title")} placeholder="Enter title" />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" type="text" {...register("tags")} placeholder="tag1, tag2, tag3" />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input id="is_published" type="checkbox" className="h-4 w-4" {...register("is_published")} />
          <Label htmlFor="is_published">Published</Label>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" rows={3} {...register("excerpt")} placeholder="Short summary" />
      </div>

      <div className="space-y-1">
        <Label>Content</Label>
        <Controller
          control={control}
          name="content"
          render={({ field }) => <TextEditor value={field.value} onChange={field.onChange} />}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        <div className="space-y-1">
          <Label htmlFor="meta_title">Meta Title</Label>
          <Input id="meta_title" type="text" {...register("meta_title")} placeholder="Enter meta title" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="meta_description">Meta Description</Label>
          <Textarea id="meta_description" rows={2} {...register("meta_description")} placeholder="Enter meta description" />
        </div>
      </div>

      <div className="text-end">
        <Button type="submit" disabled={isFormPending}>
          {isFormPending && <Loader2 className="animate-spin" />} Submit
        </Button>
      </div>
    </form>
  );
}
