"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCommonPinningStyles } from "@/lib/data-table";

import { parseAsInteger, useQueryState } from "nuqs";
import React, { useEffect } from "react";
import DataTablePagination from "./data-table-pagination";

export function DataTable({ columns, data, totalItems, isPagination = true }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);

  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withOptions({ shallow: false }),
  );

  const [pageSize, setPageSize] = useQueryState(
    "limit",
    parseAsInteger.withOptions({ shallow: false, history: "push" }),
  );

  const paginationState = {
    pageIndex: currentPage - 1,
    pageSize: pageSize,
  };

  const pageCount = Math.ceil(totalItems / pageSize);
  const handlePaginationChange = (updaterOrValue) => {
    const pagination =
      typeof updaterOrValue === "function"
        ? updaterOrValue(paginationState)
        : updaterOrValue;

    setCurrentPage(pagination.pageIndex + 1); // converting zero-based index to one-based
    setPageSize(pagination.pageSize);
  };

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    state: {
      sorting,
      columnFilters,
      pagination: paginationState,
    },
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  useEffect(() => {
    if (currentPage < 1) {
      setCurrentPage(1); // Ensure page is at least 1
    }
  }, [currentPage, setCurrentPage]);

  return (
    <div className="flex min-h-100 flex-1 flex-col space-y-4">
      <div className="relative flex flex-1">
        <div className="absolute inset-0 flex overflow-hidden rounded-lg border">
          <ScrollArea className="h-full w-full">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          ...getCommonPinningStyles({ column: header.column }),
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            ...getCommonPinningStyles({ column: cell.column }),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-24 text-center"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
      {isPagination && (
        <DataTablePagination
          table={table}
          totalItems={totalItems}
          paginationState={paginationState}
        />
      )}
    </div>
  );
}
