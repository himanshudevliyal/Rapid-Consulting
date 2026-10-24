"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import { hasTranslation } from "@/i18n/has-translation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { filterDirectory } from "@/lib/pages/discovery";

import Section from "@/components/layout/section";
import { CaseCard } from "@/components/case-card";

const PAGE_SIZE = 12;

// Searchable archive of case studies (every record comes from the API).
export function Directory({ items, kind = "cases" }) {
  const t = useTranslations();
  const has = hasTranslation(t);
  const id = useId();
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const input = useRef(null);
  const section = useRef(null);
  const focusIndex = useRef(null);

  useEffect(() => {
    if (focusIndex.current !== null) {
      section.current
        ?.querySelectorAll("[data-case-card]")
        [focusIndex.current]?.focus();
      focusIndex.current = null;
    }
  }, [limit]);

  const filtered = useMemo(
    () => filterDirectory(items, query, "", family),
    [items, query, family],
  );

  const typeLabel = (type) =>
    has(`site.types.${type}`)
      ? t(`site.types.${type}`)
      : type.replaceAll("-", " ");
  // Filter by industry / category: the group each case study is filed under.
  const groups = Array.from(
    new Map(
      items
        .filter((p) => p.family || p.group)
        .map((p) => [p.family || p.group, p.group || p.family]),
    ).entries(),
  );

  function reset() {
    setQuery("");
    setFamily("");
    setLimit(PAGE_SIZE);
    input.current?.focus();
  }

  const noun = t(`site.directory.${kind}`);
  const filtering = query || family;

  return (
    <Section
      ref={section}
      className={`bg-gray-100 rapid-directory directory-${kind}`}
      aria-label={t("site.directory.browse", { noun })}
    >
      <div className="directory-controls  bg-background!">
        <div className="directory-search">
          <Label htmlFor={`${id}-query`}>
            {t("site.directory.searchIn", { noun })}
          </Label>
          <Input
            id={`${id}-query`}
            ref={input}
            type="search"
            placeholder={t("directory.placeholder")}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(PAGE_SIZE);
            }}
          />
        </div>
        {groups.length > 1 && (
          <div>
            <Label htmlFor={`${id}-family`}>
              {t("site.directory.familyTopic")}
            </Label>
            <select
              id={`${id}-family`}
              value={family}
              onChange={(event) => {
                setFamily(event.target.value);
                setLimit(PAGE_SIZE);
              }}
            >
              <option value="">{t("directory.allGroups")}</option>
              {groups.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}
        <button type="button" className="directory-reset" onClick={reset}>
          {t("directory.reset")}
        </button>
      </div>
      <p className="directory-count" role="status">
        {t("site.directory.showing", {
          shown: Math.min(limit, filtered.length),
          total: filtered.length,
          noun,
        })}
        {filtering && (
          <span>{t("directory.total", { count: items.length })}</span>
        )}
      </p>
      {filtered.length ? (
        <div className="directory-grid">
          {filtered.slice(0, limit).map((item, index) => (
            <CaseCard
              key={item.id}
              item={item}
              html={item.description || ""}
              index={index}
              label={
                item.type === "case-study"
                  ? t("site.card.caseStudy")
                  : typeLabel(item.type)
              }
              amountLabel={t("site.card.approximately")}
              cta={
                item.type === "case-study"
                  ? t("site.card.readCase")
                  : t("site.card.explore")
              }
            />
          ))}
        </div>
      ) : (
        <div className="directory-empty">
          <h3>{t("directory.emptyTitle")}</h3>
          <p>{t("directory.emptyText")}</p>
          <button type="button" className="button-secondary" onClick={reset}>
            {t("directory.showAll")}
          </button>
        </div>
      )}
      {filtered.length > limit && (
        <div className="directory-more">
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              focusIndex.current = limit;
              setLimit(limit + PAGE_SIZE);
            }}
          >
            {t("directory.loadMore")}{" "}
            <span>
              {t("directory.remaining", { count: filtered.length - limit })}
            </span>
          </button>
        </div>
      )}
    </Section>
  );
}
