import PageContainer from "@/components/layout/page-container";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import UserTableActions from "@/features/users/components/table/user-table-actions";
import UsersListing from "@/features/users/components/users-listing";

export const metadata = {
  title: "Users",
};

export default async function Users({ searchParams }) {
  const sParams = await searchParams;

  searchParamsCache.parse(sParams);
  const key = serialize({ ...sParams });

  return (
    <PageContainer
      pageTitle={"Users"}
      pageDescription={"Manage users (Create, Update, Delete)."}
      scrollable={false}
      pageHeaderAction={
        <Link
          href="/users/create"
          className={buttonVariants({ size: "sm", variant: "secondary" })}
        >
          <Plus /> Add User
        </Link>
      }
    >
      <UserTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
      >
        <UsersListing />
      </Suspense>
    </PageContainer>
  );
}
