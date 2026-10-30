/**
 * HowWeHirePage - "How We Hire" (U03), in the batch-2 look.
 *
 *   1. Hero: eyebrow, h1, introduction, buttons
 *   2. The steps as numbered cards (from page.sections)
 *   3. Back to the open roles
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BTN_LIME } from "@/components/home/styles";
import { Html } from "@/components/pages/content-primitives";
import { Band, H3_CLASS, HeroBand, PROSE_CARD } from "@/components/pages/b2e-ui";
import { b2eText } from "@/lib/pages/b2e-copy";

const STEP_NUMBERS = ["01", "02", "03", "04", "05", "06"];

export function HowWeHirePage({ page, t }) {
  const text = b2eText(t);
  const steps = page.sections ?? [];

  return (
    <main id="main">
      <HeroBand
        id="hire-title"
        eyebrow={text("careers.hireEyebrow")}
        title={page.h1}
        intro={<Html html={page.introHtml} />}
        actions={
          <Link href={`/${page.locale}/careers`} className={BTN_LIME}>
            {text("careers.applyBack")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />

      {steps.length > 0 && (
        <Band>
          <ol className="m-0 grid list-none gap-6 p-0 md:grid-cols-2">
            {steps.map((step, index) => (
              <li
                key={step.id}
                id={step.id}
                className="b2e-anchor m-0 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#09263e] text-sm font-bold text-[#eaff6b]"
                >
                  {STEP_NUMBERS[index] ?? String(index + 1).padStart(2, "0")}
                </span>
                <h2 className={H3_CLASS}>{step.title}</h2>
                <Html html={step.html} className={PROSE_CARD} />
              </li>
            ))}
          </ol>
        </Band>
      )}
    </main>
  );
}
