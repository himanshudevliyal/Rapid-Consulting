import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import IndustriesListing from "@/features/industries/components/industries-listing";
import IndustriesTableActions from "@/features/industries/components/table/industries-table-actions";

export const metadata = { title: "Industries" };

export default async function IndustriesPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Industries"}
      pageDescription={"Manage industries (Create, Update, Delete)."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href={"/industries/create"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <IndustriesTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
      >
        <IndustriesListing />
      </Suspense>
    </PageContainer>
  );
}
