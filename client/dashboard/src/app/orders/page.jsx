import PageContainer from "@/components/layout/page-container";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import OrdersListing from "@/features/orders/components/orders-listing";
import OrdersTableActions from "@/features/orders/components/table/orders-table-actions";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { Suspense } from "react";

export const metadata = {
  title: "Orders",
};

export default async function OrdersPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle="Orders"
      pageDescription="Manage orders (Create, Update, Delete)."
      scrollable={false}
    >
      <OrdersTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
      >
        <OrdersListing />
      </Suspense>
    </PageContainer>
  );
}
