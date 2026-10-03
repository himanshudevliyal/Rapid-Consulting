"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/loader";
import ErrorMessage from "@/components/ui/error";
import FieldError from "@/components/ui/field-error";

import { querySchema } from "@/validation-schema/query-schema";
import { useFormServerErrors } from "@/hooks/use-form-server-errors";
import {
  useQuery,
  useCreateQuery,
  useUpdateQuery,
} from "@/hooks/use-queries";

export function QueryForm({ type, queryId }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(querySchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const handleServerErrors = useFormServerErrors(setError);

  const { data, isLoading, isError, error } = useQuery(queryId);

  const createMutation = useCreateQuery({
    onSuccess: () => router.push("/queries?page=1&limit=10"),
    onError: (err) => handleServerErrors(err?.response?.data?.issues),
  });

  const updateMutation = useUpdateQuery(queryId, {
    onSuccess: () => router.push("/queries?page=1&limit=10"),
    onError: (err) => handleServerErrors(err?.response?.data?.issues),
  });

  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name ?? "",
      email: data.email ?? "",
      address: data.address ?? "",
      phone: data.phone ?? "",
      subject: data.subject ?? "",
      message: data.message ?? "",
    });
  }, [data]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  const isFormPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values) => {
    type === "create"
      ? createMutation.mutate(values)
      : updateMutation.mutate(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Full Name *</Label>
          <Input placeholder="e.g. Rahul Sharma" {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>

        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            placeholder="e.g. rahul@example.com"
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <Label>Phone *</Label>
          <Input
            type="tel"
            placeholder="e.g. 9876543210"
            {...register("phone")}
          />
          <FieldError message={errors.phone?.message} />
        </div>

        <div>
          <Label>Subject *</Label>
          <Input
            placeholder="e.g. Bulk order enquiry"
            {...register("subject")}
          />
          <FieldError message={errors.subject?.message} />
        </div>

        <div className="col-span-2">
          <Label>Address *</Label>
          <Input
            placeholder="e.g. 12, MG Road, Bengaluru, Karnataka"
            {...register("address")}
          />
          <FieldError message={errors.address?.message} />
        </div>

        <div className="col-span-2">
          <Label>Message *</Label>
          <Textarea
            placeholder="Describe your query in detail"
            rows={4}
            {...register("message")}
          />
          <FieldError message={errors.message?.message} />
        </div>
      </div>

      <div className="text-end">
        <Button type="submit" disabled={isFormPending}>
          {isFormPending && <Loader2 className="animate-spin" />}
          Submit
        </Button>
      </div>
    </form>
  );
}
