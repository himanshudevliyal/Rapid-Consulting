"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight, MapPin, Mail, Menu, Phone, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Marquee } from "@/components/ui/marquee";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasTranslation } from "@/i18n/has-translation";
import { WHATSAPP_LABEL, WHATSAPP_NUMBER, mainSiteHref, serviceHref, servicesHref } from "@/lib/site";
import { WhatsAppButton, WhatsAppMark } from "@/components/contact/whatsapp";
import { LanguageSwitcher, MobileLanguageLink } from "./language-switcher";
import { SearchDialog } from "./search-dialog";

// ✏️ Apni real details yaha daal do
const CONTACT = {
  phone: WHATSAPP_LABEL,
  phoneHref: `tel:+${WHATSAPP_NUMBER}`,
  email: "support@rapidconsulting.in",
  address: "Delhi, India",
};

// Mega menu spacing system — sab Tailwind utilities (8px base).
// `!` important hai taaki purani global CSS ke classes (.nav-group, .nav-page-link etc.) override ho jayein.
const MEGA_SPACING = [
  // headings: same line pe, links se same distance
  "[&_h2]:mb-2.5! [&_h2]:leading-tight! [&_h3]:mb-3.5! [&_h3]:leading-snug!",
  "[&_.nav-overview_p]:mb-4! [&_.nav-overview_p]:leading-relaxed!",
  // layout: columns ek hi top line, consistent gaps
  "[&_.structured-menu]:items-start! [&_.structured-menu]:gap-x-6! [&_.structured-menu]:gap-y-8! lg:[&_.structured-menu]:gap-x-10!",
  "[&_.mega-grid]:items-start! [&_.mega-grid]:gap-x-6! [&_.mega-grid]:gap-y-8! lg:[&_.mega-grid]:gap-x-10!",
  "[&_.nav-groups]:items-start! [&_.nav-groups]:gap-x-6! [&_.nav-groups]:gap-y-8! lg:[&_.nav-groups]:gap-x-10!",
  "[&_.nav-group]:m-0! [&_.nav-group]:min-w-0!",
  // links: uniform rhythm, hover pe layout shift nahi (px + -mx)
  "[&_.nav-page-link]:-mx-2.5! [&_.nav-page-link]:mb-1! [&_.nav-page-link]:rounded-lg! [&_.nav-page-link]:px-2.5! [&_.nav-page-link]:py-1! [&_.nav-page-link]:leading-snug! [&_.nav-page-link]:transition-colors",
  "[&_.nav-page-link:last-child]:mb-0! [&_.nav-page-link:hover]:bg-slate-100!",
  // additional services divider
  "[&_.nav-additional]:mt-6! [&_.nav-additional]:flex! [&_.nav-additional]:flex-wrap! [&_.nav-additional]:items-center! [&_.nav-additional]:gap-x-5! [&_.nav-additional]:gap-y-1! [&_.nav-additional]:border-t! [&_.nav-additional]:border-t-[rgba(15,35,50,0.08)]! [&_.nav-additional]:pt-5!",
  "[&_.nav-additional_.nav-page-link]:mb-0!",
  // tiles / cards
  "[&_.nav-group-label]:mb-3.5! [&_.nav-tile-grid]:gap-4! [&_.nav-tile]:items-start! [&_.nav-tile]:gap-3.5! [&_.nav-tile]:p-4!",
  "[&_.nav-tile>div]:flex! [&_.nav-tile>div]:flex-col! [&_.nav-tile>div]:gap-1!",
].join(" ");

// Everything in the menu comes from the API (see lib/content/site-data.js):
// service categories with their services, industries, case studies, guides
// and schemes. Add or edit them in the admin panel and the menu follows.
export function SiteHeader({ navigation: menu }) {
  const { services = [], categories = [], industries = [], cases = [], guides = [], schemes = [] } = menu ?? {};
  const locale = useLocale();
  const t = useTranslations();
  const has = hasTranslation(t);
  const raw = (key) => (t.has(key) ? t.raw(key) : undefined);

  const [active, setActive] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const header = useRef(null);
  const navigation = useRef(null);

  const page = (code) => {
    const translated = has(`pages.${code}`);
    return {
      code,
      title: `${t(`pages.${code}`)}${translated ? "" : t("common.englishSuffix")}`,
      href: mainSiteHref(code, locale, translated),
    };
  };

  const serviceLink = (service) => ({
    code: service.code,
    title: `${service.title}${service.has_locale ? "" : t("common.englishSuffix")}`,
    href: serviceHref(service, locale),
    local: true,
  });

  const navs = ["services", "industries", "work", "resources", "about"];

  // A recordLink points at a record from the API (English pages).
  const recordLink = (record) => ({ code: record.id, title: record.title, href: record.href, local: true });

  const announcements = [
    { text: t("header.announcements.services"), href: servicesHref(locale), local: true },
    { text: t("header.announcements.schemes"), ...page("R02") },
    { text: t("header.announcements.guides"), ...page("R01") },
    ...guides.slice(0, 2).map((guide) => ({ text: guide.title, href: guide.href, local: true })),
    ...schemes.slice(0, 2).map((scheme) => ({ text: scheme.title, href: scheme.href, local: true })),
  ];

  // Services that belong to no category still get a place in the menu.
  const categorised = new Set(categories.flatMap((group) => [group.family, ...group.services]).filter(Boolean).map((s) => s.code));
  const uncategorised = services.filter((service) => service.type !== "service-family" && service.type !== "service-index" && !categorised.has(service.code));

  useEffect(() => {
    const el = header.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      document.documentElement.style.setProperty("--header-height", `${rect.height}px`);
      document.documentElement.style.setProperty("--header-top", `${Math.max(0, rect.top)}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    const close = (e) => {
      if (!el.contains(e.target)) {
        setActive(null);
        setMobile(false);
      }
    };
    const key = (e) => {
      if (e.key === "Escape") {
        const trigger =
          el.querySelector("[data-nav-trigger][data-active='true']") ||
          el.querySelector('[data-mobile-trigger][aria-expanded="true"]');
        setActive(null);
        setMobile(false);
        trigger?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", measure);
    };
  }, []);

  useEffect(() => {
    const el = navigation.current;
    if (!el) return;
    const measure = () =>
      header.current?.style.setProperty("--mobile-nav-height", `${el.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [mobile]);

  const NavLink = ({ item, detail }) => {
    const content = (
      <>
        <span>{item.title}</span>
        {detail && <small>{detail}</small>}
      </>
    );
    return item.local ? (
      <Link href={item.href} className="nav-page-link" onClick={() => setActive(null)}>
        {content}
      </Link>
    ) : (
      <a href={item.href} className="nav-page-link">
        {content}
      </a>
    );
  };

  const group = (title, items) => (
    <section className="nav-group" key={title}>
      <h3>{title}</h3>
      {items.filter(Boolean).map((item) => (
        <NavLink key={item.code} item={item} />
      ))}
    </section>
  );

  function menuContent() {
    if (active === "services") {
      return (
        <>
          <div className="mega-grid services-grid">
            {categories.map((group) => (
              <section key={group.id}>
                <h3>
                  {group.family ? (
                    <Link href={serviceHref(group.family, locale)} onClick={() => setActive(null)}>
                      {group.title}
                      {group.family.has_locale ? "" : t("common.englishSuffix")}
                    </Link>
                  ) : (
                    group.title
                  )}
                </h3>
                {group.services.map((s) => (
                  <NavLink key={s.code} item={serviceLink(s)} />
                ))}
              </section>
            ))}
          </div>
          {uncategorised.length > 0 && (
            <div className="nav-additional">
              <span>{t("header.additionalServices")}</span>
              {uncategorised.map((s) => (
                <NavLink key={s.code} item={serviceLink(s)} />
              ))}
            </div>
          )}
        </>
      );
    }

    const overviewCode = { industries: "I00", work: "W00", resources: "R00", about: "A01" }[active];
    const overview = page(overviewCode);
    const intro = raw(`header.${active}Intro`) ?? [];

    const tile = (industry) => (
      <Link key={industry.id} href={industry.href} className="nav-tile" onClick={() => setActive(null)}>
        {industry.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={industry.image} alt="" width="26" height="26" className="size-[26px] rounded object-cover" />
        ) : (
          <Image src="/assets/icons/factory.svg" alt="" width="26" height="26" />
        )}
        <div>
          <strong>{industry.title}</strong>
          {industry.description && <span className="line-clamp-2">{industry.description}</span>}
        </div>
        <span className="nav-tile-arrow" aria-hidden="true">
          ↗
        </span>
      </Link>
    );

    return (
      <div className={`structured-menu menu-${active}`}>
        <div className="nav-overview">
          <h2>{intro[0]}</h2>
          <p>{intro[1]}</p>
          <a href={overview.href}>
            {overview.title} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="nav-destinations">
          {active === "industries" ? (
            <>
              <h3 className="nav-group-label">{t("header.chooseIndustry")}</h3>
              <div className="nav-tile-grid">{industries.map(tile)}</div>
            </>
          ) : active === "work" ? (
            <div className="nav-groups">{group(t("header.selectedProjects"), cases.map(recordLink))}</div>
          ) : active === "resources" ? (
            <div className="nav-groups">
              {group(t("header.guidesArticles"), [page("R01"), ...guides.map(recordLink)])}
              {group(t("header.schemeInformation"), [page("R02"), ...schemes.map(recordLink)])}
            </div>
          ) : (
            <div className="nav-groups">
              {group(t("header.peopleApproach"), [page("A03"), page("A02")])}
              {group(t("header.workWithRapid"), [page("C01"), page("U01")])}
              {group(t("header.careers"), [page("U02"), page("U03")])}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ───────── TOP BAR (dark) ───────── */}
      <div className="bg-[#051c30] text-[13px] text-white!">
        <div className="mx-auto grid w-full max-w-7xl  items-center gap-4 px-4 py-3 sm:px-6  grid-cols-3 lg:px-8">
          {/* Center: announcement marquee */}
          <div className="flex min-w-0 items-center gap-3  col-span-2">
            <span className="shrink-0 rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold text-[#051c30]">
              {t("header.tickerTag")}
            </span>
            <Marquee pauseOnHover className="min-w-0 flex-1 p-0 [--duration:32s] [--gap:2rem]">
              {[...announcements, ...announcements].map((item, index) => (
                <div key={`${item.text}-${index}`} className="flex items-center gap-8">
                  {item.local ? (
                    <Link href={item.href} className="whitespace-nowrap hover:underline">
                      {item.text}
                    </Link>
                  ) : (
                    <a href={item.href} className="whitespace-nowrap hover:underline">
                      {item.text}
                    </a>
                  )}
                  <span aria-hidden="true" className="text-[#eaff6b]">
                    ✦
                  </span>
                </div>
              ))}
            </Marquee>
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 hover:text-[#eaff6b]">
              <Phone className="size-4" />
              {CONTACT.phone}
            </a>
            <span className="h-4 w-px bg-white/30" aria-hidden="true" />
            <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 hover:text-[#eaff6b]">
              <Mail className="size-4" />
              {CONTACT.email}
            </a>
          </div>
        </div>
      </div>

      {/* ───────── MAIN HEADER (white) ───────── */}
      {/* FIX 1: subtle soft shadow under navbar */}
      <header
        ref={header}
        className="sticky top-0 z-50 border-b border-slate-100 bg-white shadow-[0_2px_10px_rgba(15,35,50,0.06)]"
      >
        {/* FIX 2: lg height 108 -> 88 */}
        <div className="mx-auto flex h-[76px] w-full max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[88px] lg:px-8">
          {/* Logo */}
          <Link href={mainSiteHref("H01", locale)} aria-label={t("header.homeAria")} className="shrink-0">
            <Image src="/assets/logo.png" alt="Rapid Consulting" width={160} height={56} priority className="h-auto w-[130px] lg:w-[150px]" />
          </Link>

          {/* Nav — FIX 3: tighter, coherent group */}
          <nav
            ref={navigation}
            id="rapid-navigation"
            aria-label={t("header.mainNavigation")}
            className={cn(
              "absolute inset-x-0 top-full flex-col gap-1 border-b border-slate-100 bg-white p-4 shadow-lg",
              "lg:static lg:flex lg:flex-row lg:items-center lg:gap-0.5 lg:border-0 lg:p-0 lg:shadow-none",
              mobile ? "flex" : "hidden"
            )}
          >
            {navs.map((key) => (
              <button
                type="button"
                key={key}
                data-nav-trigger
                data-active={active === key}
                aria-expanded={active === key}
                aria-controls="rapid-mega"
                onClick={() => setActive(active === key ? null : key)}
                className={cn(
                  /* FIX 4: consistent text->chevron gap (gap-1), lg padding tighter */
                  "inline-flex items-center justify-between gap-1 rounded-full px-4 py-2 text-[16px] font-medium leading-none text-[#09263e] transition-colors lg:px-3.5",
                  "hover:text-[#1f5d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]",
                  active === key && "text-[#1f5d57]"
                )}
              >
                <span className="leading-none">{t(`header.nav.${key}`)}</span>
                <ChevronDown
                  className={cn("size-4 shrink-0 transition-transform duration-200", active === key && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
            ))}
            <MobileLanguageLink services={services} />
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 rounded-full text-[#09263e] hover:bg-slate-100"
              aria-label={t("header.searchWebsite")}
              onClick={() => {
                setActive(null);
                setMobile(false);
                setSearchOpen(true);
              }}
            >
              <Search className="size-5" />
            </Button>

            <div className="xl:flex justify-center rounded-full items-center text-white overflow-hidden shrink-0 bg-green-900 h-[40px] w-[40px] p-0">
              <a
                className="relative flex items-center justify-center w-full h-full"
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${WHATSAPP_LABEL}`}
              >
                <svg
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[22px] h-[22px]"
                >
                  <path
                    fill="#fff"
                    d="M16 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.35.617 4.554 1.696 6.466L2.667 29.333l7.04-1.85A13.27 13.27 0 0 0 16 29.333c7.364 0 13.333-5.969 13.333-13.333S23.364 2.667 16 2.667Zm0 24c-2.08 0-4.02-.58-5.674-1.584l-.406-.244-4.178 1.098 1.115-4.064-.265-.418A10.6 10.6 0 1 1 16 26.667Zm6.027-7.947c-.33-.166-1.95-.962-2.253-1.071-.302-.11-.522-.166-.742.166-.22.33-.852 1.07-1.045 1.29-.193.22-.385.248-.715.083-.33-.166-1.394-.514-2.655-1.64-.982-.875-1.645-1.956-1.838-2.286-.192-.33-.02-.509.145-.674.149-.148.33-.385.495-.578.165-.193.22-.33.33-.55.11-.22.055-.413-.028-.578-.083-.166-.742-1.787-1.017-2.447-.268-.643-.541-.556-.742-.567l-.633-.011c-.22 0-.578.083-.88.413-.303.33-1.156 1.129-1.156 2.75s1.183 3.188 1.348 3.408c.165.22 2.328 3.556 5.644 4.985.789.34 1.404.543 1.884.695.792.252 1.512.217 2.08.132.635-.095 1.952-.798 2.227-1.568.275-.77.275-1.43.193-1.568-.083-.138-.303-.22-.633-.385Z"
                  />
                </svg>
              </a>
            </div>

            <div className="hidden md:block">
              <LanguageSwitcher services={services} />
            </div>

            {/* Lime CTA pill — h-14 -> h-12, inner circle size-10 -> size-9 */}
            <Button
              asChild
              className="hidden h-12 rounded-full bg-[#eaff6b] pl-6 pr-1.5 text-[16px] font-medium text-[#09263e] shadow-none hover:bg-[#dcf24f] sm:inline-flex"
            >
              <Link href="/contact" aria-label={t("service.discussProject")}>
                <span>{t("service.discussProject")}</span>
                <span className="ml-3 flex size-9 items-center justify-center rounded-full bg-[#09263e] text-white!">
                  <ChevronRight className="size-5" aria-hidden="true" />
                </span>
              </Link>
            </Button>

            {/* Mobile toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-mobile-trigger
              className="size-11 rounded-full text-[#09263e]  hover:bg-slate-100 lg:hidden"
              aria-label={mobile ? t("header.closeMenu") : t("header.openMenu")}
              aria-expanded={mobile}
              aria-controls="rapid-navigation"
              onClick={() => {
                setMobile(!mobile);
                setActive(null);
              }}
            >
              {mobile ? <X className="size-6" /> : <Menu className="size-6" />}
            </Button>
          </div>
        </div>

        {/* Mega menu — FIX 5/6/7: py-8 -> pt-8 (32px) pb-10, lighter shadow, same 1320 container */}
        {active && (
          <div
            id="rapid-mega"
            data-menu={active}
            className={cn(
              "rapid-mega absolute inset-x-0 top-full max-h-[calc(100vh-var(--header-height,88px))] overflow-y-auto overscroll-contain border-t border-slate-100 bg-white shadow-[0_12px_24px_-12px_rgba(15,35,50,0.12)]",
              MEGA_SPACING
            )}
          >
            <div className="mx-auto w-full max-w-[1320px] px-4  pb-8 sm:px-6 lg:px-8  lg:pb-10">
              {menuContent()}
            </div>
          </div>
        )}
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} services={services} />
    </>
  );
}