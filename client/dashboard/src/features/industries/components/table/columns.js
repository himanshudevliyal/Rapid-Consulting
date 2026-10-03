"use client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const columns = (openModal, setId) => [
  { accessorKey: "name", header: "Name", cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div> },
  { accessorKey: "slug", header: "Slug", cell: ({ row }) => <div className="text-muted-foreground text-xs">{row.getValue("slug")}</div> },
  { accessorKey: "icon", header: "Icon", cell: ({ row }) => row.getValue("icon") || "-" },
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
            <DropdownMenuItem><Link href={`/industries/${id}/edit`} className="w-full">Edit</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setId(id); openModal(); }}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
