import { searchParamsCache, serialize } from "@/lib/searchparams";
import OptionsPage from "@/features/service-options/components/options-page";

export const metadata = { title: "Service formats" };

export default async function ServiceFormatsPage({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });
  return (
    <OptionsPage
      kind="format"
      title="Formats"
      description="Kinds of service page (Create, Update, Delete). A service picks one Format."
      basePath="/services/format"
      searchKey={key}
    />
  );
}
