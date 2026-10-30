"use client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SESSION_STATES } from "@/schemas/session";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

// The API sends `state`; work it out here if it is missing.
const stateOf = (row) => {
  if (row.state) return row.state;
  if (row.recording_url) return "recording";
  return row.starts_at && new Date(row.starts_at) > new Date() && row.registration_open ? "upcoming" : "closed";
};

export const columns = (openModal, setId) => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.title}</div>
        <div className="font-mono text-xs text-muted-foreground">{row.original.slug}</div>
      </div>
    ),
  },
  {
    accessorKey: "starts_at",
    header: "Starts",
    cell: ({ row }) => formatDateTime(row.original.starts_at),
  },
  {
    accessorKey: "speaker_name",
    header: "Speaker",
    cell: ({ row }) => row.original.speaker_name || "-",
  },
  {
    id: "state",
    header: "State",
    cell: ({ row }) => {
      const state = SESSION_STATES[stateOf(row.original)] ?? SESSION_STATES.closed;
      return <Badge variant={state.variant}>{state.label}</Badge>;
    },
  },
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
            <DropdownMenuItem><Link href={`/sessions/${id}/edit`} className="w-full">Edit</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setId(id); openModal(); }}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
