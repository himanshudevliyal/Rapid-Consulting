"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import moment from "moment";
import Loader from "@/components/loader";
import { FieldError, FormCard as Card, FormColumns } from "@/components/form-layout";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ENQUIRY_STATUSES, enquiryUpdateSchema } from "@/schemas/enquiry";
import { ENQUIRY_KINDS, sourceLabel } from "./enquiry-kinds";

const isWebLink = (value) => /^https?:\/\//i.test(value ?? "");

// One row of the "submitted details" list; empty values are left out.
function Detail({ label, children }) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="grid gap-1 border-b py-3 last:border-b-0 sm:grid-cols-[170px_minmax(0,1fr)]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="m-0 break-words text-sm whitespace-pre-wrap">{children}</dd>
    </div>
  );
}

// An enquiry as the website visitor submitted it (read-only) with the admin's
// status and internal notes. Used for service enquiries and contact enquiries.
export default function EnquiryForm({ id, kind = "enquiry" }) {
  const config = ENQUIRY_KINDS[kind];
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(enquiryUpdateSchema),
    defaultValues: { status: "new", notes: "" },
  });

  const updateMutation = config.useUpdate(id, () => {
    toast.success(`${config.singular} updated`);
    router.replace(config.listUrl);
  });
  const { data, isLoading, isError, error } = config.useItem(id);

  useEffect(() => {
    if (data) reset({ status: data.status ?? "new", notes: data.notes ?? "" });
  }, [data?.id, data?.updated_at, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  const submit = (values) => updateMutation.mutate({ status: values.status, notes: values.notes.trim() });
  const isContact = kind === "contact";

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <FormColumns
        main={
          <>
            <Card title="Submitted details" description="Exactly what the visitor sent.">
              <dl className="m-0">
                <Detail label="Name">{data.name}</Detail>
                <Detail label="Phone">
                  <a href={`tel:${data.phone}`} className="text-primary underline-offset-2 hover:underline">
                    {data.phone}
                  </a>
                </Detail>
                <Detail label="Email">
                  {data.email && (
                    <a href={`mailto:${data.email}`} className="text-primary underline-offset-2 hover:underline">
                      {data.email}
                    </a>
                  )}
                </Detail>
                <Detail label="Location">{data.location}</Detail>
                <Detail label="Subject">{data.subject}</Detail>
                <Detail label={isContact ? "Message" : "Requirement"}>
                  {isContact ? data.message : data.requirement}
                </Detail>
              </dl>
            </Card>

            <Card title="Where it came from" description="The page the form was submitted on.">
              <dl className="m-0">
                <Detail label="Service / product">{data.service_name}</Detail>
                <Detail label="Page title">{data.page_title}</Detail>
                <Detail label="Page URL">
                  {isWebLink(data.page_url) ? (
                    <a
                      href={data.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {data.page_url}
                    </a>
                  ) : (
                    data.page_url
                  )}
                </Detail>
                <Detail label="Page / service code">{data.page_id}</Detail>
                <Detail label="Form">{sourceLabel(kind, data.source)}</Detail>
                <Detail label="Received">{moment(data.created_at).format("DD MMM YYYY, HH:mm")}</Detail>
              </dl>
            </Card>
          </>
        }
        side={
          <Card title="Follow-up" description="Only visible here, never to the visitor.">
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                {...register("status")}
              >
                {ENQUIRY_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <FieldError error={errors.status} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Internal notes</Label>
              <Textarea id="notes" rows={6} {...register("notes")} placeholder="Call details, next steps…" />
              <FieldError error={errors.notes} />
            </div>
          </Card>
        }
      />

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Button type="button" variant="outline" asChild>
          <Link href={config.listUrl}>Back to list</Link>
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="mr-2 animate-spin" />} Save changes
        </Button>
      </div>
    </form>
  );
}
