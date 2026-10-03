import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import JobsListing from "@/features/jobs/components/jobs-listing";
import JobsTableActions from "@/features/jobs/components/table/jobs-table-actions";

export const metadata = { title: "Jobs" };

export default async function JobsPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Jobs"}
      pageDescription={"Manage jobs (Create, Update, Delete)."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href={"/jobs/create"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <JobsTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
      >
        <JobsListing />
      </Suspense>
    </PageContainer>
  );
}
