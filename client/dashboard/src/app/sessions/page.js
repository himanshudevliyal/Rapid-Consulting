import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import SessionsListing from "@/features/sessions/components/sessions-listing";
import SessionsTableActions from "@/features/sessions/components/table/sessions-table-actions";

export const metadata = { title: "Sessions" };

export default async function SessionsPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Sessions"}
      pageDescription={"Manage sessions / webinars (Create, Update, Delete)."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href={"/sessions/create"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <SessionsTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
      >
        <SessionsListing />
      </Suspense>
    </PageContainer>
  );
}
