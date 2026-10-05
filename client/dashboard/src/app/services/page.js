import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import ServicesListing from "@/features/services/components/services-listing";
import ServicesTableActions from "@/features/services/components/table/services-table-actions";

export const metadata = { title: "Services" };

export default async function ServicesPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle="Services"
      pageDescription="Manage services (Create, Update, Delete)."
      scrollable={false}
      pageHeaderAction={
        <Link
          href="/services/create"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <ServicesTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
      >
        <ServicesListing />
      </Suspense>
    </PageContainer>
  );
}
