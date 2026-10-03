"use client";
import { ArrowUpDown } from "lucide-react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  closed: "bg-emerald-100 text-emerald-700",
};

export const columns = (openModal, setInquiryId) => [
  {
    accessorKey: "full_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "company_name",
    header: "Company",
    cell: ({ row }) => row.getValue("company_name") || "-",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "contact_number",
    header: "Contact",
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => `${row.getValue("city")}, ${row.original.state}`,
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => `${row.getValue("products")?.length ?? 0} item(s)`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
            statusStyles[status] || "bg-neutral-100 text-neutral-700",
          )}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => (
      <div>{moment(row.getValue("created_at")).format("DD/MM/YYYY")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setInquiryId(id);
                openModal("view");
              }}
            >
              View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setInquiryId(id);
                openModal("delete");
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
