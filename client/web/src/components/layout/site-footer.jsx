import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { getTranslations } from "next-intl/server";
import { hasTranslation } from "@/i18n/has-translation";
import { EMAIL, PHONE_HREF, PHONE_LABEL } from "@/lib/site";
import { defaultLocale } from "@/i18n/routing";
import { defaultNavigation, footerHeading, isExternalHref, localizeHref, navigationLabel } from "@/lib/site-navigation";
import { WhatsAppButton } from "@/components/contact/whatsapp";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { SOCIAL_LINKS } from "./social-links";
import { SocialIcon } from "./social-icons";
import { CRM_LOGIN_URL } from "./crm-login";

/* "!" = important, so that the global h2 / a styles do not override the footer */
const headingClass = "!m-0 !mb-4 !text-[11.5px] !font-bold !uppercase !leading-snug !tracking-[0.1em] !text-[#eaff6b]";

const linkClass =
  "group inline-flex items-center gap-1.5 !text-[14px] !leading-snug !text-white/70 !no-underline " +
  "transition-all duration-200 hover:!text-white hover:translate-x-0.5 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eaff6b] rounded-sm";

const disabledClass = "wb-footer-disabled inline-flex items-center gap-1.5 !text-[14px] !leading-snug !text-white/40 rounded-sm";

const contactRow =
  "inline-flex items-center gap-2 !text-[14px] !leading-snug !text-white/70 !no-underline transition-colors hover:!text-white " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eaff6b] rounded-sm";

// Footer: a navy panel with the closing call to action (brand line, "Let's get
// your project moving.", WhatsApp and social icons), then the link columns
// (four per row), the contact line and the legal row. The columns come from
// the central navigation setting (admin panel); `navigation` = { primary,
// footer } as merged by loadNavigation. Without a saved setting the built-in
// default (eight columns, see lib/site-navigation.js) is used.
export async function SiteFooter({ locale, navigation }) {
  const t = await getTranslations({ locale });
  const has = hasTranslation(t);
  const tx = (key, fallback) => (t.has(key) ? t(key) : fallback);

  const resolveLink = (link) => {
    if (link.visible === false) return null;
    let title = navigationLabel(link, locale, tx);
    let href = localizeHref(link.href, locale);
    // A page without this language opens in English and says so.
    if (locale !== defaultLocale && link.labelKey?.startsWith("pages.") && !has(link.labelKey)) {
      title += t("common.englishSuffix");
      href = localizeHref(link.href, defaultLocale);
    }
    return { id: link.id, title, href, external: isExternalHref(href), disabled: link.disabled === true, action: link.action };
  };

  const columns = (navigation?.footer ?? defaultNavigation().footer)
    .map((column) => ({
      id: column.id,
      heading: footerHeading(column, locale, tx),
      links: column.links.map(resolveLink).filter(Boolean),
    }))
    .filter((column) => column.links.length);

  const renderLink = (link) => {
    // A page that is not built yet: plain text, not a link, not focusable.
    if (link.disabled) {
      return (
        <a role="link" aria-disabled="true" className={disabledClass}>
          {link.title}
          <span className="sr-only"> ({tx("hdr.unavailable", "not available yet")})</span>
        </a>
      );
    }
    if (link.action === "enquiry") {
      return (
        <EnquiryTrigger source="footer-subsidy-check" className={`${linkClass} text-left`}>
          {link.title}
        </EnquiryTrigger>
      );
    }
    return link.external ? (
      <a className={linkClass} href={link.href}>
        {link.title}
      </a>
    ) : (
      <Link className={linkClass} href={link.href}>
        {link.title}
      </Link>
    );
  };

  const address = tx("b2e.contact.visit.street", "Plot No 134, 1st Floor, Old Court Road, Near Payasam Restaurant");

  return (
    <footer className="site-footer relative isolate overflow-hidden bg-[#09263e] text-white">
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        {/* ───── Closing call to action ───── */}
        <div className="flex flex-col gap-6 rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-10">
          <div className="min-w-0">
            <h2 className="!m-0 !text-[26px] !font-semibold !leading-tight !tracking-normal !text-white sm:!text-[32px]">
              {tx("hdr.footer.ctaTitle", "Let’s get your project moving.")}
            </h2>
            <p className="!mb-0 !mt-2.5 max-w-[52ch] !text-[16px] !leading-relaxed !text-white/75">
              {tx("hdr.footer.ctaText", "Tell us your situation. The first check is on us.")}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <WhatsAppButton />
          </div>
        </div>

        {/* ───── Brand + link columns ───── */}
        <div className="mt-12 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
          <div className="flex flex-col items-start gap-5">
            {/* The original 500x142 logo on a white tile; the aspect ratio is kept by next/image. */}
            <span className="wb-footer-logo-tile">
              <Image src="/assets/logo.png" width={500} height={142} sizes="150px" alt="Rapid Consulting" className="h-auto w-[150px]" />
            </span>
            <p className="!m-0 max-w-[30ch] !text-[15px] !leading-relaxed !text-white/80">
              {tx("hdr.footer.tagline", "Approvals and subsidies. One team, start to finish.")}
            </p>

            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              <li className="flex items-start gap-2.5 !text-[14px] !leading-snug !text-white/75">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#eaff6b]" aria-hidden="true" />
                <span>
                  {address}
                  <br />
                  Hisar, Haryana 125001
                </span>
              </li>
              <li>
                <a className={contactRow} href={PHONE_HREF}>
                  <Phone className="size-4 shrink-0 text-[#eaff6b]" aria-hidden="true" />
                  <span>{PHONE_LABEL}</span>
                </a>
              </li>
              <li>
                <a className={`${contactRow} break-all`} href={`mailto:${EMAIL}`}>
                  <Mail className="size-4 shrink-0 text-[#eaff6b]" aria-hidden="true" />
                  <span>{EMAIL}</span>
                </a>
              </li>
            </ul>

            {SOCIAL_LINKS.length > 0 && (
              <ul className="m-0 flex list-none gap-2.5 p-0" aria-label={tx("hdr.footer.social", "Rapid on social media")}>
                {SOCIAL_LINKS.map((item) => (
                  <li key={item.id}>
                    <a className="wb-footer-social" href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
                      <SocialIcon id={item.id} />
                      <span className="sr-only"> ({tx("hdr.newTab", "opens in a new tab")})</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {/* Staff / client sign-in to the CRM (opens in a new tab); hidden when NEXT_PUBLIC_CRM_LOGIN_URL is unset. */}
            {CRM_LOGIN_URL && (
              <a
                href={CRM_LOGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold !text-[#09263e] no-underline transition-colors hover:bg-[#eef3f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eaff6b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09263e]"
              >
                {tx("hdr.crmLogin", "CRM Login")}
                <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only"> ({tx("hdr.newTab", "opens in a new tab")})</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-9 min-[480px]:grid-cols-2 xl:grid-cols-4">
            {columns.map((column) => (
              <nav className="footer-links min-w-0" key={column.id} aria-label={column.heading}>
                <h2 className={headingClass}>{column.heading}</h2>
                <ul className="m-0 list-none space-y-2.5 p-0">
                  {column.links.map((link) => (
                    <li key={link.id}>{renderLink(link)}</li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* ───── Legal row ───── */}
        <div className="footer-bottom mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 !text-[14px] !text-white/60 md:flex-row md:items-center md:justify-between">
          <span className="inline-flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>{t("footer.copyright")}</span>
            <Link
              className="rounded-sm !text-white/60 underline-offset-4 hover:!text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eaff6b]"
              href={localizeHref("/privacy-notice", locale)}
            >
              {tx("pages.P02", "Privacy notice")}
            </Link>
          </span>
          <span className="inline-flex items-center gap-1.5">
            {t("footer.prototypeNote")}
            <ArrowUpRight className="size-3.5 text-[#eaff6b]" aria-hidden="true" />
          </span>
        </div>
      </div>
    </footer>
  );
}
