"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Html } from "@/components/pages/content-primitives";
import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** @typedef {{ id: string, title: string, icon: string, href: string }} FamilySummary */
/** @typedef {{ id: string, title: string, href: string, locale: string }} ChildSummary */
/** @typedef {{ id: string, family: FamilySummary, children: ChildSummary[], descHtml: string, image: string }} FamilyData */

export function ServicesTabUI({
  sectionId,
  sectionTitle,
  eyebrow,
  locale,
  allServicesLabel,
  readMoreLabel,
  englishSuffix,
  families,
  footerParts,
}) {
  const [activeId, setActiveId] = useState(families[0]?.id ?? null);
  const active = families.find((f) => f.id === activeId) ?? families[0];

  // Collect all children across all families for the grid
  const allChildren = families.flatMap((f) =>
    f.children.map((child) => ({
      ...child,
      familyLocale: f.family ? undefined : child.locale,
    }))
  );

  return (
    <Section id={sectionId} className="bg-[#f3f0eb] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Section heading ── */}
   

          <Heading
                
                  eyebrow={eyebrow}
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
                  heading={sectionTitle}
                  headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl"
                />

        {/* ── White card container ── */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

          {/* ── Top horizontal tab bar ── */}
          <div className="border-b border-slate-100">
            <nav
              aria-label={locale === "hi" ? "सेवा श्रेणियाँ" : "Service categories"}
              className="flex overflow-x-auto"
            >
              {families.map(({ id, family }) => {
                const isActive = id === activeId;
                return (
                  <button
                    key={id}
                   
                    onClick={() => setActiveId(id)}
                    aria-selected={isActive}
                    className={[
                      "relative flex-1 shrink-0 whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1f5d57]",
                      isActive
                        ? "text-[#09263e] after:absolute  bg-primary after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#09263e]"
                        : "text-slate-500 hover:text-[#09263e]",
                    ].join(" ")}
                  >
                    {family.title}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ── Services grid ── */}
          {active && (
            <div className="p-6 sm:p-8 lg:p-10">
              {active.children.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {active.children.map((child) => (
                    <a
                      key={child.id}
                      href={child.href}
                      className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-[#f8f9fa] px-5 py-4 text-[15px] font-medium text-[#09263e] transition-all duration-200 hover:border-[#09263e]/20 hover:bg-white hover:shadow-md"
                    >
                      <span>
                        {child.title}
                        {locale === "hi" && child.locale === "en" ? englishSuffix : ""}
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-slate-400 transition-colors group-hover:text-[#09263e]" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  {locale === "hi" ? "कोई सेवा उपलब्ध नहीं" : "No services listed."}
                </p>
              )}

            </div>
          )}

          {/* ── All Services footer strip ── */}
          <div className="flex items-center justify-between border-t border-slate-100 px-8 py-5 sm:px-10">
            {footerParts.length > 0 && (
              <div className="hidden text-sm text-slate-400 sm:block">
                {footerParts.map((p, i) => (
                  <Html key={i} html={p} className="[&_p]:m-0" />
                ))}
              </div>
            )}
            <Link
              href={`/${locale}/services`}
              className="group ml-auto text-white!! inline-flex items-center gap-3 rounded-full bg-[#09263e] py-2.5 pl-5 pr-2 text-sm font-semibold text-white! transition-colors hover:bg-[#1f5d57]"
            >
              {allServicesLabel}
              <span className="flex size-8 items-center justify-center rounded-full bg-[#eaff6b] text-[#09263e] transition-transform group-hover:translate-x-0.5">
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>

        {/* Footer notes (outside card) */}
        {footerParts.length > 0 && (
          <div className="mt-8 sm:hidden">
            {footerParts.map((p, i) => (
              <Html key={i} html={p} className="text-center text-sm text-slate-500 [&_p]:m-0" />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
