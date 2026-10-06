import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import CaseStudiesListing from "@/features/case-studies/components/case-studies-listing";
import CaseStudiesTableActions from "@/features/case-studies/components/table/case-studies-table-actions";

export const metadata = { title: "Case Studies" };

export default async function CaseStudiesPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Case Studies"}
      pageDescription={"Client stories shown on the website. Drafts stay hidden until published."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href={"/case-studies/create"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <CaseStudiesTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={7} rowCount={10} />}
      >
        <CaseStudiesListing />
      </Suspense>
    </PageContainer>
  );
}
