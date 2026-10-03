"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import ErrorMessage from "@/components/ui/error";
import {
  useDeleteOrderItem,
  useOrder,
  useOrderItems,
  useUpdateOrderItem,
} from "@/hooks/use-orders";
import Loader from "@/components/loader";
import { columns } from "./table/columns";
import { DeleteDialog } from "@/components/delete-dialog";
import OrderDetails from "@/features/orders/components/order-details";

export default function OrderItemListing({ orderId }) {
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const { data, isLoading, isError, error } = useOrderItems(
    orderId,
    searchParamsStr,
  );

  const {
    data: orderData,
    isLoading: isOrderDataLoading,
    isError: isOrderDataError,
    error: orderDataError,
  } = useOrder(orderId);

  const updateMutation = useUpdateOrderItem(orderId, id, () => {});
  const deleteMutation = useDeleteOrderItem(id, () => {
    setIsModal(false);
  });
  const openModal = () => setIsModal(true);

  if (isLoading) return <DataTableSkeleton columnCount={4} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <>
      <div className="mb-4">
        {isOrderDataLoading ? (
          <Loader />
        ) : isOrderDataError ? (
          <ErrorMessage error={orderDataError} />
        ) : (
          <OrderDetails order={orderData} />
        )}
      </div>

      <DataTable
        columns={columns(openModal, setId, updateMutation)}
        data={data?.items ?? []}
        totalItems={data?.total ?? 0}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
        id={id}
      />
    </>
  );
}
