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
import { ArrowUpDown } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import config from "@/config";

export const columns = (openModal, setId, updateMutation) => [
  {
    accessorKey: "thumbnail",
    header: "Image",
    cell: ({ row }) => {
      const thumbnail = row.getValue("thumbnail");
      return thumbnail ? (
        <Image
          src={`${config.file_base}/${thumbnail}`}
          alt=""
          width={40}
          height={40}
          className="size-10 rounded-md object-cover"
          unoptimized
        />
      ) : (
        <div className="bg-accent size-10 rounded-md" />
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          size={"sm"}
        >
          Title <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue("title");
      const slug = row.original.slug;
      return (
        <Link
          href={`/shop/${slug}`}
          target="_black"
          className="hover:underline capitalize"
        >
          {title}
        </Link>
      );
    },
  },
  {
    accessorKey: "category_title",
    header: "Category",
    cell: ({ row }) => row.getValue("category_title") || "-",
  },
  {
    accessorKey: "sub_category_title",
    header: "Subcategory",
    cell: ({ row }) => row.getValue("sub_category_title") || "-",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const id = row.original.id;
      const isActive = row.getValue("is_active");
      return (
        <div className="flex items-center justify-start gap-2">
          <Switch
            checked={isActive}
            onCheckedChange={() => {
              setId(id);
              setTimeout(() =>
                updateMutation.mutate({ is_active: !isActive }),
              );
            }}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          size={"sm"}
        >
          Created on <ArrowUpDown />
        </Button>
      );
    },
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
              <Link href={`/products/${id}/edit`} className="w-full">
                Edit
              </Link>
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setId(id);
                openModal("update-stock");
              }}
            >
              Update stock
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setId(id);
                openModal("delete");
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
