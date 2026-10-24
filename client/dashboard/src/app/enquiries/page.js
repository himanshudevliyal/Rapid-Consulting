import PageContainer from "@/components/layout/page-container";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { Suspense } from "react";
import EnquiriesListing from "@/features/enquiries/components/enquiries-listing";
import EnquiriesTableActions from "@/features/enquiries/components/table/enquiries-table-actions";

export const metadata = { title: "Service Enquiries" };

export default async function EnquiriesPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Service Enquiries"}
      pageDescription={"Callback and service enquiries sent from the website's pages. Open one to see where it came from."}
      scrollable={false}
    >
      <EnquiriesTableActions kind="enquiry" />
      <Suspense key={key} fallback={<DataTableSkeleton columnCount={6} rowCount={10} />}>
        <EnquiriesListing kind="enquiry" />
      </Suspense>
    </PageContainer>
  );
}
