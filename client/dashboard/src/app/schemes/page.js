import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import SchemesListing from "@/features/schemes/components/schemes-listing";
import SchemesTableActions from "@/features/schemes/components/table/schemes-table-actions";

export const metadata = { title: "Schemes" };

export default async function SchemesPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Schemes"}
      pageDescription={"Manage schemes (Create, Update, Delete)."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href={"/schemes/create"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <SchemesTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
      >
        <SchemesListing />
      </Suspense>
    </PageContainer>
  );
}
