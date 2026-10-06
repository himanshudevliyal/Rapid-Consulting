"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { serviceIcons } from "@/data/service-constants";
import { cn } from "@/lib/utils";

const selectClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160),
  description: z.string().trim().max(1000).optional(),
  icon: z.string().optional(),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

const empty = { name: "", description: "", icon: "", sort_order: 0, is_active: true };

export default function OptionForm({ config, initialData, onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (!initialData) return;
    reset({
      name: initialData.name ?? "",
      description: initialData.description ?? "",
      icon: initialData.icon ?? "",
      sort_order: initialData.sort_order ?? 0,
      is_active: initialData.is_active ?? true,
    });
  }, [initialData, reset]);

  const submit = (values) => {
    const payload = {
      name: values.name,
      description: values.description || null,
      sort_order: values.sort_order,
      is_active: values.is_active,
    };
    if (config.hasIcon) payload.icon = values.icon || null;
    // No code is sent: the server makes one from the name when it is created.
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        <div className="space-y-1">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" className={cn({ "border-red-500": errors.name })} {...register("name")} placeholder={`${config.singular} name`} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          {config.hint && <p className="text-xs text-muted-foreground">{config.hint}</p>}
        </div>

        {config.hasIcon && (
          <div className="space-y-1">
            <Label htmlFor="icon">Icon</Label>
            <select id="icon" className={selectClass} {...register("icon")}>
              <option value="">No icon</option>
              {serviceIcons.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="sort_order">Sort order</Label>
          <Input id="sort_order" type="number" {...register("sort_order")} />
          <p className="text-xs text-muted-foreground">Smaller numbers come first.</p>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input id="is_active" type="checkbox" className="h-4 w-4" {...register("is_active")} />
          <Label htmlFor="is_active">Active (can be chosen for new services)</Label>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} placeholder="Shown to editors only" />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div className="text-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 animate-spin" />} Save {config.singular}
        </Button>
      </div>
    </form>
  );
}
