"use client";

import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { columns } from "./table/columns";
import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  useDeleteProductVariant,
  useProductVariants,
  useUpdateProductVariant,
} from "@/hooks/use-product-variants";
import StockInventoryForm from "@/features/products/components/stock-inventory-form";
import { FormDialog } from "@/components/ui/form-dialog";

export default function ProductVariantsListing() {
  const [id, setId] = useState(null);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isUpdateStockModal, setIsUpdateStockModal] = useState(false);

  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();

  const { data, isLoading, isError, error } =
    useProductVariants(searchParamsStr);
  const deleteMutation = useDeleteProductVariant(id, () => {
    setIsDeleteModal(false);
  });
  const updateMutation = useUpdateProductVariant(id);
  const openModal = (type) => {
    console.log({ type });
    if (type === "delete") setIsDeleteModal(true);
    if (type === "update-stock") setIsUpdateStockModal(true);
  };
  console.log({ isUpdateStockModal });

  if (isLoading) return <DataTableSkeleton columnCount={4} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <>
      <DataTable
        columns={columns(openModal, setId, updateMutation)}
        data={data?.variants ?? []}
        totalItems={data?.total ?? 0}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isDeleteModal}
        setIsOpen={setIsDeleteModal}
        id={id}
      />
      <FormDialog
        open={isUpdateStockModal}
        setOpen={setIsUpdateStockModal}
        title="Update Inventory"
        description="Update Inventory"
      >
        <StockInventoryForm
          callback={() => setIsUpdateStockModal(false)}
          id={id}
          type="edit"
          stockType={"product"}
        />
      </FormDialog>
    </>
  );
}
