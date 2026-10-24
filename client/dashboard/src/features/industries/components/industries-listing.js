"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { columns } from "./table/columns";
import { useIndustries, useDeleteIndustry } from "@/hooks/use-industries";
import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "@/components/delete-dialog";

export default function IndustriesListing() {
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error } = useIndustries();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const deleteMutation = useDeleteIndustry(id, () => setIsModal(false));
  const openModal = () => setIsModal(true);

  if (isLoading) return <DataTableSkeleton columnCount={5} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  const all = Array.isArray(data) ? data : (data?.data ?? []);
  const rows = q ? all.filter((row) => `${row.name} ${row.slug}`.toLowerCase().includes(q)) : all;

  return (
    <>
      <DataTable columns={columns(openModal, setId)} data={rows} totalItems={rows.length} />
      <DeleteDialog deleteMutation={deleteMutation} isOpen={isModal} setIsOpen={setIsModal} id={id} />
    </>
  );
}
