"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { columns } from "./table/columns";
import { useServices, useDeleteService } from "@/hooks/use-services";
import { useAllServiceFamilyTopics, useAllServiceFormats } from "@/hooks/use-service-options";
import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "@/components/delete-dialog";

const nameMap = (rows = []) => Object.fromEntries(rows.map((row) => [row.code, row.name]));

export default function ServicesListing() {
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error } = useServices(searchParams.toString());
  const formats = useAllServiceFormats();
  const topics = useAllServiceFamilyTopics();
  const deleteMutation = useDeleteService(id, () => setIsModal(false));
  const openModal = () => setIsModal(true);

  const names = useMemo(
    () => ({ formats: nameMap(formats.data?.data), topics: nameMap(topics.data?.data) }),
    [formats.data, topics.data],
  );

  if (isLoading) return <DataTableSkeleton columnCount={7} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <>
      <DataTable
        columns={columns(openModal, setId, names)}
        data={data?.data?.services ?? []}
        totalItems={data?.data?.total ?? data?.data?.services?.length ?? 0}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
        id={id}
        title="Delete this service?"
        description="The service and all its language versions are deleted. This cannot be undone. To hide it instead, edit it and untick Active."
      />
    </>
  );
}
