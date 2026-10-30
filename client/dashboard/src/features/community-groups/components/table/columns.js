"use client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PLACEMENTS } from "@/schemas/community-group";

const placementLabel = (value) => PLACEMENTS.find((p) => p.value === value)?.label ?? value;

export const columns = (openModal, setId) => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.audience || "-"}</div>
      </div>
    ),
  },
  { accessorKey: "cadence", header: "Cadence", cell: ({ row }) => row.original.cadence || "-" },
  {
    id: "placements",
    header: "Shown on",
    cell: ({ row }) => {
      const placements = Array.isArray(row.original.placements) ? row.original.placements : [];
      return placements.length ? (
        <div className="flex flex-wrap gap-1">
          {placements.map((value) => (
            <Badge key={value} variant="secondary">{placementLabel(value)}</Badge>
          ))}
        </div>
      ) : (
        "-"
      );
    },
  },
  {
    id: "join_url",
    header: "Join link",
    cell: ({ row }) => (
      <Badge variant={row.original.join_url ? "default" : "outline"}>{row.original.join_url ? "Set" : "Not set"}</Badge>
    ),
  },
  { accessorKey: "sort_order", header: "Order", cell: ({ row }) => row.original.sort_order ?? "-" },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ row }) => (
      <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
        {row.getValue("is_active") ? "Active" : "Inactive"}
      </Badge>
    ),
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
            <DropdownMenuItem><Link href={`/community-groups/${id}/edit`} className="w-full">Edit</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setId(id); openModal(); }}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
