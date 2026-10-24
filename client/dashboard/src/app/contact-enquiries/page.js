import PageContainer from "@/components/layout/page-container";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { Suspense } from "react";
import EnquiriesListing from "@/features/enquiries/components/enquiries-listing";
import EnquiriesTableActions from "@/features/enquiries/components/table/enquiries-table-actions";

export const metadata = { title: "Contact Enquiries" };

export default async function ContactEnquiriesPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Contact Enquiries"}
      pageDescription={"Messages sent with the Contact Us form of the website."}
      scrollable={false}
    >
      <EnquiriesTableActions kind="contact" />
      <Suspense key={key} fallback={<DataTableSkeleton columnCount={6} rowCount={10} />}>
        <EnquiriesListing kind="contact" />
      </Suspense>
    </PageContainer>
  );
}
