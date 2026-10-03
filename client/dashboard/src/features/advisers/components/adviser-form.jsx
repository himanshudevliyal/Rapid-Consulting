"use client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/loader";
import { useAdviser, useCreateAdviser, useUpdateAdviser } from "@/hooks/use-advisers";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const adviserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().optional(),
  bio: z.string().optional(),
  linkedin_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  display_order: z.coerce.number().int().min(0).optional(),
  is_active: z.boolean().default(true),
});

export default function AdviserForm({ id, type = "create" }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(adviserSchema),
    defaultValues: { is_active: true, display_order: 0 },
  });
  const router = useRouter();
  const handleSuccess = () => { reset(); router.replace("/advisers?page=1&limit=10"); };
  const createMutation = useCreateAdviser(handleSuccess);
  const updateMutation = useUpdateAdviser(id, handleSuccess);
  const { data, isLoading, isError, error } = useAdviser(id);

  const onSubmit = (formData) => {
    type === "create" ? createMutation.mutate(formData) : updateMutation.mutate(formData);
  };

  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name ?? "",
      designation: data.designation ?? "",
      bio: data.bio ?? "",
      linkedin_url: data.linkedin_url ?? "",
      display_order: data.display_order ?? 0,
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
          <Label htmlFor="name">Name</Label>
          <Input id="name" className={cn({ "border-red-500": errors.name })} {...register("name")} placeholder="Enter name" />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="designation">Designation</Label>
          <Input id="designation" {...register("designation")} placeholder="Enter designation" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input id="linkedin_url" type="url" {...register("linkedin_url")} placeholder="https://linkedin.com/in/..." />
          {errors.linkedin_url && <p className="mt-1 text-sm text-red-500">{errors.linkedin_url.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="display_order">Display Order</Label>
          <Input id="display_order" type="number" {...register("display_order")} placeholder="0" />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input id="is_active" type="checkbox" className="h-4 w-4" {...register("is_active")} />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={4} {...register("bio")} placeholder="Enter bio" />
      </div>
      <div className="text-end">
        <Button type="submit" disabled={isFormPending}>
          {isFormPending && <Loader2 className="animate-spin" />} Submit
        </Button>
      </div>
    </form>
  );
}
