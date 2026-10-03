import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import ProductTableActions from "../../features/products/components/table/product-table-actions";
import ProductsListing from "@/features/products/components/products-listing";
import CategoryFilter, { SubCategoryFilter } from "@/features/products/components/category-filter";

export const metadata = {
  title: "Products",
};

export default async function Products({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      scrollable={false}
      pageTitle={"Products"}
      pageDescription={"Manage Products (Create, Update, Delete)."}
      pageHeaderAction={
        <Link
          href={"/products/create"}
          className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
        >
          <Plus /> Add
        </Link>
        
      }
    >

<div   className="flex gap-4 ">
      <CategoryFilter/>
    <SubCategoryFilter/>
</div>

      <ProductTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
      >
        <ProductsListing />
      </Suspense>
    </PageContainer>
  );
}
