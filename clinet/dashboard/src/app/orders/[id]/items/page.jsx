import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import OrderItemListing from "@/features/order-items/components/order-items-listing";
import OrderItemTableActions from "@/features/order-items/components/table/order-items-table-actions";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { Suspense } from "react";

export const metadata = {
  title: "Orders items",
};

export default async function OrderItems({ searchParams, params }) {
  searchParamsCache.parse(await searchParams);
  const { id } = await params;
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle="Order items"
      pageDescription="Manage order items (Create, Update, Delete)."
      scrollable={true}
    >
      <OrderItemTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
      >
        <OrderItemListing orderId={id} />
      </Suspense>
    </PageContainer>
  );
}
