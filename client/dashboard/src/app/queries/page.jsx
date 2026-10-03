import PageContainer from "@/components/layout/page-container";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { Suspense } from "react";
import QueryTableActions from "@/features/queries/components/table/query-table-actions";
import QueriesListing from "@/features/queries/components/queries-listing";

export const metadata = {
  title: "Queries",
};

export default async function QueriesPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Queries"}
      pageDescription={"Manage queries (Create, Update, Delete)."}
      scrollable={false}
    >
      <QueryTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
      >
        <QueriesListing />
      </Suspense>
    </PageContainer>
  );
}
