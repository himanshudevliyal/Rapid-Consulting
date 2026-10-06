"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { columns } from "./table/columns";
import { useArticles, useDeleteArticle } from "@/hooks/use-articles";
import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "@/components/delete-dialog";

export default function ArticlesListing() {
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error } = useArticles(searchParams.toString());
  const deleteMutation = useDeleteArticle(id, () => setIsModal(false));
  const openModal = () => setIsModal(true);

  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <>
      <DataTable columns={columns(openModal, setId)} data={data?.data ?? []} totalItems={data?.total ?? 0} />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
        id={id}
        title="Delete this article?"
        description="The article is deleted for good. To hide it from the website instead, edit it and untick Published."
      />
    </>
  );
}
