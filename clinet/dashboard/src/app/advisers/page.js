import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import AdvisersListing from "@/features/advisers/components/advisers-listing";
import AdvisersTableActions from "@/features/advisers/components/table/advisers-table-actions";

export const metadata = { title: "Advisers" };

export default async function AdvisersPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Advisers"}
      pageDescription={"Manage advisers (Create, Update, Delete)."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href={"/advisers/create"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <AdvisersTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
      >
        <AdvisersListing />
      </Suspense>
    </PageContainer>
  );
}
