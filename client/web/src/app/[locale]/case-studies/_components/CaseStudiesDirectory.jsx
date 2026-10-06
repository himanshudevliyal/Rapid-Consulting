"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { QueryState } from "@/components/common/async-state";
import { useAllCaseStudies } from "@/hooks/use-case-studies";
import { caseStudyToSummary, mergeBySlug } from "@/lib/content/adapters";
import { Directory } from "./directory";

// Searchable case-study list fed by the API (see ArticlesDirectory).
export function CaseStudiesDirectory({ initialData, staticItems = [], copyById = {} }) {
  const t = useTranslations("state");
  const query = useAllCaseStudies({}, { initialData });

  const items = useMemo(
    () => mergeBySlug(query.items.map(caseStudyToSummary), staticItems),
    [query.items, staticItems],
  );
  const list = { ...query, items, isEmpty: !query.isPending && !query.isError && items.length === 0 };

  return (
    <>
      <QueryState query={list} emptyTitle={t("noCasesTitle")} emptyText={t("noCasesText")}>
        <Directory items={items} kind="cases" copyById={copyById} industry="" />
      </QueryState>
      {query.isError && items.length > 0 && (
        <p className="directory-note text-center" role="status">
          {t("partial")}{" "}
          <button type="button" className="underline" onClick={() => query.refetch()} disabled={query.isFetching}>
            {t("retry")}
          </button>
        </p>
      )}
    </>
  );
}
