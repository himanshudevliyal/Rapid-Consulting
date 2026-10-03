"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { columns } from "./table/columns";
import { useAdvisers, useDeleteAdviser } from "@/hooks/use-advisers";
import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "@/components/delete-dialog";

export default function AdvisersListing() {
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error } = useAdvisers(searchParams.toString());
  const deleteMutation = useDeleteAdviser(id, () => setIsModal(false));
  const openModal = () => setIsModal(true);

  if (isLoading) return <DataTableSkeleton columnCount={5} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <>
      <DataTable columns={columns(openModal, setId)} data={data?.data ?? data?.advisers ?? []} totalItems={data?.total ?? 0} />
      <DeleteDialog deleteMutation={deleteMutation} isOpen={isModal} setIsOpen={setIsModal} id={id} />
    </>
  );
}
