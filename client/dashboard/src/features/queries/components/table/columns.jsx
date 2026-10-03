"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paperclip } from "lucide-react";
import moment from "moment";

const reasonLabels = {
  domestic_sales_enquiry: "Domestic Sales",
  export_sales_enquiry: "Export Sales",
  after_sales_services: "After Sales",
  career: "Career",
  become_a_vendor: "Become a Vendor",
};

export const columns = (openModal, setId) => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason = row.getValue("reason");
      if (!reason) return "-";
      return (
        <Badge variant="outline" className="font-normal">
          {reasonLabels[reason] || reason}
        </Badge>
      );
    },
  },
  {
    accessorKey: "attachment",
    header: "Attachment",
    cell: ({ row }) =>
      row.getValue("attachment") ? (
        <Paperclip className="text-muted-foreground size-4" />
      ) : (
        "-"
      ),
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
                setId(id);
                openModal("view");
              }}
            >
              View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setId(id);
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