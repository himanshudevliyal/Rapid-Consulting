"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { useLocale, useTranslations } from "next-intl";
import { matchesSearch } from "@/lib/search";
import { serviceHref } from "@/lib/site";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function SearchDialog({ open, onOpenChange, services }) {
  const locale = useLocale();
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const input = useRef(null);
  const results = services.filter((service) => matchesSearch(service, query));

  const clear = () => {
    setQuery("");
    input.current?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        bare
        className="rapid-search-dialog"
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          input.current?.focus();
        }}
      >
        <div className="rapid-search-inner">
          <div className="search-title-row">
            <DialogTitle asChild>
              <h2>{t("search.dialogTitle")}</h2>
            </DialogTitle>
            <DialogClose aria-label={t("search.close")}>×</DialogClose>
          </div>
          <label htmlFor="rapid-search">{t("search.label")}</label>
          <div className="search-input-row">
            <Input
              ref={input}
              id="rapid-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search.placeholder")}
              type="search"
              autoComplete="off"
            />
            {query && (
              <button type="button" onClick={clear}>
                {t("search.clear")}
              </button>
            )}
          </div>
          <p className="search-count" aria-live="polite">
            {query ? t("search.results", { count: results.length }) : t("search.browse")}
          </p>
          <div className="rapid-search-results">
            {results.length ? (
              results.map((service) => (
                <Link key={service.code} href={serviceHref(service, locale)} onClick={() => onOpenChange(false)}>
                  <small>
                    {t(`card.types.${service.type}`)}
                    {service.family_code ? ` · ${t(`families.${service.family_code}`)}` : ""}
                  </small>
                  <strong>
                    {service.h1 || service.title}
                    {!service.has_locale ? t("common.englishSuffix") : ""}
                  </strong>
                  <span>{service.short_description}</span>
                </Link>
              ))
            ) : (
              <div className="search-empty">
                <h3>{t("search.emptyTitle")}</h3>
                <p>{t("search.emptyText")}</p>
                <button type="button" onClick={clear}>
                  {t("search.clearSearch")}
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
