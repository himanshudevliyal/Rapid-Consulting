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
import Link from "next/link";

const label = (map, code) => (code ? map?.[code] ?? code.replace(/-/g, " ") : "—");

export const columns = (openModal, setId, names = {}) => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.title}</div>
        {row.original.short_description && (
          <div className="max-w-md truncate text-xs text-muted-foreground">{row.original.short_description}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
  },
  {
    accessorKey: "type",
    header: "Format",
    cell: ({ row }) => (
      <span className="text-sm">{label(names.formats, row.original.type)}</span>
    ),
  },
  {
    accessorKey: "family_code",
    header: "Family / topic",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{label(names.topics, row.original.family_code)}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) =>
      row.original.category?.title ? (
        <Badge variant="secondary">{row.original.category.title}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "available_locales",
    header: "Languages",
    cell: ({ row }) => (
      <div className="flex gap-1">
        {(row.original.available_locales ?? []).map((locale) => (
          <Badge key={locale} variant="outline" className="uppercase">
            {locale}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Badge variant={row.original.status === "published" ? "default" : "secondary"} className="capitalize">
          {row.original.status ?? "draft"}
        </Badge>
        {!row.original.is_active && <Badge variant="outline">Hidden</Badge>}
      </div>
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
            <DropdownMenuItem asChild>
              <Link href={`/services/${id}/edit`} className="w-full">
                Edit
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
