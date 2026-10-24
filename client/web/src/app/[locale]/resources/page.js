import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ClientTicker } from "@/components/common/client-ticker";
import { ContactExperience } from "@/components/form/contact-experience";
import Heading from "@/components/layout/heading";
import Section from "@/components/layout/section";
import { Html } from "@/components/pages/content-primitives";
import { ResourceBlocks } from "@/components/pages/resource-blocks";
import { linksApiContent } from "@/lib/pages/card-copy";
import { resolveContentPath } from "@/lib/pages/resolve";

const PATH = "/resources";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") return { robots };
  const t = await getTranslations({ locale });
  return contentPageMetadata(found.page, locale, t("meta.siteName"), PATH);
}

// Resources: the latest guides and the scheme information, both from the API.
// Only the page heading and the closing guidance are written in the website.
export default async function ResourcesRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const { page } = found;
  const guidance = page.sections.filter((section) => !linksApiContent(section.html));

  return (
    <>
      <PageAlternates en={`/en${PATH}`} hi={page.hasHindi ? `/hi${PATH}` : null} />
      <Breadcrumbs
        heading={page.h1}
        items={[
          { label: t("common.home"), href: `/${locale}` },
          { label: page.title, href: `/${locale}${PATH}` },
        ]}
        backgroundImage="/assets/articles.jpg"
      />
      <main id="main">
        <div className="container collection-page">
          <Section>
            <Heading
              eyebrow={t("site.collection.findNextStep")}
              heading={page.h1}
              className="text-left"
              subheading={page.introHtml}
              eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
              headingClassName="text-[2.6rem] leading-[1.1] font-bold tracking-tight text-[#111] mt-0 text-wrap-balance lg:text-[3rem]"
            />
          </Section>

          <Section>
            <ResourceBlocks locale={locale} t={t} guideLimit={6} schemeLimit={6} />
          </Section>

          {guidance.length > 0 && (
            <Section className="collection-guidance">
              {guidance.map((s) => (
                <details key={s.id} id={s.id} className="mb-4 bg-gray-50 shadow-md">
                  <summary>
                    {s.title}
                    <span>+</span>
                  </summary>
                  <Html html={s.html} />
                </details>
              ))}
            </Section>
          )}

          <ClientTicker />
          <ContactExperience pageTitle={page.h1} pageId={page.id} variant="section" />
        </div>
      </main>
    </>
  );
}
