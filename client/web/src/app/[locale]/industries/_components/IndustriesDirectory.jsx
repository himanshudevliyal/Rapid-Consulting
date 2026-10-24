"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import Section from "@/components/layout/section";
import { QueryState } from "@/components/common/async-state";
import { useAllIndustries } from "@/hooks/use-industries";
import { industryToSummary } from "@/lib/content/adapters";

const FALLBACK_IMAGE = "/assets/hero-section.jpg";

// Every active industry from the API, each with its image. Add an industry in
// the admin panel and it appears here (and in the menu and on the home page).
export function IndustriesDirectory({ initialData }) {
  const t = useTranslations();
  const query = useAllIndustries({ initialData });
  const items = useMemo(() => query.items.map(industryToSummary), [query.items]);

  return (
    <QueryState
      query={query}
      skeletonCount={4}
      emptyTitle={t("state.noIndustriesTitle")}
      emptyText={t("state.noIndustriesText")}
    >
      <Section className="bg-gray-100 rapid-directory directory-industries" aria-label={t("site.directory.browse", { noun: t("site.directory.industries") })}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const src = item.image || FALLBACK_IMAGE;
            return (
              <article
                key={item.id}
                data-component="IndustryCard"
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-25px_rgba(13,59,55,0.45)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="!m-0 !text-xl !font-semibold !leading-snug !tracking-tight !text-[#0d3b37]">
                    <Link href={item.href} className="!text-inherit !no-underline hover:underline">
                      {item.title}
                    </Link>
                  </h3>
                  {item.description && (
                    <p className="!mb-0 !mt-3 line-clamp-4 text-[15px] leading-7 text-slate-600">{item.description}</p>
                  )}
                  <div className="mt-auto pt-6">
                    <Link
                      href={item.href}
                      className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-black/10 px-5 text-sm font-semibold !text-slate-600 !no-underline transition-colors group-hover:border-[#0d3b37] group-hover:bg-[#0d3b37] group-hover:!text-white"
                    >
                      {t("site.card.explore")}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    </QueryState>
  );
}
