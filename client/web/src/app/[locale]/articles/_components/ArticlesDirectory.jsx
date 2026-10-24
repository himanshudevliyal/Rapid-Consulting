"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { Directory } from "@/components/pages/directory";
import { QueryState } from "@/components/common/async-state";
import { useAllArticles } from "@/hooks/use-articles";
import { articleToSummary } from "@/lib/content/adapters";

// Searchable list of articles and guides fed by the API (initialData comes
// from the server render, so it is in the HTML; the hook then keeps it fresh).
export function ArticlesDirectory({ initialData }) {
  const t = useTranslations("state");
  const query = useAllArticles({}, { initialData });

  const items = useMemo(() => query.items.map(articleToSummary), [query.items]);
  const list = { ...query, items, isEmpty: !query.isPending && !query.isError && items.length === 0 };

  return (
    <>
      <QueryState query={list} emptyTitle={t("noArticlesTitle")} emptyText={t("noArticlesText")}>
        <Directory items={items} kind="articles" copyById={{}} industry="" />
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
