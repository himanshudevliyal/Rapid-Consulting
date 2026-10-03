"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rupee } from "@/lib/Intl";
import moment from "moment";
import { ArrowUpDown } from "lucide-react";

export const columns = (openModal, setId, updateMutation) => [
  {
    accessorKey: "title",
    header: "Product",
  },
  {
    accessorKey: "product_price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("product_price");
      return <Badge> {rupee.format(price)}</Badge>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = row.getValue("total");
      return <Badge> {rupee.format(total)}</Badge>;
    },
  },
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => {
  //     const status = row.getValue("status");
  //     const id = row.original.id;

  //     return (
  //       <Select
  //         value={status}
  //         onValueChange={(value) => {
  //           setId(id);
  //           setTimeout(() => {
  //             updateMutation.mutate({ status: value });
  //           }, 0);
  //         }}
  //       >
  //         <SelectTrigger className={"capitalize"}>
  //           <SelectValue placeholder="Select a status" />
  //         </SelectTrigger>
  //         <SelectContent>
  //           {[
  //             { value: "pending", label: "pending" },
  //             { value: "processing", label: "processing" },
  //             { value: "dispatched", label: "dispatched" },
  //             { value: "shipped", label: "shipped" },
  //             { value: "delivered", label: "delivered" },
  //             { value: "cancelled", label: "cancelled" },
  //             { value: "returned", label: "returned" },
  //           ].map((option) => (
  //             <SelectItem
  //               key={option.value}
  //               value={option.value}
  //               className={"capitalize"}
  //             >
  //               {option.label}
  //             </SelectItem>
  //           ))}
  //         </SelectContent>
  //       </Select>
  //     );
  //   },
  // },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
  // {
  //   id: "actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const id = row.original.id;
  //     const role = row.original.role;
  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <DotsHorizontalIcon className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem>
  //             <Link href={`/books/${id}/edit`} className="w-full">
  //               Edit
  //             </Link>
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem
  //             onClick={() => {
  //               setId(id);
  //               openModal();
  //             }}
  //           >
  //             Delete
  //           </DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];
