import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import EnquiriesListing from "@/features/enquiries/components/enquiries-listing";
import EnquiriesTableActions from "@/features/enquiries/components/table/enquiries-table-actions";

export const metadata = { title: "Enquiries" };

export default async function EnquiriesPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Enquiries"}
      pageDescription={"Manage enquiries (view, update, delete)."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href={"/enquiries/create"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <EnquiriesTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
      >
        <EnquiriesListing />
      </Suspense>
    </PageContainer>
  );
}
