import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import CommunityGroupsListing from "@/features/community-groups/components/community-groups-listing";
import CommunityGroupsTableActions from "@/features/community-groups/components/table/community-groups-table-actions";

export const metadata = { title: "Community groups" };

export default async function CommunityGroupsPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer
      pageTitle={"Community groups"}
      pageDescription={"Manage community groups (Create, Update, Delete)."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href={"/community-groups/create"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus /> Add
        </Link>
      }
    >
      <CommunityGroupsTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
      >
        <CommunityGroupsListing />
      </Suspense>
    </PageContainer>
  );
}
