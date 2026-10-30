import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getPage } from "@/lib/pages/content";
import { pageRoutes } from "@/lib/page-routes";
import { absoluteUrl } from "@/lib/site";
import { JsonLd } from "./json-ld";

// Parent page of each page type (content identity).
const PARENTS = {
  service: "S00",
  "service-family": "S00",
  "additional-service": "S00",
  industry: "I00",
  article: "R01",
  guide: "R01",
  scheme: "R02",
  "case-study": "W00",
  job: "U02",
  person: "A03",
};

// Pages that sit under another top-level area first. Schemes belong to
// Subsidies & Incentives (the S01 service): Subsidies & Incentives > Schemes >
// <scheme>. Their URLs do not change.
const GRANDPARENTS = { scheme: "S01" };

const translate = (t, key, fallback) => {
  try {
    return t?.has?.(key) ? t(key) : fallback;
  } catch {
    return fallback;
  }
};

const parentLabel = (page, parent, t) =>
  page.locale === "hi" && parent.locale === "en" ? `${parent.title} ${t("common.englishSuffix")}` : parent.title;

function pageTrail(page, t) {
  const trail = [{ label: t("common.home"), href: `/${page.locale}` }];

  const grandparentId = GRANDPARENTS[page.type];
  if (grandparentId && pageRoutes[grandparentId]) {
    trail.push({
      label: translate(t, "breadcrumb.subsidies", "Subsidies & Incentives"),
      href: `/${page.locale}${pageRoutes[grandparentId]}`,
    });
  }

  const parentId = PARENTS[page.type];
  const parent = parentId ? getPage(parentId, page.locale) || getPage(parentId, "en") : undefined;
  if (parent) {
    trail.push({
      label: page.type === "scheme" ? translate(t, "breadcrumb.schemes", parent.title) : parentLabel(page, parent, t),
      href: parent.href,
    });
  }

  trail.push({ label: page.title, href: page.href });
  return trail;
}

const toAbsolute = (href) => (/^https?:\/\//.test(href) ? href : absoluteUrl(href));

// BreadcrumbList for the trail. The last item is the current page.
function breadcrumbJsonLd(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: toAbsolute(item.href) } : {}),
    })),
  };
}

// Plain breadcrumb trail (no banner picture). Give it a `page` to build the
// trail from the page type, or explicit `items` ([{ label, href? }], the last
// one being the current page). `heading` / `paragraph` are still accepted for
// index pages that open with the page title: they render under the trail on
// the same plain background.
export function Breadcrumbs({
  page,
  t,
  items,
  label = "Breadcrumb",
  heading,
  paragraph,
  className = "",
  jsonLd = true,
  containerClassName = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
}) {
  const trail = page ? pageTrail(page, t) : items || [];
  const breadcrumbLabel = t ? t("breadcrumb.label") : label;
  const hasHeading = Boolean(heading);

  return (
    <div className={`breadcrumbs border-b border-slate-200 bg-white ${hasHeading ? "py-6 md:py-8" : "py-3"} ${className}`}>
      {jsonLd && trail.length > 1 && <JsonLd data={breadcrumbJsonLd(trail)} />}
      <div className={containerClassName}>
        <nav aria-label={breadcrumbLabel}>
          <ol className="m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0 text-sm text-slate-600">
            {trail.map((item, index) => {
              const last = index === trail.length - 1;
              const external = item.href?.startsWith("http");
              return (
                <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                  {index > 0 && <ChevronRight className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />}
                  {last || !item.href ? (
                    <span
                      aria-current={last ? "page" : undefined}
                      className={last ? "truncate font-semibold text-[#09263e]" : ""}
                    >
                      {item.label}
                    </span>
                  ) : external ? (
                    <a href={item.href} className="text-slate-600 underline-offset-4 hover:text-[#09263e] hover:underline">
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className="text-slate-600 underline-offset-4 hover:text-[#09263e] hover:underline">
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {hasHeading && (
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#09263e] md:text-4xl">{heading}</h1>
        )}
        {paragraph && <div className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">{paragraph}</div>}
      </div>
    </div>
  );
}
