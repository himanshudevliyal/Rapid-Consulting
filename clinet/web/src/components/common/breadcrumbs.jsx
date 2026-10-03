import Link from "next/link";
import { getPage } from "@/lib/pages/content";

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

export function Breadcrumbs({
  page,
  t,
  items,
  label = "Breadcrumb",
  heading,
  paragraph,
  backgroundImage = "/assets/hero-section.jpg",
  className = "",
  overlayClassName = "bg-black/40",
  containerClassName = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
  navClassName = "flex flex-wrap items-center gap-2 text-sm font-medium text-white md:text-base",
  headingClassName = "mt-4 text-3xl font-bold text-white md:text-4xl text-white!",
  paragraphClassName = "mt-3 max-w-2xl text-sm text-white/80 md:text-base",
}) {
  const generatedItems = page
    ? (() => {
        const parentId = PARENTS[page.type];

        const parent = parentId
          ? getPage(parentId, page.locale) || getPage(parentId, "en")
          : undefined;

        const breadcrumbItems = [
          {
            label: t("common.home"),
            href: `/${page.locale}`,
          },
        ];

        if (parent) {
          breadcrumbItems.push({
            label:
              page.locale === "hi" && parent.locale === "en"
                ? `${parent.title} ${t("common.englishSuffix")}`
                : parent.title,
            href: parent.href,
          });
        }

        breadcrumbItems.push({
          label: page.title,
          href: page.href,
        });

        return breadcrumbItems;
      })()
    : items || [];

  const breadcrumbLabel = t ? t("breadcrumb.label") : label;

  return (
    <section
      className={`relative bg-cover bg-center bg-no-repeat py-10 md:py-14 ${className}`}
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className={`absolute inset-0 ${overlayClassName}`} />

      <div className={`relative ${containerClassName}`}>
        <nav className={navClassName} aria-label={breadcrumbLabel}>
          {generatedItems.map((item, index) => {
            const last = index === generatedItems.length - 1;
            const external = item.href?.startsWith("http");

            return (
              <span
                key={`${item.label}-${index}`}
                className="flex items-center gap-2"
              >
                {index > 0 && <span className="text-white/60">/</span>}

                {last ? (
                  <span aria-current="page" className="text-white">
                    {item.label}
                  </span>
                ) : external ? (
                  <a
                    href={item.href}
                    className="text-white/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="text-white/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>

        {heading && <h1 className={headingClassName}>{heading|| page.title}</h1>}

        {paragraph && <div className={paragraphClassName}>{paragraph}</div>}
      </div>
    </section>
  );
}
