"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { SchemeDirectory } from "@/components/pages/scheme-directory";
import { QueryState } from "@/components/common/async-state";
import { useAllSchemes } from "@/hooks/use-schemes";
import { useAllIndustries } from "@/hooks/use-industries";
import { industryToSummary, schemeToSummary } from "@/lib/content/adapters";

// Searchable list of every published scheme, fed by the API. The industry
// row uses the schemes chosen for each industry in the admin panel; `filters`
// are what the incoming address already selected ({ q, industry, topic }).
export function SchemesDirectory({ initialData, initialIndustries, filters = {}, copy }) {
  const t = useTranslations("state");
  const query = useAllSchemes({}, { initialData });
  const industryQuery = useAllIndustries({ initialData: initialIndustries });

  const items = useMemo(() => query.items.map(schemeToSummary), [query.items]);
  const industries = useMemo(() => industryQuery.items.map(industryToSummary), [industryQuery.items]);

  return (
    <QueryState query={query} emptyTitle={t("noSchemesTitle")} emptyText={t("noSchemesText")}>
      <SchemeDirectory items={items} industries={industries} initial={filters} copy={copy} />
    </QueryState>
  );
}
