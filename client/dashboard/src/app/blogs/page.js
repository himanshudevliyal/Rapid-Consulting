import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import BlogsListing from "@/features/blog/components/blogs-listing";
import BlogsTableActions from "@/features/blog/components/table/blogs-table-actions";

export const metadata = { title: "Blogs" };

export default async function Blogs({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Blogs"}
      pageDescription={"Manage blogs (Create, Update, Delete)."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href={"/blogs/create"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <BlogsTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
      >
        <BlogsListing />
      </Suspense>
    </PageContainer>
  );
}