"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { QueryState } from "@/components/common/async-state";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { useAllIndustries } from "@/hooks/use-industries";
import { industryToSummary } from "@/lib/content/adapters";
import { useTx } from "@/lib/use-tx";

// Every active industry from the API, each with its image. Add an industry in
// the admin panel and it appears here (and in the menu and on the home page).
export function IndustriesDirectory({ initialData }) {
  const t = useTranslations();
  const tx = useTx();
  const query = useAllIndustries({ initialData });
  const items = useMemo(() => query.items.map(industryToSummary), [query.items]);

  return (
    <QueryState
      query={query}
      skeletonCount={4}
      emptyTitle={t("state.noIndustriesTitle")}
      emptyText={t("state.noIndustriesText")}
    >
      {/* A full-width band: no .rapid-directory margin (it left white strips above and below). */}
      <section
        id="all-industries"
        className="b2b-sec b2b-sec--band rapid-directory directory-industries my-0! scroll-mt-28"
        aria-labelledby="all-industries-title"
      >
        <div className="b2b-wrap">
          <p className="b2b-eyebrow">{tx("b2b.industries.eyebrow2", "All industries")}</p>
          <h2 id="all-industries-title" className="b2b-h2">
            {tx("b2b.industries.title", "Choose the industry closest to your project.")}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              return (
                <article
                  key={item.id}
                  data-component="IndustryCard"
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-25px_rgba(9,38,62,0.45)]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-200">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                      />
                    ) : (
                      <ImagePlaceholder className="absolute inset-0" label={t("detail.industry.photoPlaceholder")} />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className="b2b-eyebrow">{tx("b2b.industries.cardLabel", "Industry")}</p>
                    <h3 className="!m-0 !text-xl !font-semibold !leading-snug !tracking-tight !text-[#09263e]">
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
                        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[#eaff6b] px-5 text-sm font-semibold !text-[#09263e] !no-underline transition-colors hover:bg-[#dcf24f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
                      >
                        {tx("b2b.industries.explore", "Explore industry")}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </QueryState>
  );
}
