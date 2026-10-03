import PageContainer from "@/components/layout/page-container";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { Suspense } from "react";
import ProductInquiryTableActions from "@/features/product-inquiries/components/table/product-inquiry-table-actions";
import ProductInquiriesListing from "@/features/product-inquiries/components/product-inquiries-listing";

export const metadata = {
  title: "Product Inquiries",
};

export default async function ProductInquiriesPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Product Inquiries"}
      pageDescription={"View and manage product inquiries submitted by customers."}
      scrollable={false}
    >
      <ProductInquiryTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={8} rowCount={10} />}
      >
        <ProductInquiriesListing />
      </Suspense>
    </PageContainer>
  );
}
