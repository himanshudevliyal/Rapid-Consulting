"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { columns } from "./table/columns";
import { useCommunityGroups, useDeleteCommunityGroup } from "@/hooks/use-community-groups";
import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "@/components/delete-dialog";
import { listRows } from "@/lib/list-rows";

export default function CommunityGroupsListing() {
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error } = useCommunityGroups(searchParams.toString());
  const deleteMutation = useDeleteCommunityGroup(id, () => setIsModal(false));
  const openModal = () => setIsModal(true);

  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  const { rows, total } = listRows(data, searchParams, (row, q) =>
    [row.name, row.audience, row.cadence].some((value) => String(value ?? "").toLowerCase().includes(q)),
  );

  return (
    <>
      <DataTable columns={columns(openModal, setId)} data={rows} totalItems={total} />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
        id={id}
        title="Delete this group?"
        description="The group is deleted for good. To hide it from the website instead, edit it and untick Active."
      />
    </>
  );
}
