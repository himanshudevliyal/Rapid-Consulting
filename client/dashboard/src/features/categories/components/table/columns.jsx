"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import moment from "moment";
import Link from "next/link";

export const columns = (openModal, setId, updateMutation) => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue("title");
      return (
        <div className="flex items-center justify-start gap-2 capitalize">
          {title}
        </div>
      );
    },
  },
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }) => {
      const id = row.original.id;
      const featured = row.getValue("featured");
      return (
        <div className="flex items-center justify-start gap-2">
          <Switch
            checked={featured}
            onCheckedChange={() => {
              setId(id);
              setTimeout(() => updateMutation.mutate({ featured: !featured }));
            }}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created on",
    cell: ({ row }) => {
      return (
        <div>{moment(row.getValue("created_at")).format("DD/MM/YYYY")}</div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const id = row.original.id;
      const role = row.original.role;
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
              <Link href={`/categories/${id}/edit`} className="w-full">
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
