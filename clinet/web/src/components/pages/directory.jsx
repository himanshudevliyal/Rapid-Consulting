"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import { hasTranslation } from "@/i18n/has-translation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentCard } from "./content-card";
import { filterDirectory, schemeTopic } from "@/lib/pages/discovery";
import {
  industryItems,
  industryOptions,
  normalizeIndustry,
} from "@/lib/pages/industry-catalogue";
import Section from "../layout/section";
import { CaseCard } from "../case-card";

const PAGE_SIZE = 12;

// Searchable archive for schemes, guides & articles, case studies and industries.
export function Directory({ items, kind, copyById = {}, industry = "" }) {
  const locale = useLocale();
  const t = useTranslations();
  const has = hasTranslation(t);
  const id = useId();
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("");
  const [family, setFamily] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const supportsIndustry = kind === "services" || kind === "schemes";
  const [selectedIndustry, setIndustry] = useState(
    supportsIndustry ? normalizeIndustry(industry) : "",
  );
  const input = useRef(null);
  const section = useRef(null);
  const focusIndex = useRef(null);

  // Back/forward restores the industry filter kept in the URL.
  useEffect(() => {
    if (!supportsIndustry) return;
    const restore = () => {
      const values = new URLSearchParams(window.location.search).getAll(
        "industry",
      );
      setIndustry(normalizeIndustry(values.length === 1 ? values[0] : ""));
      setLimit(PAGE_SIZE);
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [supportsIndustry]);

  useEffect(() => {
    if (focusIndex.current !== null) {
      section.current
        ?.querySelectorAll(".content-card-title a")
        [focusIndex.current]?.focus();
      focusIndex.current = null;
    }
  }, [limit]);

  function changeIndustry(value) {
    const next = normalizeIndustry(value);
    setIndustry(next);
    setLimit(PAGE_SIZE);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("industry", next);
    else url.searchParams.delete("industry");
    window.history.pushState(null, "", url.pathname + url.search + url.hash);
  }

  const filtered = useMemo(() => {
    const pool = supportsIndustry
      ? industryItems(items, selectedIndustry, kind)
      : items;
    return filterDirectory(
      pool,
      query,
      format,
      kind === "schemes" ? "" : family,
    ).filter(
      (item) => kind !== "schemes" || !family || schemeTopic(item) === family,
    );
  }, [items, query, format, family, kind, selectedIndustry, supportsIndustry]);

  const typeLabel = (type) =>
    has(`site.types.${type}`)
      ? t(`site.types.${type}`)
      : type.replaceAll("-", " ");
  const groupLabel = (value, group) =>
    has(`families.${value}`) ? t(`families.${value}`) : group || value;
  const formats = Array.from(new Set(items.map((p) => p.type)));
  const groups =
    kind === "schemes"
      ? Array.from(new Set(items.map(schemeTopic)))
          .sort()
          .map((topic) => [topic, t(`site.topics.${topic}`)])
      : Array.from(
          new Map(
            items
              .filter((p) => p.family || p.group)
              .map((p) => [
                p.family || p.group,
                groupLabel(p.family || p.group, p.group),
              ]),
          ).entries(),
        );

  function reset() {
    setQuery("");
    setFormat("");
    setFamily("");
    if (supportsIndustry) changeIndustry("");
    setLimit(PAGE_SIZE);
    input.current?.focus();
  }

  const noun = t(`site.directory.${kind}`);
  const filtering = query || format || family || selectedIndustry;

  return (
    <Section
      ref={section}
      className={`bg-gray-100 rapid-directory directory-${kind}`}
      aria-label={t("site.directory.browse", { noun })}
    >
      {supportsIndustry && selectedIndustry && (
        <p className="directory-industry-context">
          {t("site.directory.for")}{" "}
          <strong>
            {
              industryOptions(locale).find((r) => r.id === selectedIndustry)
                ?.label
            }
          </strong>
        </p>
      )}
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
        {supportsIndustry && (
          <div>
            <Label htmlFor={`${id}-industry`}>
              {t("site.directory.industry")}
            </Label>
            <select
              id={`${id}-industry`}
              value={selectedIndustry}
              onChange={(event) => changeIndustry(event.target.value)}
            >
              <option value="">{t("site.directory.allIndustries")}</option>
              {industryOptions(locale).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {formats.length > 1 && (
          <div>
            <Label htmlFor={`${id}-format`}>{t("directory.format")}</Label>
            <select
              id={`${id}-format`}
              value={format}
              onChange={(event) => {
                setFormat(event.target.value);
                setLimit(PAGE_SIZE);
              }}
            >
              <option value="">{t("directory.allFormats")}</option>
              {formats.map((type) => (
                <option key={type} value={type}>
                  {typeLabel(type)}
                </option>
              ))}
            </select>
          </div>
        )}
        {groups.length > 1 && (
          <div>
            <Label htmlFor={`${id}-family`}>
              {kind === "schemes"
                ? t("site.directory.topic")
                : t("site.directory.familyTopic")}
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
      {kind === "schemes" && (
        <p className="directory-note">{t("site.directory.schemeNote")}</p>
      )}
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
          {filtered.slice(0, limit).map((item) => (
      

          

  <ContentCard
              key={item.id}
              page={item}
              locale={locale}
              t={t}
              has={has}
              copy={copyById[item.id]}
              
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
