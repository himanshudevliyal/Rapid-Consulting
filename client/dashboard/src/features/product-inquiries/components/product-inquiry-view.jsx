"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProductInquiry,
  useUpdateProductInquiryStatus,
} from "@/hooks/use-product-inquiries";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import config from "@/config";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const statusOptions = ["pending", "contacted", "closed"];

export default function ProductInquiryView({ id, onDelete, isDeleting }) {
  const { data, isLoading, isError } = useProductInquiry(id);
  const updateStatusMutation = useUpdateProductInquiryStatus(id);

  if (isLoading)
    return <div className="p-6 text-muted-foreground text-sm">Loading...</div>;
  if (isError)
    return (
      <div className="p-6 text-destructive text-sm">
        Failed to load inquiry.
      </div>
    );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-sm shrink-0">
          {getInitials(data.full_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-base">{data.full_name}</p>
          {data.company_name && (
            <p className="text-xs text-muted-foreground">
              {data.company_name}
            </p>
          )}
        </div>

        <Select
          value={data.status}
          onValueChange={(status) => updateStatusMutation.mutate(status)}
        >
          <SelectTrigger className="w-32 capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        {/* Contact details */}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
            Contact details
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Detail label="Email" value={data.email} />
            <Detail label="Contact number" value={data.contact_number} />
            <Detail label="City" value={data.city} />
            <Detail label="State" value={data.state} />
          </div>
        </div>

        {/* Products */}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
            Products ({data.products?.length ?? 0})
          </p>
          <div className="space-y-2">
            {data.products?.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border p-2"
              >
                {item.thumbnail ? (
                  <Image
                    src={`${config.file_base}/${item.thumbnail}`}
                    alt={item.title || ""}
                    width={40}
                    height={40}
                    className="size-10 rounded-md object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="bg-accent size-10 rounded-md" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {item.title || item.product_id}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
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

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {format(new Date(data.created_at), "MMM d, yyyy · h:mm a")}
          </span>
          <div className="flex gap-2">
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
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm break-all">{value}</p>
    </div>
  );
}
