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
import moment from "moment";
import Link from "next/link";

export const columns = (openModal, setId) => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex items-center justify-start gap-2 capitalize">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "category_title",
    header: "Category",
    cell: ({ row }) => row.getValue("category_title") || "-",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date");
      return <div>{date ? moment(date).format("DD/MM/YYYY") : "-"}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created on",
    cell: ({ row }) => (
      <div>{moment(row.getValue("created_at")).format("DD/MM/YYYY")}</div>
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
            <DropdownMenuItem>
              <Link href={`/blogs/${id}/edit`} className="w-full">
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