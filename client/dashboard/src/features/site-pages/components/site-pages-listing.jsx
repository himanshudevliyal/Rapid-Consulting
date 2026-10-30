"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { columns } from "./table/columns";
import { useDeleteSitePage, useSitePageRegistry, useSitePages } from "@/hooks/use-site-pages";
import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "@/components/delete-dialog";
import { useAuth } from "@/providers/auth-provider";
import { listOf } from "@/lib/site-page";

export default function SitePagesListing() {
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useSitePages(searchParams.toString());
  const registry = useSitePageRegistry();
  const deleteMutation = useDeleteSitePage(id, () => setIsModal(false));
  const openModal = () => setIsModal(true);

  const tableColumns = columns(openModal, setId, {
    canDelete: user?.role === "admin",
    templates: registry.data?.templates ?? {},
  });

  if (isLoading) return <DataTableSkeleton columnCount={8} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  const rows = listOf(data);
  const total = Array.isArray(data) ? rows.length : (data?.total ?? rows.length);

  return (
    <>
      <DataTable columns={tableColumns} data={rows} totalItems={total} />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
        id={id}
        title="Delete this page?"
        description="The page and its revisions are deleted for good, and it is removed from the website if it was published. The other language version is not touched. To take a page off the website and keep it, unpublish it instead."
      />
    </>
  );
}
