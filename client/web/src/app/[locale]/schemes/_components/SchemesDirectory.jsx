"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { Directory } from "@/components/pages/directory";
import { QueryState } from "@/components/common/async-state";
import { useAllSchemes } from "@/hooks/use-schemes";
import { useAllIndustries } from "@/hooks/use-industries";
import { industryToSummary, schemeToSummary } from "@/lib/content/adapters";

// Searchable list of every published scheme, fed by the API. The industry
// filter uses the schemes chosen for each industry in the admin panel.
export function SchemesDirectory({ initialData, initialIndustries }) {
  const t = useTranslations("state");
  const query = useAllSchemes({}, { initialData });
  const industryQuery = useAllIndustries({ initialData: initialIndustries });

  const items = useMemo(() => query.items.map(schemeToSummary), [query.items]);
  const industries = useMemo(() => industryQuery.items.map(industryToSummary), [industryQuery.items]);

  return (
    <>
      <QueryState query={query} emptyTitle={t("noSchemesTitle")} emptyText={t("noSchemesText")}>
        <Directory items={items} kind="schemes" copyById={{}} industry="" industries={industries} />
      </QueryState>
    </>
  );
}
