import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import SitePagesListing from "@/features/site-pages/components/site-pages-listing";
import SitePagesTableActions from "@/features/site-pages/components/table/site-pages-table-actions";

export const metadata = { title: "Site pages" };

export default async function SitePagesPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Site pages"}
      pageDescription={"Pages of the website built from sections (Create, Edit, Preview, Publish)."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href={"/site-pages/create"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <SitePagesTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={8} rowCount={10} />}
      >
        <SitePagesListing />
      </Suspense>
    </PageContainer>
  );
}
