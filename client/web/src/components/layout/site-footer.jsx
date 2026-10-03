import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { getTranslations } from "next-intl/server";
import { hasTranslation } from "@/i18n/has-translation";
import { EMAIL, PHONE_HREF, PHONE_LABEL, mainSiteHref, servicesHref } from "@/lib/site";
import { WhatsAppButton } from "@/components/contact/whatsapp";

/* "!" = important, taaki global h2 / a styles footer ko override na kar sakein */
const headingClass =
  "!m-0 !mb-7 !text-xl !font-semibold !leading-snug !tracking-normal !text-white";

const linkClass =
  "group inline-flex items-center gap-1.5 !text-[15px] !leading-snug !text-white/60 !no-underline " +
  "transition-all duration-200 hover:!text-white hover:translate-x-1 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eaff6b] rounded-sm";

const contactRow =
  "group flex items-start gap-3 !text-[15px] !leading-snug !text-white/70 !no-underline transition-colors hover:!text-white " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eaff6b] rounded-sm";

const iconWrap =
  "mt-[-2px] flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#eaff6b] transition-colors group-hover:bg-[#eaff6b] group-hover:text-[#09263e]";

export async function SiteFooter({ locale }) {
  const t = await getTranslations({ locale });
  const has = hasTranslation(t);

  const page = (code) => {
    const translated = has(`pages.${code}`);
    return {
      code,
      title: `${t(`pages.${code}`)}${translated ? "" : t("common.englishSuffix")}`,
      href: mainSiteHref(code, locale, translated),
    };
  };

  const columns = [
    {
      heading: t("footer.explore"),
      links: [
        page("I00"),
        { code: "S00", title: t("card.types.service-index"), href: servicesHref(locale), local: true },
        page("W00"),
        page("R01"),
        page("R02"),
      ],
    },
    {
      heading: t("footer.company"),
      links: ["A01", "A02", "A03", "U01", "U02", "C01", "P02"].map(page),
    },
  ];

  return (
    <footer className="site-footer relative isolate overflow-hidden bg-[#141414] text-white">
      {/* soft lime glow, top-right */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 -z-10 size-96 rounded-full bg-[#eaff6b]/[0.06] blur-3xl"
      />

      <div className="mx-auto w-full max-w-[1320px] px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.25fr] lg:gap-10">
          {/* ───── Brand ───── */}
          <div className="footer-brand sm:col-span-2 lg:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.png"
              width="170"
              height="50"
              alt="Rapid Consulting"
              className="h-auto w-[170px] brightness-0 invert"
            />
            <p className="!mb-0 !mt-6 max-w-sm !text-[16px] !leading-relaxed !text-white/70">
              {t("footer.tagline")}
            </p>
            <div className="mt-7">
              <WhatsAppButton />
            </div>
          </div>

          {/* ───── Link columns ───── */}
          {columns.map((column) => (
            <nav className="footer-links" key={column.heading} aria-label={column.heading}>
              <h2 className={headingClass}>{column.heading}</h2>
              <ul className="m-0 list-none space-y-3.5 p-0">
                {column.links.map((link) => (
                  <li key={link.code}>
                    {link.local ? (
                      <Link className={linkClass} href={link.href}>
                        {link.title}
                      </Link>
                    ) : (
                      <a className={linkClass} href={link.href}>
                        {link.title}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* ───── Contact ───── */}
          <div className="footer-contact">
            <h2 className={headingClass}>{t("footer.letsTalk")}</h2>
            <ul className="m-0 list-none space-y-4 p-0">
              <li className="flex items-start gap-3 !text-[15px] !leading-snug !text-white/70">
                <span className={iconWrap.replace("group-hover:bg-[#eaff6b] group-hover:text-[#09263e]", "")}>
                  <MapPin className="size-4" aria-hidden="true" />
                </span>
                <span className="pt-1">Hisar, Haryana</span>
              </li>
              <li>
                <a className={contactRow} href={PHONE_HREF}>
                  <span className={iconWrap}>
                    <Phone className="size-4" aria-hidden="true" />
                  </span>
                  <span className="pt-1">{PHONE_LABEL}</span>
                </a>
              </li>
              <li>
                <a className={`${contactRow} break-all`} href={`mailto:${EMAIL}`}>
                  <span className={iconWrap}>
                    <Mail className="size-4" aria-hidden="true" />
                  </span>
                  <span className="pt-1">{EMAIL}</span>
                </a>
              </li>
            </ul>
            <p className="!mb-0 !mt-6 max-w-[30ch] border-l-2 border-[#eaff6b]/50 pl-4 !text-[14px] !leading-relaxed !text-white/55">
              {t("footer.contactText")}
            </p>
          </div>
        </div>

        {/* ───── Bottom bar ───── */}
        <div className="footer-bottom mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 !text-[14px] !text-white/60 md:flex-row md:items-center md:justify-between">
          <span>{t("footer.copyright")}</span>
          <span className="inline-flex items-center gap-1.5">
            {t("footer.prototypeNote")}
            <ArrowUpRight className="size-3.5 text-[#eaff6b]" aria-hidden="true" />
          </span>
        </div>
      </div>
    </footer>
  );
}