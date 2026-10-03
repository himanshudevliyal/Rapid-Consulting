"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ErrorMessage from "@/components/ui/error";
import {
  useDeleteOrder,
  useOrderInvoice,
  useOrders,
  useOrderShippingLabel,
  useUpdateOrder,
} from "@/hooks/use-orders";
import { columns } from "./table/columns";
import { DeleteDialog } from "@/components/delete-dialog";
import { downloadPdf } from "@/utils/download-pdf";

export default function OrdersListing() {
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const { data, isLoading, isError, error } = useOrders(searchParamsStr);
  const deleteMutation = useDeleteOrder(id, () => {
    setIsModal(false);
  });
  const updateMutation = useUpdateOrder(id, () => {});

  const downloadInvoiceMutation = useOrderInvoice(id);
  const downloadOrderShippingeMutation = useOrderShippingLabel(id);
  const openModal = () => setIsModal(true);

  const handleDownloadInvoice = async () => {
    try {
      const { blob, filename } = await downloadInvoiceMutation.mutateAsync();
      downloadPdf(blob, filename);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadShipping = async () => {
    try {
      const { blob, filename } =
        await downloadOrderShippingeMutation.mutateAsync();
      downloadPdf(blob, filename);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <DataTableSkeleton columnCount={4} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <>
      <DataTable
        columns={columns(
          id,
          setId,
          updateMutation,
          handleDownloadInvoice,
          handleDownloadShipping,
          downloadInvoiceMutation,
          downloadOrderShippingeMutation,
        )}
        data={data?.orders ?? []}
        totalItems={data?.total ?? 0}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
      />
    </>
  );
}
