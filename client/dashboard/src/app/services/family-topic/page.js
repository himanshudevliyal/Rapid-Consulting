import { searchParamsCache, serialize } from "@/lib/searchparams";
import OptionsPage from "@/features/service-options/components/options-page";

export const metadata = { title: "Service family / topics" };

export default async function ServiceFamilyTopicsPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });
  return (
    <OptionsPage
      kind="family-topic"
      title="Family / topics"
      description="Groups of services (Create, Update, Delete). A service picks one Family / topic."
      basePath="/services/family-topic"
      searchKey={key}
    />
  );
}
