"use client";

import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { columns } from "./table/columns";
import { ENQUIRY_KINDS } from "./enquiry-kinds";
import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "@/components/delete-dialog";

export default function EnquiriesListing({ kind = "enquiry" }) {
  const config = ENQUIRY_KINDS[kind];
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error } = config.useList(searchParams.toString());
  const deleteMutation = config.useDelete(id, () => setIsModal(false));

  const openModal = () => setIsModal(true);

  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <>
      <DataTable columns={columns(kind, openModal, setId)} data={data?.data ?? []} totalItems={data?.total ?? 0} />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
        id={id}
        title={`Delete this ${config.singular.toLowerCase()}?`}
        description="It is deleted for good. To keep it but hide it from your work, set its status to Resolved or Spam instead."
      />
    </>
  );
}
