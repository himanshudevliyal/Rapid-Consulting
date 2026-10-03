"use client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import Link from "next/link";

export const columns = (openModal, setId) => [
  { accessorKey: "title", header: "Title", cell: ({ row }) => <div className="capitalize">{row.getValue("title")}</div> },
  { accessorKey: "job_type", header: "Type", cell: ({ row }) => <Badge variant="secondary">{row.getValue("job_type")}</Badge> },
  { accessorKey: "location", header: "Location", cell: ({ row }) => row.getValue("location") || "-" },
  {
    accessorKey: "closing_date",
    header: "Closing Date",
    cell: ({ row }) => { const d = row.getValue("closing_date"); return d ? moment(d).format("DD/MM/YYYY") : "-"; },
  },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ row }) => <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>{row.getValue("is_active") ? "Active" : "Closed"}</Badge>,
  },
  {
    id: "actions", enableHiding: false,
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><DotsHorizontalIcon className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><Link href={`/jobs/${id}/edit`} className="w-full">Edit</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setId(id); openModal(); }}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
