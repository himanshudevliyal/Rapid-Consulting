"use client";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { rupee } from "@/lib/Intl";
import moment from "moment";
import Link from "next/link";
import { ArrowUpDown, Download, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const orderStatuses = [
  { value: "Pending", label: "Pending", color: "bg-yellow-500" },
  { value: "Order Accepted", label: "Order Accepted", color: "bg-blue-500" },
  {
    value: "Order Processing",
    label: "Order Processing",
    color: "bg-amber-500",
  },
  { value: "In Transit", label: "In Transit", color: "bg-violet-500" },
  {
    value: "Out For Delivery",
    label: "Out For Delivery",
    color: "bg-indigo-500",
  },
  { value: "Delivered", label: "Delivered", color: "bg-green-500" },
  { value: "Canceled", label: "Canceled", color: "bg-red-500" },
];

export const columns = (
  selectedId,
  setId,
  updateMutation,
  downloadInvoice,
  downloadOrderShipping,
  downloadInvoiceMutation,
  downloadOrderShippingeMutation,
) => [
  {
    accessorKey: "order_no",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order No. <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("order_status");

      return (
        <Badge className={orderStatuses.find((s) => s.value === status)?.color}>
          <Link href={`/orders/${row.original.id}/items?page=1&limit=10`}>
            {row.getValue("order_no")}
          </Link>
        </Badge>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = row.getValue("total");
      return <Badge> {rupee.format(total)}</Badge>;
    },
  },
  {
    accessorKey: "fullname",
    header: "Fullname",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "mobile_number",
    header: "Phone",
  },
  {
    accessorKey: "payment_method",
    header: "Payment method",
    cell: ({ row }) => {
      return (
        <span className={"uppercase"}>{row.getValue("payment_method")}</span>
      );
    },
  },
  {
    accessorKey: "order_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("order_status");
      const id = row.original.id;

      return (
        <Select
          value={status}
          onValueChange={(value) => {
            setId(id);
            setTimeout(() => {
              updateMutation.mutate({ order_status: value });
            }, 0);
          }}
        >
          <SelectTrigger className={"capitalize"}>
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            {orderStatuses.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={`flex items-center gap-2 capitalize`}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${option.color}`}
                />
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "is_paid",
    header: ({ column }) => {
      return <Button variant="ghost">PAID</Button>;
    },
    cell: ({ row }) => {
      const is_paid = row.getValue("is_paid");
      const id = row.original.id;
      return (
        <div className="flex items-center justify-start gap-2">
          <Switch
            checked={is_paid}
            onCheckedChange={(checked) => {
              setId(id);
              setTimeout(() => {
                updateMutation.mutate({ is_paid: checked });
              });
            }}
            className="h-5 w-8 [&_span]:size-4 data-[state=checked]:[&_span]:translate-x-3 data-[state=checked]:[&_span]:rtl:-translate-x-3"
          />
          <Small className={is_paid ? "text-green-500" : "text-red-500"}>
            {is_paid ? "Paid" : "Not paid"}
          </Small>
        </div>
      );
    },
  },
  {
    accessorKey: "order_documents",
    header: "Docs",
    cell: ({ row }) => {
      const docs = row.getValue("order_documents");
      const id = row.original.id;

      return (
        <div className="space-x-2">
          {["invoice", "shipping"].map((doc, ind) => {
            const isPending =
              selectedId === id &&
              ((doc === "invoice" && downloadInvoiceMutation.isPending) ||
                (doc === "shipping" &&
                  downloadOrderShippingeMutation.isPending));

            return (
              <Button
                key={ind}
                disabled={isPending}
                onClick={() => {
                  setId(id);
                  doc === "invoice"
                    ? downloadInvoice()
                    : downloadOrderShipping();
                }}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "capitalize",
                )}
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
      );
    },
  },

  {
    accessorKey: "shipping_address.full_address",
    header: "Address",
    cell: ({ row }) => (
      <Small
        className={"text-xs"}
      >{`${row.original.shipping_address.fullname ?? "N/a"}, ${row.original.shipping_address.house ?? "N/a"}, ${row.original.shipping_address.street}, ${row.original.shipping_address.city}, ${row.original.shipping_address.state} ${row.original.shipping_address.postal_code}, Phone: ${row.original.shipping_address.phone}`}</Small>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created On <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div>{moment(row.getValue("created_at")).format("DD/MM/YYYY")}</div>
      );
    },
  },
  // {
  //   id: "actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const id = row.original.id;
  //     const role = row.original.role;
  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <DotsHorizontalIcon className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           {/* <DropdownMenuSeparator />
  //           <DropdownMenuItem>
  //             <Link href={`/books/${id}/edit`} className="w-full">
  //               Edit
  //             </Link>
  //           </DropdownMenuItem> */}
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem
  //             onClick={() => {
  //               setId(id);
  //               openModal();
  //             }}
  //           >
  //             Delete
  //           </DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];
