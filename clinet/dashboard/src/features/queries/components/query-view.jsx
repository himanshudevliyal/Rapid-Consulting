"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Trash2, Paperclip } from "lucide-react";
import config from "@/config";
import { useQueryItem } from "@/hooks/use-queries";

const reasonLabels = {
  domestic_sales_enquiry: "Domestic Sales Enquiry",
  export_sales_enquiry: "Export Sales Enquiry",
  after_sales_services: "After Sales Services",
  career: "Career",
  become_a_vendor: "Become a Vendor",
};

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function QueryView({ id, onDelete, isDeleting }) {
  const { data, isLoading, isError } = useQueryItem(id);

  if (isLoading)
    return <div className="p-6 text-muted-foreground text-sm">Loading...</div>;
  if (isError)
    return (
      <div className="p-6 text-destructive text-sm">Failed to load query.</div>
    );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-sm shrink-0">
          {getInitials(data.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-base">{data.name}</p>
          <p className="text-xs text-muted-foreground">{data.subject}</p>
        </div>

        {data.reason && (
          <Badge variant="outline" className="capitalize">
            {reasonLabels[data.reason] || data.reason}
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
            Contact details
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Email</p>
              <p className="text-sm break-all">{data.email}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Phone</p>
              <p className="text-sm">{data.phone}</p>
            </div>
          </div>
        </div>

        {data.message && (
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
              Message
            </p>
            <div className="border-l-2 border-border pl-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.message}
              </p>
            </div>
          </div>
        )}

        {data.attachment && (
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
              Attachment
            </p>
            <a
              href={`${config.file_base}/${data.attachment}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Paperclip className="size-4" />
              View attachment
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {format(new Date(data.created_at), "MMM d, yyyy · h:mm a")}
          </span>
          <Button
            variant="destructive"
            size="icon"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
          </Button>
        </div>
      </div>
    </div>
  );
}