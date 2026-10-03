"use client";
import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DeleteDialog } from "@/components/delete-dialog";
import { useDeleteUser, useGetUsers, useUpdateUser } from "@/hooks/use-users";
import { columns } from "./table/columns";

export default function UsersListing({ role = "" }) {
  const [isModal, setIsModal] = useState(false);
  const [userId, setUserId] = useState("");
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();

  const openModal = () => setIsModal(true);
  const closeModal = () => setIsModal(false);

  const { data, isLoading, isError, error } = useGetUsers(
    `${searchParamsStr}&ol=${role ?? ""}`,
  );
  const deleteMutation = useDeleteUser(userId, closeModal);
  const updateMutation = useUpdateUser(userId);

  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <>
      <DataTable
        columns={columns(updateMutation, setUserId, openModal)}
        data={data?.users ?? []}
        totalItems={data?.total}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
      />
    </>
  );
}
