"use client";

import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { columns } from "./table/columns";
import QueryView from "./query-view";
import { FormDialog } from "@/components/ui/form-dialog";
import { useDeleteQuery, useQueries } from "@/hooks/use-queries";

export default function QueriesListing() {
  const [isModal, setIsModal] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);
  const [id, setId] = useState("");

  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();

  const openModal = (type) => {
    if (type === "view") return setIsViewModal(true);
    if (type === "delete") return setIsModal(true);
  };

  const { data, isLoading, isError, error } = useQueries(searchParamsStr);
  const deleteMutation = useDeleteQuery(id, () => {
    setIsModal(false);
    setIsViewModal(false);
  });

  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <>
      <DataTable
        columns={columns(openModal, setId)}
        data={data?.queries ?? []}
        totalItems={data?.total}
      />

      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
      />

      <FormDialog open={isViewModal} setOpen={setIsViewModal}>
        <QueryView
          id={id}
          onDelete={() => {
            setId(id);
            setTimeout(() => deleteMutation.mutate({}));
          }}
          isDeleting={deleteMutation.isPending}
        />
      </FormDialog>
    </>
  );
}
