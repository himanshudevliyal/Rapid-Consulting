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
import { useEnquiry, useCreateEnquiry, useUpdateEnquiry } from "@/hooks/use-enquiries";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  location: z.string().optional(),
  requirement: z.string().optional(),
  subject: z.string().optional(),
  status: z.enum(["new", "contacted", "closed"]).default("new"),
  notes: z.string().optional(),
});

export default function EnquiryForm({ id, type = "create" }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(enquirySchema) });

  const router = useRouter();
  const handleSuccess = () => {
    reset();
    router.replace("/enquiries?page=1&limit=10");
  };

  const createMutation = useCreateEnquiry(handleSuccess);
  const updateMutation = useUpdateEnquiry(id, handleSuccess);
  const { data, isLoading, isError, error } = useEnquiry(id);

  const onSubmit = (formData) => {
    type === "create"
      ? createMutation.mutate(formData)
      : updateMutation.mutate(formData);
  };

  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      location: data.location ?? "",
      requirement: data.requirement ?? "",
      subject: data.subject ?? "",
      status: data.status ?? "new",
      notes: data.notes ?? "",
    });
  }, [data, reset]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            className={cn({ "border-red-500": errors.name })}
            {...register("name")}
            placeholder="Enter name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} placeholder="Enter email" />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="text" {...register("phone")} placeholder="Enter phone" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="location">Location</Label>
          <Input id="location" type="text" {...register("location")} placeholder="Enter location" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" type="text" {...register("subject")} placeholder="Enter subject" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
            {...register("status")}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="requirement">Requirement</Label>
        <Textarea id="requirement" rows={3} {...register("requirement")} placeholder="Enter requirement details" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} {...register("notes")} placeholder="Internal notes" />
      </div>

      <div className="text-end">
        <Button type="submit" disabled={isFormPending}>
          {isFormPending && <Loader2 className="animate-spin" />} Submit
        </Button>
      </div>
    </form>
  );
}
