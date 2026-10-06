import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import ArticlesListing from "@/features/articles/components/articles-listing";
import ArticlesTableActions from "@/features/articles/components/table/articles-table-actions";

export const metadata = { title: "Articles" };

export default async function ArticlesPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Articles"}
      pageDescription={"Guides and articles shown on the website. Drafts stay hidden until published."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href={"/articles/create"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <ArticlesTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={6} rowCount={10} />}
      >
        <ArticlesListing />
      </Suspense>
    </PageContainer>
  );
}
