"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, ExternalLink, Mail, Menu, Phone, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasTranslation } from "@/i18n/has-translation";
import { useTx } from "@/lib/use-tx";
import {
  LICENCE_FAMILY_CODE,
  approvalGroups,
  balanceColumns,
  isFinanceService,
  isSubsidyService,
  splitSubsidyGroups,
} from "@/lib/navigation";
import {
  ALL_SERVICES_HREF,
  FINANCE_AND_INSURANCE_HREF,
  defaultNavigation,
  isExternalHref,
  localizeHref,
  navigationLabel,
} from "@/lib/site-navigation";
import { locales } from "@/i18n/routing";
import { EMAIL, PHONE_HREF, PHONE_LABEL, WHATSAPP_LABEL, WHATSAPP_NUMBER, mainSiteHref, serviceHref, servicesHref } from "@/lib/site";
import { WhatsAppButton, WhatsAppMark } from "@/components/contact/whatsapp";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { AnnouncementBar } from "./announcement-bar";
import { CRM_LOGIN_URL } from "./crm-login";
import { LanguageToggle } from "./language-toggle";
import { MobileLanguageLink } from "./language-switcher";
import { SearchDialog } from "./search-dialog";

// The number shown in the green WhatsApp button, without the country code
// ("94672 48028"); the full number stays in the accessible name.
const WHATSAPP_SHORT = WHATSAPP_LABEL.replace(/^\+91\s*/, "");

// The inline menu needs about 1150px with the revised actions; below this width
// the header collapses to the menu button BEFORE anything can overflow
// (PDF: at 1024px the page measured 1139px). Keep in sync with the `xl:` classes.
const INLINE_MENU_QUERY = "(min-width: 1280px)";

// Mega menu spacing system — all Tailwind utilities (8px base).
// `!` is important so that the older global CSS classes (.nav-group, .nav-page-link ...) are overridden.
const MEGA_SPACING = [
  // headings: same line, same distance to the links
  "[&_h2]:mb-2.5! [&_h2]:leading-tight! [&_h3]:mb-3.5! [&_h3]:leading-snug!",
  "[&_.nav-overview_p]:mb-4! [&_.nav-overview_p]:leading-relaxed!",
  // layout: columns share one top line, consistent gaps
  "[&_.structured-menu]:items-start! [&_.structured-menu]:gap-x-6! [&_.structured-menu]:gap-y-8! xl:[&_.structured-menu]:gap-x-10!",
  "[&_.mega-grid]:items-start! [&_.mega-grid]:gap-x-6! [&_.mega-grid]:gap-y-8! xl:[&_.mega-grid]:gap-x-10!",
  "[&_.nav-groups]:items-start! [&_.nav-groups]:gap-x-6! [&_.nav-groups]:gap-y-8! xl:[&_.nav-groups]:gap-x-10!",
  "[&_.nav-group]:m-0! [&_.nav-group]:min-w-0!",
  // links: uniform rhythm, no layout shift on hover (px + -mx)
  "[&_.nav-page-link]:-mx-2.5! [&_.nav-page-link]:mb-1! [&_.nav-page-link]:rounded-lg! [&_.nav-page-link]:px-2.5! [&_.nav-page-link]:py-1! [&_.nav-page-link]:leading-snug! [&_.nav-page-link]:transition-colors",
  "[&_.nav-page-link:last-child]:mb-0! [&_.nav-page-link:hover]:bg-slate-100!",
  // tiles / cards
  "[&_.nav-group-label]:mb-3.5! [&_.nav-tile-grid]:gap-4! [&_.nav-tile]:items-start! [&_.nav-tile]:gap-3.5! [&_.nav-tile]:p-4!",
  "[&_.nav-tile>div]:flex! [&_.nav-tile>div]:flex-col! [&_.nav-tile>div]:gap-1!",
].join(" ");

// Pages whose first screen is the navy masthead (the Home page): the header
// starts as a navy bar in the page and a white translucent bar takes over once
// that first bar has left the screen. Every other template keeps the white
// sticky header.
const isHomePath = (pathname) => !pathname || pathname === "/" || locales.some((locale) => pathname === `/${locale}`);

// The overview page behind the four menus that keep their existing bodies.

function useInlineMenu() {
  const [inline, setInline] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(INLINE_MENU_QUERY);
    const update = () => setInline(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return inline;
}

// Everything in the menu comes from the API (see lib/content/site-data.js):
// service categories with their services, industries, case studies, guides
// and schemes, plus the central navigation setting (`navigation.config`: the
// seven primary destinations with their labels, links, visibility and order).
// Add or edit them in the admin panel and the menu follows.
export function SiteHeader({ navigation: menu }) {
  const { services = [], categories = [], industries = [], cases = [], guides = [], schemes = [], config } = menu ?? {};
  const locale = useLocale();
  const t = useTranslations();
  const tx = useTx();
  const has = hasTranslation(t);
  const inline = useInlineMenu();
  const pathname = usePathname();
  const home = isHomePath(pathname);

  const primary = useMemo(
    () => (config?.primary ?? defaultNavigation().primary).filter((item) => item.visible !== false),
    [config],
  );

  const [active, setActive] = useState(null); // key of the open primary item
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Home only: true once the navy first bar has left the screen and the white bar is showing.
  const [stuck, setStuck] = useState(false);
  const [animate, setAnimate] = useState(false);
  const header = useRef(null); // the white sticky header (every page except Home)
  const initialBar = useRef(null); // Home: the navy bar in the page
  const stickyBar = useRef(null); // Home: the white translucent bar
  const stuckRef = useRef(false);
  const handoff = useRef(null); // focus carried from one bar to the other

  const closeAll = () => {
    setActive(null);
    setMobile(false);
  };

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

  // A destination from the central navigation: a service path keeps the
  // service's own language rule, every other path gets the language prefix.
  const hrefFor = (path) => {
    const slug = /^\/services\/([^/?#]+)$/.exec(path ?? "")?.[1];
    const service = slug && services.find((item) => item.slug === slug);
    return service ? serviceHref(service, locale) : localizeHref(path, locale);
  };

  const itemLabel = (item) => navigationLabel(item, locale, tx);

  // The dedicated contact page stays reachable from the menu (plain link).
  const contactPage = { ...page("C01"), title: tx("header.contactPage", "Contact us") };

  const announcements = [
    { text: locale === "hi" ? t("header.announcements.services") : tx("hdr.ticker.services", t("header.announcements.services")), href: servicesHref(locale), local: true },
    { text: locale === "hi" ? t("header.announcements.schemes") : tx("hdr.ticker.schemes", t("header.announcements.schemes")), ...page("R02") },
    { text: locale === "hi" ? t("header.announcements.guides") : tx("hdr.ticker.guides", t("header.announcements.guides")), ...page("R01") },
    ...guides.slice(0, 2).map((guide) => ({ text: guide.title, href: guide.href, local: true })),
    ...schemes.slice(0, 2).map((scheme) => ({ text: scheme.title, href: scheme.href, local: true })),
  ];

  // Subsidies (S01) has its own heading; it is left out of Approvals.
  const { subsidy } = splitSubsidyGroups(categories);
  const approvals = approvalGroups(categories); // not the subsidy family, not finance / insurance
  const subsidyFamily = subsidy?.family ?? services.find((service) => service.code === "S01") ?? null;
  const subsidyChildren = [
    ...(subsidy?.services ?? []),
    ...services.filter(
      (service) => isSubsidyService(service) && service.type !== "service-family" && service.type !== "service-index",
    ),
  ].filter((service, index, all) => all.findIndex((other) => other.code === service.code) === index);

  // Services that belong to no category still get a place in the menu.
  const categorised = new Set(
    categories.flatMap((group) => [group.family, ...group.services]).filter(Boolean).map((service) => service.code),
  );
  const uncategorised = services.filter(
    (service) =>
      service.type !== "service-family" &&
      service.type !== "service-index" &&
      !categorised.has(service.code) &&
      !isSubsidyService(service) &&
      !isFinanceService(service),
  );

  // The licences and certifications family, when the API has it.
  const licenceFamily =
    categories.map((group) => group.family).find((family) => family?.code === LICENCE_FAMILY_CODE) ??
    services.find((service) => service.code === LICENCE_FAMILY_CODE) ??
    null;

  // Which bar is live: the white sticky header, or (Home, at the top) the navy bar.
  const darkLive = home && !stuck;
  const barOf = (variant) => (variant === "dark" ? darkLive : !darkLive);

  // Publish the header height for sticky things below it (section menu, rail).
  // Both Home bars have the same height, so the value is right in either state.
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const measure = () => {
      const sizing = home ? stickyBar.current : header.current;
      if (!sizing) return;
      const live = home ? (stuckRef.current ? stickyBar.current : initialBar.current) : header.current;
      root.style.setProperty("--header-height", `${sizing.getBoundingClientRect().height}px`);
      root.style.setProperty("--site-header-h", `${sizing.getBoundingClientRect().height}px`);
      root.style.setProperty("--header-top", `${Math.max(0, (live ?? sizing).getBoundingClientRect().top)}px`);
    };

    // Home: the white bar enters only after the navy bar is completely out of view.
    const sync = () => {
      frame = 0;
      measure();
      if (!home || !initialBar.current) return;
      const next = initialBar.current.getBoundingClientRect().bottom <= 0;
      if (next === stuckRef.current) return;
      const focused = document.activeElement;
      handoff.current = focused?.closest?.("[data-site-header]") ? (focused.dataset?.focusId ?? null) : null;
      stuckRef.current = next;
      setStuck(next);
      setActive(null);
      setMobile(false);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(sync);
    };

    sync();
    const enable = window.requestAnimationFrame(() => setAnimate(true));

    const observer = new ResizeObserver(schedule);
    [header.current, initialBar.current, stickyBar.current].filter(Boolean).forEach((el) => observer.observe(el));

    const close = (e) => {
      if (!e.target.closest?.("[data-site-header]")) {
        setActive(null);
        setMobile(false);
      }
    };
    const key = (e) => {
      if (e.key !== "Escape") return;
      // Close whatever is open and hand focus back to the control that opened it.
      const trigger =
        document.querySelector('[data-site-header] [data-mobile-trigger][aria-expanded="true"]') ||
        document.querySelector("[data-site-header] [data-nav-trigger][aria-expanded='true']");
      if (!trigger) return;
      setActive(null);
      setMobile(false);
      trigger.focus();
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(enable);
      if (frame) window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [home]);

  // Leaving Home resets the Home-only state.
  useEffect(() => {
    if (home) return;
    stuckRef.current = false;
    setStuck(false);
  }, [home]);

  // The bar that was focused when the bars swapped hands: focus the same control in the new one.
  useEffect(() => {
    const id = handoff.current;
    handoff.current = null;
    if (!id) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const bar = stuck ? stickyBar.current : initialBar.current;
      bar?.querySelector(`[data-focus-id="${id}"]`)?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [stuck]);

  // Switching between the inline menu and the menu button resets the open state.
  useEffect(() => {
    setActive(null);
    setMobile(false);
  }, [inline]);

  const navLink = (item, detail) => {
    const content = (
      <>
        <span>{item.title}</span>
        {detail && <small>{detail}</small>}
      </>
    );
    return item.local ? (
      <Link key={item.code} href={item.href} className="nav-page-link" onClick={closeAll}>
        {content}
      </Link>
    ) : (
      <a key={item.code} href={item.href} className="nav-page-link" onClick={closeAll}>
        {content}
      </a>
    );
  };

  const group = (title, items, details = {}) => (
    <section className="nav-group" key={title}>
      <h3>{title}</h3>
      {items.filter(Boolean).map((item) => navLink(item, details[item.code]))}
    </section>
  );

  const serviceBlock = (block) => (
    <section key={block.id} className="min-w-0">
      <h3>
        {block.family ? (
          <Link href={serviceHref(block.family, locale)} onClick={closeAll}>
            {block.title}
            {block.family.has_locale ? "" : t("common.englishSuffix")}
          </Link>
        ) : (
          block.title
        )}
      </h3>
      {block.services.map((service) => navLink(serviceLink(service)))}
    </section>
  );

  const searchButton = (
    <button
      type="button"
      onClick={() => {
        closeAll();
        setSearchOpen(true);
      }}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-[#09263e] transition-colors hover:border-[#1f5d57] hover:text-[#1f5d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]"
    >
      <Search className="size-4" aria-hidden="true" />
      {tx("header.searchServices", "Search services")}
    </button>
  );

  // Links a CMS editor added under a primary destination (the built-in
  // destinations have none except Your Project's stages).
  const extraLinks = (item) => {
    const children = item.key === "your-project" ? [] : (item.children ?? []);
    if (!children.length) return null;
    return (
      <div className="mt-8">
        {group(
          tx("wb.menu.more", "More"),
          children.map((child, index) => ({
            code: `${item.key}-extra-${index}`,
            title: child.label_hi && locale === "hi" ? child.label_hi : child.label,
            href: hrefFor(child.href),
            local: !isExternalHref(child.href),
          })),
        )}
      </div>
    );
  };

  // The Approvals and Subsidies menus follow the Figma layout: a title with a
  // one-line description, link columns under small red labels, and a pale card
  // with one question and one button. The destinations are the Rapid service
  // and scheme pages; every label can be translated (tx key, English fallback).
  // `disabled`: a destination that does not exist yet (greyed, not a link).
  const figmaLink = (entry) => (
    <li key={entry.label}>
      {entry.disabled ? (
        <span className="fm-link fm-link--disabled" aria-disabled="true">
          <span>{entry.label}</span>
          <span aria-hidden="true" className="fm-link__arrow">
            ↗
          </span>
        </span>
      ) : (
        <Link href={entry.href} onClick={closeAll} className="fm-link">
          <span>{entry.label}</span>
          <span aria-hidden="true" className="fm-link__arrow">
            ↗
          </span>
        </Link>
      )}
    </li>
  );

  const figmaColumn = (label, entries) => (
    <div className="fm-col">
      <h3 className="fm-label">{label}</h3>
      <ul className="fm-list">{entries.map(figmaLink)}</ul>
    </div>
  );

  const figmaShell = ({ title, text, columns, card, footer }) => (
    <div className="fm-menu">
      <div className="fm-head">
        <div>
          <h2 className="fm-title">{title}</h2>
          <p className="fm-text">{text}</p>
        </div>
        <button type="button" className="fm-close" onClick={closeAll} aria-label={tx("wb.menu.close", "Close menu")}>
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="fm-body">
        <div className="fm-columns">{columns}</div>
        <aside className="fm-card">
          <h3>{card.title}</h3>
          <p>{card.text}</p>
          <EnquiryTrigger className="fm-card__button" source={card.source} pageTitle={card.title}>
            {card.button}
            <ArrowRight className="size-4" aria-hidden="true" />
          </EnquiryTrigger>
        </aside>
      </div>
      <div className="fm-footer">{footer}</div>
    </div>
  );

  function approvalsContent(item) {
    const svc = (slug, label, key) => ({ label: tx(key, label), href: hrefFor(`/services/${slug}`) });
    const other = [
      { label: tx("wb.menu.financeInsurance", "Finance & insurance"), href: localizeHref(FINANCE_AND_INSURANCE_HREF, locale) },
      licenceFamily
        ? { label: tx("wb.menu.licences", "Licences & certifications"), href: serviceHref(licenceFamily, locale) }
        : null,
      { label: tx("wb.menu.allServices", "All services"), href: localizeHref(ALL_SERVICES_HREF, locale) },
      { label: tx("wb.menu.approvalsExplore", "Explore approvals"), href: hrefFor(item.href) },
    ].filter(Boolean);
    return (
      <>
        {figmaShell({
          title: itemLabel(item),
          text: tx("fm.approvals.text", "From land checks to permission to operate."),
          columns: (
            <>
              {figmaColumn(tx("fm.approvals.land", "Land & site"), [
                { label: tx("fm.approvals.buyingLand", "Buying industrial land"), href: localizeHref("/your-project/buying-land", locale) },
                svc("change-in-land-use-clu", "Change of Land Use (CLU)", "fm.approvals.clu"),
                svc("pwd-entry-exit-permission-noc", "PWD access permission", "fm.approvals.pwd"),
                svc("nhai-entry-and-exit-permission-noc", "NHAI access permission", "fm.approvals.nhai"),
              ])}
              {figmaColumn(tx("fm.approvals.build", "Build & operate"), [
                svc("building-plans-approval-from-dtp-and-stp-haryana", "Building plan approval", "fm.approvals.building"),
                svc("consent-to-establish-cte-pollution-noc", "Consent to Establish (CTE)", "fm.approvals.cte"),
                svc("consent-to-operate-cto-pollution-noc", "Consent to Operate (CTO)", "fm.approvals.cto"),
                svc("fire-department-noc", "Fire NOC", "fm.approvals.fire"),
              ])}
            </>
          ),
          card: {
            title: tx("fm.approvals.cardTitle", "Not sure what you need?"),
            text: tx("fm.approvals.cardText", "Share your activity, site and project stage. Rapid will check which approvals connect."),
            button: tx("fm.approvals.cardButton", "Request an approval check"),
            source: "menu-approvals",
          },
          footer: (
            <>
              <h3 className="fm-label">{tx("wb.menu.otherSupport", "Other business support")}</h3>
              <ul className="fm-list fm-list--row">{other.map(figmaLink)}</ul>
            </>
          ),
        })}
        {extraLinks(item)}
      </>
    );
  }

  function subsidiesContent(item) {
    const scheme = (slug, label, key) => ({ label: tx(key, label), href: localizeHref(`/schemes/${slug}`, locale) });
    const hub = (anchor, label, key) => ({ label: tx(key, label), href: `${localizeHref("/subsidies", locale)}#${anchor}` });
    return (
      <>
        {figmaShell({
          title: tx("fm.subsidies.title", "Subsidies & Incentives"),
          text: tx("fm.subsidies.text", "Check eligibility. Plan the application. Follow through to payment."),
          columns: (
            <>
              {figmaColumn(tx("fm.subsidies.start", "Start with your investment"), [
                { label: tx("fm.subsidies.advisory", "Subsidy advisory"), href: hrefFor("/services/msmes-subsidy-consultant") },
                { label: tx("fm.subsidies.browse", "Browse every scheme"), href: localizeHref("/schemes", locale) },
                { label: tx("fm.subsidies.industry", "Schemes for your industry"), href: `${localizeHref("/subsidies", locale)}#for-your-sector` },
              ])}
              {figmaColumn(tx("fm.subsidies.explore", "Explore schemes"), [
                hub("on-your-investment", "Capital investment support", "fm.subsidies.capital"),
                hub("on-your-loan", "Interest subsidy", "fm.subsidies.interest"),
                scheme("hguvy-scheme", "HGUVY", "fm.subsidies.hguvy"),
                scheme("testing-machine-subsidy", "Equipment & safety assistance", "fm.subsidies.equipment"),
              ])}
            </>
          ),
          card: {
            title: tx("fm.subsidies.cardTitle", "Before you commit"),
            text: tx("fm.subsidies.cardText", "Eligibility can depend on the investment, location and dates. Start with your case."),
            button: tx("fm.subsidies.cardButton", "Request a subsidy check"),
            source: "menu-subsidies",
          },
          footer: (
            <ul className="fm-list fm-list--row">
              {figmaLink({ label: tx("fm.subsidies.exploreAll", "Explore subsidies & incentives"), href: hrefFor(item.href) })}
            </ul>
          ),
        })}
        {extraLinks(item)}
      </>
    );
  }

  function aboutContent(item) {
    const about = (anchor) => (anchor ? `${localizeHref("/about", locale)}#${anchor}` : localizeHref("/about", locale));
    return (
      <>
        {figmaShell({
          title: itemLabel(item),
          text: tx("fm.about.text", "Expert guidance. Ownership through execution."),
          columns: (
            <>
              {figmaColumn(tx("fm.about.company", "Rapid Consulting"), [
                { label: tx("fm.about.story", "The Rapid story"), href: about("") },
                { label: tx("fm.about.advantage", "The Rapid advantage"), href: about("why-one-owner") },
                { label: tx("fm.about.team", "Meet the team"), href: about("people") },
                { label: tx("fm.about.how", "How we work"), href: localizeHref("/how-we-work", locale) },
              ])}
              {figmaColumn(tx("fm.about.connect", "Connect with us"), [
                { label: tx("fm.about.advisers", "For CAs & bankers"), href: localizeHref("/advisers", locale) },
                { label: tx("fm.about.careers", "Careers"), href: localizeHref("/careers", locale) },
                { label: tx("fm.about.contact", "Contact us"), href: localizeHref("/contact", locale) },
              ])}
            </>
          ),
          card: {
            title: tx("fm.about.cardTitle", "One team. Start to finish."),
            text: tx("fm.about.cardText", "Approvals and subsidies, with coordinated documentation, applications and follow-ups."),
            button: tx("fm.about.cardButton", "Discuss your project"),
            source: "menu-about",
          },
          footer: (
            <ul className="fm-list fm-list--row">
              {figmaLink({ label: tx("fm.about.learnMore", "Learn more about us"), href: hrefFor(item.href) })}
            </ul>
          ),
        })}
        {extraLinks(item)}
      </>
    );
  }

  // Your Project: the stages from the central navigation, split into "Plan & set up" and
  // "Grow or resolve a block". The "file stuck" stage is offered for approvals and claims.
  function yourProjectContent(item) {
    const stages = item.children ?? [];
    const stageLink = (key, label, labelKey) => {
      const stage = stages.find((entry) => entry.key === key || entry.href?.endsWith(`#${key}`));
      return { label: tx(labelKey, label), href: hrefFor(stage?.href ?? `${item.href}#${key}`) };
    };
    return (
      <>
        {figmaShell({
          title: itemLabel(item),
          text: tx("fm.project.text", "Start with your situation. You do not need to know the service name."),
          columns: (
            <>
              {figmaColumn(tx("fm.project.plan", "Plan & set up"), [
                stageLink("buying-land", "Buying industrial land", "fm.project.buyingLand"),
                stageLink("setting-up", "Setting up a new unit", "fm.project.settingUp"),
              ])}
              {figmaColumn(tx("fm.project.grow", "Grow or resolve a block"), [
                stageLink("expanding", "Planning machinery or expansion", "fm.project.expanding"),
                stageLink("running", "Unit already running", "fm.project.running"),
                stageLink("file-stuck", "Approval file stuck", "fm.project.approvalStuck"),
                stageLink("file-stuck", "Subsidy claim stuck", "fm.project.claimStuck"),
              ])}
            </>
          ),
          card: {
            title: tx("fm.project.cardTitle", "Feeling stuck or confused?"),
            text: tx(
              "fm.project.cardText",
              "Rapid experts will check your case and help you understand the next step. The first check is on us.",
            ),
            button: tx("fm.project.cardButton", "Discuss your project"),
            source: "menu-your-project",
          },
          footer: (
            <ul className="fm-list fm-list--row">
              {figmaLink({ label: tx("fm.project.explore", "Explore Your Project"), href: hrefFor(item.href) })}
            </ul>
          ),
        })}
        {extraLinks(item)}
      </>
    );
  }

  // Industries: the industries from the API (admin panel -> Industries), the first two
  // under "Manufacturing & processing" and the others under "More industries".
  const INDUSTRY_SHORT = {
    "food-and-agro-processing": ["fm.industries.food", "Food & agro processing"],
    "engineering-and-materials-manufacturing": ["fm.industries.engineering", "Engineering & materials"],
    "recycling-and-biofuel": ["fm.industries.recycling", "Recycling & biofuel"],
    "commercial-and-logistics-facilities": ["fm.industries.commercial", "Commercial & logistics"],
  };
  function industriesContent(item) {
    const entries = industries.map((industry) => {
      const short = INDUSTRY_SHORT[industry.slug];
      return { label: short ? tx(short[0], short[1]) : industry.title, href: industry.href };
    });
    return (
      <>
        {figmaShell({
          title: itemLabel(item),
          text: tx("fm.industries.text", "Advice shaped around what you make, operate or plan to build."),
          columns: (
            <>
              {figmaColumn(tx("fm.industries.manufacturing", "Manufacturing & processing"), entries.slice(0, 2))}
              {figmaColumn(tx("fm.industries.more", "More industries"), [
                ...entries.slice(2),
                { label: tx("fm.industries.viewAll", "View all industries"), href: hrefFor(item.href) },
              ])}
            </>
          ),
          card: {
            title: tx("fm.industries.cardTitle", "Your industry, your requirements"),
            text: tx("fm.industries.cardText", "Connect the relevant approvals, subsidies and business support for your project."),
            button: tx("fm.industries.cardButton", "Discuss your project"),
            source: "menu-industries",
          },
          footer: (
            <ul className="fm-list fm-list--row">
              {figmaLink({ label: tx("fm.industries.explore", "Explore all industries"), href: hrefFor(item.href) })}
            </ul>
          ),
        })}
        {extraLinks(item)}
      </>
    );
  }

  // Work: case studies (two named ones when they are published) and client experiences.
  function workContent(item) {
    const caseLink = (prefix, label, key) => {
      const record = cases.find((entry) => entry.slug?.startsWith(prefix) || entry.id?.startsWith?.(prefix));
      return record ? { label: tx(key, label), href: record.href } : null;
    };
    const archive = hrefFor(item.href);
    return (
      <>
        {figmaShell({
          title: itemLabel(item),
          text: tx("fm.work.text", "See the work behind the result."),
          columns: (
            <>
              {figmaColumn(
                tx("fm.work.success", "Client success"),
                [
                  { label: tx("fm.work.allCases", "All case studies"), href: archive },
                  caseLink("capital-subsidy", "Capital subsidy support", "fm.work.capital"),
                  caseLink("testing-equipment", "Testing equipment support", "fm.work.testing"),
                ].filter(Boolean),
              )}
              {figmaColumn(tx("fm.work.experiences", "Client experiences"), [
                { label: tx("fm.work.reviews", "Client reviews"), href: `${archive}#reviews` },
                { label: tx("fm.work.businesses", "Businesses we have supported"), href: `${archive}#case-archive` },
              ])}
            </>
          ),
          card: {
            title: tx("fm.work.cardTitle", "What could Rapid help you resolve?"),
            text: tx("fm.work.cardText", "Tell us where your project stands. We will start with the facts of your case."),
            button: tx("fm.work.cardButton", "Discuss your project"),
            source: "menu-work",
          },
          footer: (
            <ul className="fm-list fm-list--row">
              {figmaLink({ label: tx("fm.work.viewAll", "View all case studies"), href: archive })}
            </ul>
          ),
        })}
        {extraLinks(item)}
      </>
    );
  }

  // Resources: reading on the left, live sessions / communities / advisers on the right.
  // "Reports & downloads" has no page yet, so it is shown but not a link.
  function resourcesContent(item) {
    const to = (path) => localizeHref(path, locale);
    return (
      <>
        {figmaShell({
          title: itemLabel(item),
          text: tx("fm.resources.text", "Practical answers for your next decision."),
          columns: (
            <>
              {figmaColumn(tx("fm.resources.read", "Read & prepare"), [
                { label: tx("fm.resources.articles", "Articles"), href: to("/articles") },
                { label: tx("fm.resources.guides", "Guides"), href: to("/guides") },
                { label: tx("fm.resources.reports", "Reports & downloads"), disabled: true },
                { label: tx("fm.resources.faqs", "FAQs"), href: to("/faqs") },
              ])}
              {figmaColumn(tx("fm.resources.learn", "Learn & stay updated"), [
                { label: tx("fm.resources.sessions", "Live sessions & recordings"), href: to("/sessions") },
                { label: tx("fm.resources.communities", "WhatsApp communities"), href: `${to("/resources")}#community-invite-resources` },
                { label: tx("fm.resources.advisers", "For CAs & bankers"), href: to("/advisers") },
              ])}
            </>
          ),
          card: {
            title: tx("fm.resources.cardTitle", "Bring your questions"),
            text: tx("fm.resources.cardText", "Read first or speak with our experts. We will help you connect the guidance to your project."),
            button: tx("fm.resources.cardButton", "Discuss your project"),
            source: "menu-resources",
          },
          footer: (
            <ul className="fm-list fm-list--row">
              {figmaLink({ label: tx("fm.resources.explore", "Explore all resources"), href: hrefFor(item.href) })}
            </ul>
          ),
        })}
        {extraLinks(item)}
      </>
    );
  }

  // A link item with children (custom-* primary items): a plain list.
  function customContent(item) {
    return (
      <div className="structured-menu menu-custom">
        <div className="nav-overview">
          <h2>{itemLabel(item)}</h2>
          <Link href={hrefFor(item.href)} onClick={closeAll}>
            {itemLabel(item)} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="nav-destinations">
          <div className="nav-groups">
            {group(
              itemLabel(item),
              (item.children ?? []).map((child, index) => ({
                code: `${item.key}-${index}`,
                title: locale === "hi" && child.label_hi ? child.label_hi : child.label,
                href: hrefFor(child.href),
                local: !isExternalHref(child.href),
              })),
            )}
          </div>
        </div>
      </div>
    );
  }

  function menuContent(item) {
    if (!item) return null;
    if (item.key === "approvals") return approvalsContent(item);
    if (item.key === "subsidies") return subsidiesContent(item);
    if (item.key === "about") return aboutContent(item);
    if (item.key === "your-project") return yourProjectContent(item);
    if (item.key === "industries") return industriesContent(item);
    if (item.key === "work") return workContent(item);
    if (item.key === "resources") return resourcesContent(item);
    // Anything else (an item an editor added): its links as a plain list.
    return customContent(item);
  }

  // A primary item is a menu button, unless it is a custom link without children.
  const isPlainLink = (item) => item.custom && !(item.children ?? []).length;
  const activeItem = primary.find((item) => item.key === active) ?? null;
  const toggle = (key) => setActive(active === key ? null : key);

  // One bar. "dark" = Home's navy bar in the page, "light" = the white sticky
  // bar. Both draw the same navigation contract; only the live one has open
  // menus, ids and expanded states.
  function renderBar(variant) {
    const dark = variant === "dark";
    const live = barOf(variant);
    const openKey = live ? active : null;
    const menuOpen = live && mobile;

    const triggerClass = (open) =>
      cn(
        "inline-flex items-center justify-between gap-1 whitespace-nowrap rounded-full px-1.5 py-2 text-[14px] font-medium leading-none transition-colors min-[1440px]:px-2 min-[1440px]:text-[15px] 2xl:px-2.5 2xl:text-[16px]",
        "focus-visible:outline-none focus-visible:ring-2",
        dark ? "text-white hover:text-[#eaff6b] focus-visible:ring-[#eaff6b]" : "text-[#09263e] hover:text-[#1f5d57] focus-visible:ring-[#1f5d57]",
        open && (dark ? "text-[#eaff6b]" : "text-[#1f5d57]"),
      );

    const iconButton = cn(
      "rounded-full",
      dark ? "text-white hover:bg-white/10 hover:text-white" : "text-[#09263e] hover:bg-slate-100",
    );

    return (
      <>
        <div className="mx-auto flex h-[64px] w-full max-w-[1440px] items-center justify-between gap-2 px-3 sm:h-[76px] sm:gap-4 sm:px-6 xl:h-[84px] xl:gap-2 xl:px-6 2xl:gap-4 2xl:px-8">
          {/* Logo: the original 500x142 asset, never stretched (white on the navy bar) */}
          <Link href={mainSiteHref("H01", locale)} aria-label={t("header.homeAria")} data-focus-id="logo" className="shrink-0">
            <Image
              src="/assets/logo.png"
              alt="Rapid Consulting"
              width={500}
              height={142}
              sizes="(min-width: 1536px) 150px, (min-width: 1280px) 120px, (min-width: 640px) 130px, 104px"
              priority={live}
              className={cn("h-auto w-[104px] sm:w-[130px] xl:w-[120px] min-[1440px]:w-[130px] 2xl:w-[150px]", dark && "brightness-0 invert")}
            />
          </Link>

          {/* Inline menu: only where it fits (>= 1280px) */}
          <nav
            id={live ? "rapid-navigation-inline" : undefined}
            aria-label={t("header.mainNavigation")}
            className="hidden min-w-0 items-center gap-0.5 xl:flex"
          >
            {primary.map((item) =>
              isPlainLink(item) ? (
                <Link
                  key={item.key}
                  href={hrefFor(item.href)}
                  data-focus-id={`nav-${item.key}`}
                  onClick={closeAll}
                  className={triggerClass(false)}
                >
                  <span className="leading-none">{itemLabel(item)}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  key={item.key}
                  data-nav-trigger
                  data-focus-id={`nav-${item.key}`}
                  aria-expanded={openKey === item.key}
                  aria-controls={openKey === item.key ? "rapid-mega" : undefined}
                  onClick={() => toggle(item.key)}
                  className={triggerClass(openKey === item.key)}
                >
                  <span className="leading-none">{itemLabel(item)}</span>
                  <ChevronDown
                    className={cn("size-3.5 shrink-0 transition-transform duration-200", openKey === item.key && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
              ),
            )}
          </nav>

          {/* Actions: search, WhatsApp, language, Discuss your project (phones: callback pill) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 xl:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-focus-id="search"
              className={cn("size-10", iconButton)}
              aria-label={t("header.searchWebsite")}
              onClick={() => {
                closeAll();
                setSearchOpen(true);
              }}
            >
              <Search className="size-5" />
            </Button>

            {/* Green WhatsApp button. The number is shown from 1024px; between 1280px and 1439px (and in Hindi
                while the inline menu is on) there is no room next to the seven menu items, so only the icon
                stays (see wb.css .wb-wa); the number is always in the accessible name. */}
            <a
              className={cn(
                "wb-wa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                dark ? "ring-1 ring-white/50 focus-visible:ring-[#eaff6b] focus-visible:ring-offset-[#09263e]" : "focus-visible:ring-[#1f5d57]",
              )}
              data-focus-id="whatsapp"
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${WHATSAPP_LABEL}`}
            >
              <WhatsAppMark />
              <span className="wb-wa-num">{WHATSAPP_SHORT}</span>
            </a>

            {/* "Hindi" / "English" text toggle (tablet and up; the menu panel has it on phones) */}
            <LanguageToggle services={services} dark={dark} data-focus-id="language" className="hidden md:inline-flex" />

            {/* Enquiry: phones get a compact pill right in the bar */}
            <EnquiryTrigger
              source="header-mobile"
              onClick={closeAll}
              className="inline-flex h-10 shrink-0 items-center rounded-full bg-[#eaff6b] px-3.5 text-[13px] font-semibold leading-none text-[#09263e] transition-colors hover:bg-[#dcf24f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57] focus-visible:ring-offset-2 sm:hidden"
            >
              <span className="min-[400px]:hidden">{tx("header.callbackShort", "Callback")}</span>
              <span className="hidden min-[400px]:inline">{tx("header.callbackCta", "Request a callback")}</span>
            </EnquiryTrigger>

            {/* Outlined "Discuss your project" (tablet and desktop) */}
            <EnquiryTrigger
              source="header"
              onClick={closeAll}
              data-focus-id="discuss"
              className={cn(
                "hidden h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] px-3.5 text-[13px] font-semibold leading-none transition-colors sm:inline-flex min-[1440px]:px-4 min-[1440px]:text-[14px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                dark
                  ? "border-white text-white hover:bg-white hover:text-[#09263e] focus-visible:ring-[#eaff6b] focus-visible:ring-offset-[#09263e]"
                  : "border-[#09263e] text-[#09263e] hover:bg-[#09263e] hover:text-white focus-visible:ring-[#1f5d57]",
              )}
            >
              <span>{t("service.discussProject")}</span>
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </EnquiryTrigger>

            {/* Menu button: below 1280px the menu lives here */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-mobile-trigger
              data-focus-id="menu"
              className={cn("size-11 xl:hidden", iconButton)}
              aria-label={menuOpen ? t("header.closeMenu") : t("header.openMenu")}
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? "rapid-navigation" : undefined}
              onClick={() => {
                setMobile(!mobile);
                setActive(null);
              }}
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </Button>
          </div>
        </div>

        {/* Desktop mega menu */}
        {live && inline && activeItem && !isPlainLink(activeItem) && (
          <div
            id="rapid-mega"
            data-menu={activeItem.key}
            className={cn(
              "rapid-mega absolute inset-x-0 top-full max-h-[calc(100dvh-var(--header-top,0px)-var(--site-header-h,84px))] overflow-y-auto overscroll-contain border-t border-slate-100 bg-white shadow-[0_12px_24px_-12px_rgba(15,35,50,0.12)]",
              MEGA_SPACING,
            )}
          >
            <div className="mx-auto w-full max-w-[1320px] px-8 pb-10">{menuContent(activeItem)}</div>
          </div>
        )}

        {/* Menu button panel (phones and tablets): an accordion, one section open at a time */}
        {live && !inline && mobile && (
          <div
            id="rapid-navigation"
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--header-top,0px)-var(--site-header-h,64px))] overflow-y-auto overscroll-contain border-b border-slate-100 bg-white shadow-lg"
          >
            <nav aria-label={t("header.mainNavigation")} className="mx-auto w-full max-w-[1320px] px-3 pb-6 pt-2 sm:px-6">
              {primary.map((item) => (
                <div key={item.key} className="border-b border-slate-100">
                  {isPlainLink(item) ? (
                    <Link
                      href={hrefFor(item.href)}
                      onClick={closeAll}
                      className="flex w-full items-center justify-between gap-2 px-1 py-4 text-left text-[17px] font-medium leading-none text-[#09263e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]"
                    >
                      <span>{itemLabel(item)}</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      data-nav-trigger
                      data-mobile-nav-trigger
                      aria-expanded={active === item.key}
                      aria-controls={`rapid-mobile-${item.key}`}
                      onClick={() => toggle(item.key)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-1 py-4 text-left text-[17px] font-medium leading-none text-[#09263e]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]",
                        active === item.key && "text-[#1f5d57]",
                      )}
                    >
                      <span>{itemLabel(item)}</span>
                      <ChevronDown
                        className={cn("size-5 shrink-0 transition-transform duration-200", active === item.key && "rotate-180")}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                  {active === item.key && !isPlainLink(item) && (
                    <div id={`rapid-mobile-${item.key}`} data-menu={item.key} className={cn("pb-5", MEGA_SPACING)}>
                      {menuContent(item)}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-5 grid gap-3">
                <EnquiryTrigger
                  source="header-menu"
                  onClick={closeAll}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#eaff6b] px-6 text-base font-semibold text-[#09263e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57] focus-visible:ring-offset-2"
                >
                  {tx("header.callbackCta", "Request a callback")}
                </EnquiryTrigger>
                <WhatsAppButton className="w-full" />
                <Link
                  href={contactPage.href}
                  onClick={closeAll}
                  className="rounded-md px-1 py-2 text-[15px] font-medium text-[#09263e] underline-offset-4 hover:underline"
                >
                  {contactPage.title}
                </Link>
                {CRM_LOGIN_URL && (
                  <a
                    href={CRM_LOGIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeAll}
                    className="inline-flex items-center gap-1.5 rounded-md px-1 py-2 text-[15px] font-medium text-[#09263e] underline-offset-4 hover:underline"
                  >
                    {tx("hdr.crmLogin", "CRM Login")}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">{tx("hdr.newTab", "(opens in a new tab)")}</span>
                  </a>
                )}
                <MobileLanguageLink services={services} />
              </div>
            </nav>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* ───────── TOP BAR (dark): announcements, contact, language ───────── */}
      <AnnouncementBar items={announcements}>
        <div className="ml-auto hidden shrink-0 items-center gap-3.5 whitespace-nowrap text-[13px] lg:flex">
          <a href={PHONE_HREF} className="inline-flex items-center gap-1.5 font-semibold text-[#eaff6b]! no-underline hover:underline">
            <Phone className="size-3.5" aria-hidden="true" />
            {PHONE_LABEL}
          </a>
          <span className="hidden h-4 w-px bg-white/25 xl:block" aria-hidden="true" />
          <a href={`mailto:${EMAIL}`} className="hidden items-center gap-1.5 text-white! no-underline hover:text-[#eaff6b]! hover:underline xl:inline-flex">
            <Mail className="size-3.5" aria-hidden="true" />
            {EMAIL}
          </a>
          {CRM_LOGIN_URL && (
            <>
              <span className="h-4 w-px bg-white/25" aria-hidden="true" />
              <a
                href={CRM_LOGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-white! no-underline hover:text-[#eaff6b]! hover:underline"
              >
                {tx("hdr.crmLogin", "CRM Login")}
                <ExternalLink className="size-3.5" aria-hidden="true" />
                <span className="sr-only">{tx("hdr.newTab", "(opens in a new tab)")}</span>
              </a>
            </>
          )}
        </div>
      </AnnouncementBar>

      {home ? (
        <>
          {/* ───────── HOME: navy bar in the page (leaves view as the page scrolls) ───────── */}
          <header
            ref={initialBar}
            data-site-header
            data-bar="initial"
            data-state={stuck ? "off" : "on"}
            inert={stuck}
            className="wb-bar-initial relative z-50 border-b border-transparent bg-[#09263e]"
          >
            {renderBar("dark")}
          </header>

          {/* ───────── HOME: white translucent bar. A zero-height sticky anchor keeps it
              out of the layout (no jump); it slides in once the navy bar is gone. ───────── */}
          <div className="wb-sticky-anchor" data-animate={animate ? "true" : "false"}>
            <header
              ref={stickyBar}
              data-site-header
              data-bar="sticky"
              data-state={stuck ? "in" : "out"}
              inert={!stuck}
              className="wb-sticky-bar border-b border-slate-100 shadow-[0_2px_10px_rgba(15,35,50,0.06)]"
            >
              {renderBar("light")}
            </header>
          </div>
        </>
      ) : (
        /* ───────── MAIN HEADER (white, sticky) ───────── */
        <header
          ref={header}
          data-site-header
          className="sticky top-0 z-50 border-b border-slate-100 bg-white shadow-[0_2px_10px_rgba(15,35,50,0.06)]"
        >
          {renderBar("light")}
        </header>
      )}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} services={services} />
    </>
  );
}
