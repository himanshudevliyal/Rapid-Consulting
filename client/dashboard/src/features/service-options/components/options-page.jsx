import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import OptionsListing from "./options-listing";
import OptionsTableActions from "./options-table-actions";

// Server component shell shared by /services/format and /services/family-topic.
export default function OptionsPage({ kind, title, description, basePath, searchKey }) {
  return (
    <PageContainer
      pageTitle={title}
      pageDescription={description}
      scrollable={false}
      pageHeaderAction={
        <Link href={`${basePath}/create`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          <Plus /> Add
        </Link>
      }
    >
      <OptionsTableActions />
      <Suspense key={searchKey} fallback={<DataTableSkeleton columnCount={6} rowCount={10} />}>
        <OptionsListing kind={kind} />
      </Suspense>
    </PageContainer>
  );
}
