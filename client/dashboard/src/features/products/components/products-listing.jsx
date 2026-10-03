"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "@/components/delete-dialog";
import { FormDialog } from "@/components/ui/form-dialog";
import { useDeleteProduct, useProducts, useUpdateProduct } from "@/hooks/use-products";
import StockInventoryForm from "./stock-inventory-form";
import { columns } from "./table/columns";

export default function ProductsListing() {
  const [id, setId] = useState(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isUpdateModal, setIsUpdateModal] = useState(false);
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const { data, isLoading, isError, error } = useProducts(searchParamsStr);
  const deleteMutation = useDeleteProduct(id, () => {
    setIsDeleteModal(false);
  });
  const updateMutation = useUpdateProduct(id);

  const openModal = (type) => {
    if (type === "delete") setIsDeleteModal(true);
    if (type === "update-stock") setIsUpdateModal(true);
  };

  if (isLoading) return <DataTableSkeleton columnCount={4} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <>
      <DataTable
        columns={columns(openModal, setId, updateMutation)}
        data={data?.products ?? []}
        totalItems={data?.total ?? 0}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isDeleteModal}
        setIsOpen={setIsDeleteModal}
      />
      <FormDialog
        isOpen={isUpdateModal}
        setIsOpen={setIsUpdateModal}
        title="Update Inventory"
        description="Update Inventory"
      >
        <StockInventoryForm
          callback={() => setIsUpdateModal(false)}
          id={id}
          type="edit"
          stockType={"product"}
        />
      </FormDialog>
    </>
  );
}
