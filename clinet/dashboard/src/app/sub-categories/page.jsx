import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import SubCategoriesTableActions from "../../features/sub-categories/components/table/sub-categories-table-actions";
import SubCategoriesListing from "../../features/sub-categories/components/sub-categories-listing";

export const metadata = {
  title: "Sub Categories",
};

export default async function SubCategories({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Sub Categories"}
      pageDescription={"Manage sub categories (Create, Update, Delete)."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href={"/sub-categories/create"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <SubCategoriesTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
      >
        <SubCategoriesListing />
      </Suspense>
    </PageContainer>
  );
}
