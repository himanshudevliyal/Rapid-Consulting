import { CalendarDays, ListChecks, Users } from "lucide-react";

import placeholders from "@/lib/data/home-placeholders.json";
import { WRAP } from "@/components/home/styles";
import { rows, text as str } from "@/lib/content/managed-text";

const ICONS = { calendar: CalendarDays, checklist: ListChecks, people: Users };

/**
 * "Rapid, in numbers." Three stat tiles and one green tile. The values come from
 * lib/data/home-placeholders.json and stay "XX" until Rapid confirms real
 * figures: while they are placeholders a visible note says so.
 */
export function NumbersStrip({ text, data }) {
  const t = (key) => text(`homeA.numbers.${key}`);
  const { items: base, disbursed: baseDisbursed, placeholder: basePlaceholder } = placeholders.stats;
  // Figures the managed page leaves empty (the design shows XX) keep the placeholder.
  const given = rows(data?.items);
  const items = base.map((item, index) => ({ ...item, value: str(given[index]?.value) || item.value }));
  const disbursed = { ...baseDisbursed, value: str(data?.panel_value) || baseDisbursed.value };
  const placeholder = basePlaceholder && (items.some((item) => /X/.test(item.value)) || /X/.test(disbursed.value));

  return (
    <section aria-labelledby="home-numbers-title" className="bg-white py-10 sm:py-14">
      <div className={WRAP}>
        <h2
          id="home-numbers-title"
          className="m-0! max-w-none! text-2xl! font-semibold! leading-tight! tracking-tight! text-[#09263e]! sm:text-3xl!"
        >
          {t("title")}
        </h2>

        <ul className="m-0 mt-6 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.25fr)]">
          {items.map(({ id, icon, value }) => {
            const Icon = ICONS[icon] ?? CalendarDays;
            return (
              <li key={id} className="m-0 flex items-center gap-4 rounded-2xl border border-slate-200 bg-[#f6f8f6] p-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#1f5d57] ring-1 ring-[#09263e]/10">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="m-0! text-3xl font-bold leading-none tracking-tight text-[#09263e]">{value}</p>
                  <p className="mb-0! mt-1.5! text-sm leading-5 text-slate-700">{t(id)}</p>
                </div>
              </li>
            );
          })}
          <li className="m-0 flex items-center gap-4 rounded-2xl bg-[#1f5d57] p-5 text-white">
            <div className="min-w-0">
              <p className="m-0! text-3xl font-bold leading-none tracking-tight text-white">{disbursed.value}</p>
              <p className="mb-0! mt-1.5! text-sm leading-5 text-white/90">{t("disbursed")}</p>
            </div>
          </li>
        </ul>

        {placeholder && <p className="mb-0! mt-3! text-xs leading-5 text-slate-600">{t("placeholder")}</p>}
      </div>
    </section>
  );
}

export default NumbersStrip;
