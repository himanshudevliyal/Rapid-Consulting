"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "@/components/delete-dialog";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { columns } from "./table/columns";
import { getOptionConfig } from "./option-config";

export default function OptionsListing({ kind }) {
  const config = getOptionConfig(kind);
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error } = config.hooks.useList(searchParams.toString());
  const deleteMutation = config.hooks.useDelete(id, () => setIsModal(false));

  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <>
      <DataTable
        columns={columns(config, () => setIsModal(true), setId)}
        data={data?.data ?? []}
        totalItems={data?.total ?? 0}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
        id={id}
        title={`Delete this ${config.singular}?`}
        description={`This cannot be undone. A ${config.singular} that services still use cannot be deleted; mark it inactive instead.`}
      />
    </>
  );
}
