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
import moment from "moment";
import Link from "next/link";
import { ENQUIRY_KINDS, sourceLabel } from "../enquiry-kinds";

const STATUS_VARIANT = { new: "default", "in-progress": "secondary", resolved: "outline", spam: "destructive" };
const STATUS_LABEL = { new: "New", "in-progress": "In progress", resolved: "Resolved", spam: "Spam" };

// Cell with a main line and a small muted line underneath.
const Stack = ({ main, sub }) => (
  <div className="max-w-[260px]">
    <div className="truncate font-medium">{main || "-"}</div>
    {sub && <div className="truncate text-xs text-muted-foreground">{sub}</div>}
  </div>
);

export const columns = (kind, openModal, setId) => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Stack
        main={row.original.name}
        sub={[row.original.phone, kind === "contact" && row.original.email].filter(Boolean).join(" · ")}
      />
    ),
  },
  kind === "contact"
    ? {
        accessorKey: "subject",
        header: "Subject / message",
        cell: ({ row }) => <Stack main={row.original.subject || row.original.message} sub={row.original.subject ? row.original.message : ""} />,
      }
    : {
        accessorKey: "service_name",
        header: "Service / requirement",
        cell: ({ row }) => (
          <Stack main={row.original.service_name || row.original.subject} sub={row.original.requirement} />
        ),
      },
  {
    accessorKey: "page_title",
    header: "Source page",
    cell: ({ row }) => (
      <Stack
        main={row.original.page_title}
        sub={sourceLabel(kind, row.original.source)}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return <Badge variant={STATUS_VARIANT[status] ?? "outline"}>{STATUS_LABEL[status] ?? status}</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Received",
    cell: ({ row }) => <div className="whitespace-nowrap">{moment(row.getValue("created_at")).format("DD/MM/YYYY HH:mm")}</div>,
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
            <DropdownMenuItem>
              <Link href={ENQUIRY_KINDS[kind].editUrl(id)} className="w-full">
                View / update
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setId(id);
                openModal();
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
