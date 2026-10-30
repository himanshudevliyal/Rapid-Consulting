"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { QueryState } from "@/components/common/async-state";
import { useAllArticles } from "@/hooks/use-articles";
import { articleToSummary } from "@/lib/content/adapters";
import { ResourceExplorer } from "./resource-explorer";

// Every published article and guide from the API (initialData comes from the
// server render, so the list is in the HTML; the hook then keeps it fresh),
// inside the Resources explorer. `defaultFormat`: "all" | "article" | "guide".
export function ResourceCollection({ initialData, defaultFormat = "all" }) {
  const t = useTranslations("state");
  const query = useAllArticles({}, { initialData });

  const items = useMemo(() => query.items.map(articleToSummary), [query.items]);
  const list = { ...query, items, isEmpty: !query.isPending && !query.isError && items.length === 0 };

  return (
    <>
      <QueryState query={list} emptyTitle={t("noArticlesTitle")} emptyText={t("noArticlesText")}>
        <ResourceExplorer items={items} defaultFormat={defaultFormat} />
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
