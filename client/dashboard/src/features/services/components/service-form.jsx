"use client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { serviceSchema } from "@/schemas/service";

export default function ServiceForm({ initialData, onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      code: "",
      slug: "",
      type: "service",
      family_code: "",
      icon: "",
      sort_order: 0,
      is_active: true,
      title: "",
      short_description: "",
      status: "draft",
    },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      code: initialData.code ?? "",
      slug: initialData.slug ?? "",
      type: initialData.type ?? "service",
      family_code: initialData.family_code ?? "",
      icon: initialData.icon ?? "",
      sort_order: initialData.sort_order ?? 0,
      is_active: initialData.is_active ?? true,
      title: initialData.title ?? "",
      short_description: initialData.short_description ?? "",
      status: initialData.status ?? "draft",
    });
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">

        {/* Title */}
        <div className="space-y-1">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            className={cn({ "border-red-500": errors.title })}
            {...register("title")}
            placeholder="Service title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
        </div>

        {/* Code */}
        <div className="space-y-1">
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            className={cn({ "border-red-500": errors.code })}
            {...register("code")}
            placeholder="e.g. S01"
          />
          {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>}
        </div>

        {/* Slug */}
        <div className="space-y-1">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} placeholder="e.g. my-service" />
        </div>

        {/* Type */}
        <div className="space-y-1">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            {...register("type")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="service">Service</option>
            <option value="service-family">Service Family</option>
            <option value="additional-service">Additional Service</option>
            <option value="service-index">Service Index</option>
          </select>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            {...register("status")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Family Code */}
        <div className="space-y-1">
          <Label htmlFor="family_code">Family Code</Label>
          <Input id="family_code" {...register("family_code")} placeholder="e.g. S02" />
        </div>

        {/* Icon */}
        <div className="space-y-1">
          <Label htmlFor="icon">Icon</Label>
          <Input id="icon" {...register("icon")} placeholder="Icon name or URL" />
        </div>

        {/* Sort Order */}
        <div className="space-y-1">
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input id="sort_order" type="number" {...register("sort_order")} placeholder="0" />
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-2 pt-6">
          <input id="is_active" type="checkbox" className="h-4 w-4" {...register("is_active")} />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      {/* Short Description */}
      <div className="space-y-1">
        <Label htmlFor="short_description">Short Description</Label>
        <Textarea
          id="short_description"
          {...register("short_description")}
          placeholder="Brief description of the service"
          rows={3}
        />
      </div>

      <div className="text-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="animate-spin mr-2" />} Save Service
        </Button>
      </div>
    </form>
  );
}