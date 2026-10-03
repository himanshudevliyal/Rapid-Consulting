"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Loader2, Mail, Phone } from "lucide-react";
import { rupee } from "@/lib/Intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { useOrderInvoice, useOrderShippingLabel } from "@/hooks/use-orders";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { downloadPdf } from "@/utils/download-pdf";

const order = {
  id: "b8d2c32f-4f0c-4c9d-8681-5f062216c99a",
  user_id: "f82ce1de-afc8-48af-bc5a-ba8142fe3254",
  order_number: "ORD-0002",
  invoice_number: "INV-0002",
  subtotal: "39992.00",
  tax: "0.00",
  shipping_fee: "0.00",
  total: "39992.00",
  shipping_address: {
    city: "Quaerat incididunt a",
    house: "Blanditiis natus dol",
    phone: "7505672018",
    state: "haryana",
    street: "Vitae deserunt aliqu",
    fullname: "himanshu Kumar",
    postal_code: "121003",
  },
  billing_address: {
    city: "Quaerat incididunt a",
    house: "Blanditiis natus dol",
    phone: "7505672018",
    state: "haryana",
    street: "Vitae deserunt aliqu",
    fullname: "himanshu Kumar",
    postal_code: "121003",
  },
  order_status: "Order Accepted",
  payment_method: "card",
  is_inter_state: false,
  created_at: "2025-10-27T04:37:06.286Z",
  updated_at: "2026-01-14T09:56:21.714Z",
  is_paid: true,
  fullname: "Vishal Gautam",
  email: "kdevliyalhimanshu@gmail.com",
  mobile_number: "+917011691802",
};

export default function OrderDetails({ order }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const downloadInvoiceMutation = useOrderInvoice(order.id);
  const downloadOrderShippingeMutation = useOrderShippingLabel(order.id);

  const handleDownloadInvoice = async () => {
    try {
      const { blob, filename } = await downloadInvoiceMutation.mutateAsync();
      downloadPdf(blob, filename);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadShipping = async () => {
    try {
      const { blob, filename } =
        await downloadOrderShippingeMutation.mutateAsync();
      downloadPdf(blob, filename);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="bg-background">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-foreground text-2xl font-bold">
              {order.order_number}
            </h1>
            <p className="text-muted-foreground text-sm">
              {order.invoice_number}
            </p>
          </div>
          <div className="flex items-end gap-2">
            <div className="space-x-2">
              {["invoice", "shipping"].map((doc, ind) => {
                const isPending =
                  (doc === "invoice" && downloadInvoiceMutation.isPending) ||
                  (doc === "shipping" &&
                    downloadOrderShippingeMutation.isPending);

                return (
                  <Button
                    key={ind}
                    disabled={isPending}
                    onClick={() => {
                      doc === "invoice"
                        ? handleDownloadInvoice()
                        : handleDownloadShipping();
                    }}
                    variant="outline"
                    className={cn("capitalize")}
                    target="_blank"
                  >
                    {doc}{" "}
                    {isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Download />
                    )}
                  </Button>
                );
              })}
            </div>

            <div className="flex flex-col items-end gap-2">
              {order.is_paid && (
                <Badge
                  variant={order.is_paid ? "default" : "secondary"}
                  className="font-medium"
                >
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Paid
                  </span>
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {order.order_status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Order Summary Card */}
        <Card className="border-border border p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 sm:gap-4">
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Payment Method
              </p>
              <p className="text-foreground mt-1 capitalize">
                {order.payment_method}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Order Date
              </p>
              <p className="text-foreground mt-1">
                {formatDate(order.created_at)}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Subtotal
              </p>
              <p className="text-foreground font-mono text-lg font-bold">
                {rupee.format(order.subtotal)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Tax
              </p>
              <p className="text-foreground font-mono text-lg font-bold">
                {rupee.format(order.tax)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Shipping
              </p>
              <p className="text-foreground font-mono text-lg font-bold">
                {rupee.format(order.shipping_fee)}
              </p>
            </div>
            <div className="pt-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Total
              </p>
              <p className="text-primary font-mono text-xl font-bold">
                {rupee.format(order.total)}
              </p>
            </div>
          </div>
        </Card>

        {/* Customer & Shipping Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Customer Info */}
          <Card className="border-border space-y-3 border p-4 sm:p-5">
            <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Customer
            </h2>
            <div className="space-y-2">
              <p className="text-foreground text-sm font-medium">
                {order.fullname}
              </p>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <a
                  href={`mailto:${order.email}`}
                  className="hover:text-foreground transition-colors"
                >
                  {order.email}
                </a>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <a
                  href={`tel:${order.mobile_number}`}
                  className="hover:text-foreground transition-colors"
                >
                  {order.mobile_number}
                </a>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="border-border space-y-3 border p-4 sm:p-5">
            <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Shipping Address
            </h2>
            <div className="space-y-1 text-sm">
              <p className="text-foreground font-medium">
                {order.shipping_address.fullname}
              </p>
              <p className="text-muted-foreground">
                {order.shipping_address.street}
              </p>
              <p className="text-muted-foreground">
                {order.shipping_address.house}
              </p>
              <p className="text-muted-foreground">
                {order.shipping_address.city}, {order.shipping_address.state}{" "}
                {order.shipping_address.postal_code}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Phone className="text-muted-foreground h-4 w-4" />
                <a
                  href={`tel:${order.shipping_address.phone}`}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {order.shipping_address.phone}
                </a>
              </div>
            </div>
          </Card>

          {/* billing Address */}
          {order.billing_address && (
            <Card className="border-border space-y-3 border p-4 sm:p-5">
              <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
                billing Address
              </h2>
              <div className="space-y-1 text-sm">
                <p className="text-foreground font-medium">
                  {order.billing_address.fullname}
                </p>
                <p className="text-muted-foreground">
                  {order.billing_address.street}
                </p>
                <p className="text-muted-foreground">
                  {order.billing_address.house}
                </p>
                <p className="text-muted-foreground">
                  {order.billing_address.city}, {order.billing_address.state}{" "}
                  {order.billing_address.postal_code}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <a
                    href={`tel:${order.billing_address.phone}`}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {order.billing_address.phone}
                  </a>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
