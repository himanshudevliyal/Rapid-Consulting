import React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function DataTablePagination({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  paginationState,
  totalItems,
}) {
  return (
    <div className="flex flex-col items-center justify-end gap-2 space-x-2 py-4 sm:flex-row">
      <div className="flex w-full items-center justify-between">
        <div className="text-muted-foreground flex-1 text-start text-sm">
          {totalItems > 0 ? (
            <>
              Showing {paginationState.pageIndex * paginationState.pageSize + 1}{" "}
              to{" "}
              {Math.min(
                (paginationState.pageIndex + 1) * paginationState.pageSize,
                totalItems,
              )}{" "}
              of {totalItems} entries
            </>
          ) : (
            "No entries found"
          )}
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium whitespace-nowrap">
              Rows per page
            </p>
            <Select
              value={`${paginationState.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8! w-17.5">
                <SelectValue placeholder={paginationState.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-2 sm:justify-end">
        <div className="flex items-center justify-center text-sm font-medium">
          {totalItems > 0 ? (
            <>
              Page {paginationState.pageIndex + 1} of {table.getPageCount()}
            </>
          ) : (
            "No pages"
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Go to first page"
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
