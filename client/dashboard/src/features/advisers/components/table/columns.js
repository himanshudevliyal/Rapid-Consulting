"use client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { imageSrc } from "@/lib/image-src";

export const columns = (openModal, setId) => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageSrc(row.original.photo)} alt="" className="size-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="size-10 shrink-0 rounded-full bg-muted" aria-hidden="true" />
        )}
        <div className="font-medium">{row.original.name}</div>
      </div>
    ),
  },
  { accessorKey: "designation", header: "Designation", cell: ({ row }) => row.getValue("designation") || "-" },
  { accessorKey: "team_group", header: "Group", cell: ({ row }) => row.getValue("team_group") || "-" },
  { accessorKey: "display_order", header: "Order", cell: ({ row }) => row.getValue("display_order") ?? "-" },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ row }) => <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>{row.getValue("is_active") ? "Active" : "Inactive"}</Badge>,
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
            <DropdownMenuItem><Link href={`/advisers/${id}/edit`} className="w-full">Edit</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setId(id); openModal(); }}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
