import { Handshake, ShieldCheck, TimerReset } from "lucide-react";

import { HeroEnquiryCard } from "./hero-enquiry-card";
import { WRAP } from "@/components/home/styles";

const ROWS = [
  ["support", Handshake],
  ["success", ShieldCheck],
  ["ontime", TimerReset],
];

/**
 * Home hero, Option A: copy and three proof rows on the left, the "first check"
 * enquiry card on the right. It is a separate component so Option B's hero can
 * replace it without touching the rest of the Home sequence: HomeView only needs
 * a component that takes ({ text, page }).
 *
 * The page's single <h1> is the headline.
 */
export function HomeHero({ text, page }) {
  const t = (key) => text(`homeA.${key}`);
  // Optional wording (managed page only): the text function answers with the key itself when there is none.
  const optional = (key) => {
    const value = text(`homeA.${key}`);
    return value === `homeA.${key}` ? "" : value;
  };

  const form = Object.fromEntries(
    [
      "eyebrow",
      "title",
      "hint",
      "tabsLabel",
      "tabApproval",
      "tabSubsidy",
      "name",
      "phone",
      "phoneHint",
      "district",
      "districtPlaceholder",
      "site",
      "activity",
      "activityPlaceholder",
      "optional",
      "consent",
      "consentHelp",
      "submitApproval",
      "submitSubsidy",
      "sending",
      "sentTitle",
      "another",
    ].map((key) => [key, t(`form.${key}`)]),
  );
  form.phonePlaceholder = optional("form.phonePlaceholder");
  form.namePlaceholder = optional("form.namePlaceholder");
  form.sitePlaceholder = optional("form.sitePlaceholder");
  form.required = optional("form.required");
  const seal = { value: t("seal.value"), label: t("seal.label"), aria: t("seal.aria") };

  return (
    <section id="top" aria-labelledby="home-hero-title" className="bg-[#eaf0ec]">
      <div
        className={`${WRAP} grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-14 lg:py-20`}
      >
        <div>
          <p className="mb-4! mt-0! text-xs font-bold uppercase tracking-[0.16em] text-[#922e0c]">{t("hero.eyebrow")}</p>
          <h1
            id="home-hero-title"
            className="m-0! max-w-[18ch]! text-[2.25rem]! font-semibold! leading-[1.08]! tracking-tight! text-[#09263e]! sm:text-5xl! lg:text-[3.5rem]!"
          >
            {t("hero.title")}
          </h1>
          <p className="mb-0! mt-5! max-w-xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">{t("hero.sub")}</p>

          <ul className="m-0 mt-8 grid list-none gap-5 p-0">
            {ROWS.map(([id, Icon]) => (
              <li key={id} className="m-0 flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#1f5d57] shadow-sm ring-1 ring-[#09263e]/10">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="m-0! text-base font-semibold text-[#09263e]">{t(`hero.rows.${id}.title`)}</p>
                  <p className="mb-0! mt-0.5! text-[15px] leading-6 text-slate-700">{t(`hero.rows.${id}.text`)}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mb-0! mt-6! text-xs leading-5 text-slate-700">{t("hero.footnote")}</p>
        </div>

        <HeroEnquiryCard copy={form} seal={seal} pageTitle={page?.h1} pageId={page?.id} />
      </div>
    </section>
  );
}

export default HomeHero;
