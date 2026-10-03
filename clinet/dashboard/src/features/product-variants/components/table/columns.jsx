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
import { rupee } from "@/lib/Intl";

export const columns = (openModal, setId, updateMutation) => [
  {
    accessorKey: "product_title",
    header: "Product",
    cell: ({ row }) => {
      const title = row.getValue("product_title");
      const productId = row.original.product_id;
      return (
        <Link
          href={`/products/${productId}/edit`}
          className="hover:underline capitalize"
        >
          {title}
        </Link>
      );
    },
  },
  {
    accessorKey: "pack_size",
    header: "Pack size",
    cell: ({ row }) => {
      const id = row.original.id;
      const pack_size = row.getValue("pack_size");
      return pack_size;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const id = row.original.id;
      const stock = row.getValue("stock");
      return stock;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const id = row.original.id;
      const price = row.getValue("price");
      return rupee.format(price);
    },
  },
  {
    accessorKey: "display_price",
    header: "Display price",
    cell: ({ row }) => {
      const id = row.original.id;
      const display_price = row.getValue("display_price");
      return rupee.format(display_price);
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
            <DropdownMenuItem
              onClick={() => {
                setId(id);
                openModal("update-stock");
              }}
            >
              Update stock
            </DropdownMenuItem>
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
