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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDateTime } from "@/lib/site-page";
import { LocaleChip, StatusChip, TranslationChip, UnpublishedChangesChip } from "../status-chips";

// templates: { key: { label } } from the registry (falls back to the key).
export const columns = (openModal, setId, { canDelete = false, templates = {} } = {}) => [
  {
    accessorKey: "title",
    header: "Page",
    cell: ({ row }) => (
      <div>
        <Link href={`/site-pages/${row.original.id}/edit`} className="font-medium hover:underline">
          {row.original.title || "Untitled page"}
        </Link>
        <div className="font-mono text-xs text-muted-foreground">
          /{row.original.locale}/{row.original.path}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "template",
    header: "Template",
    cell: ({ row }) => (
      <Badge variant="outline">{templates[row.original.template]?.label ?? row.original.template}</Badge>
    ),
  },
  {
    accessorKey: "locale",
    header: "Language",
    cell: ({ row }) => <LocaleChip locale={row.original.locale} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <StatusChip status={row.original.status} />
        <UnpublishedChangesChip show={row.original.status === "published" && !!row.original.has_unpublished_changes} />
      </div>
    ),
  },
  {
    accessorKey: "translation_status",
    header: "Translation",
    cell: ({ row }) => <TranslationChip status={row.original.translation_status} />,
  },
  {
    accessorKey: "section_count",
    header: "Sections",
    cell: ({ row }) => row.original.section_count ?? 0,
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => <span className="text-sm">{formatDateTime(row.original.updated_at)}</span>,
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
              <Link href={`/site-pages/${id}/edit`} className="w-full">
                Edit
              </Link>
            </DropdownMenuItem>
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setId(id);
                    openModal();
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
