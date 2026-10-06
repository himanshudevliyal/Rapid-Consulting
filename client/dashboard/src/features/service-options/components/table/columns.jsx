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

export const columns = (config, openModal, setId) => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        {row.original.description && (
          <div className="max-w-md truncate text-xs text-muted-foreground">{row.original.description}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
  },
  ...(config.hasIcon
    ? [
        {
          accessorKey: "icon",
          header: "Icon",
          cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.icon || "—"}</span>,
        },
      ]
    : []),
  {
    accessorKey: "service_count",
    header: "Services",
    cell: ({ row }) => <span className="text-sm">{row.original.service_count ?? 0}</span>,
  },
  {
    accessorKey: "sort_order",
    header: "Order",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.sort_order}</span>,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
        {row.original.is_system && <Badge variant="outline">Built-in</Badge>}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const { id, is_system } = row.original;
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
              <Link href={`${config.basePath}/${id}/edit`} className="w-full">
                Edit
              </Link>
            </DropdownMenuItem>
            {!is_system && (
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
