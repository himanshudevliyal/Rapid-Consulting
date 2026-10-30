import Link from "next/link";
import { CheckCircle2, FileSearch, HelpCircle, ListChecks } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { BTN_LIME, BTN_OUTLINE, BTN_WHITE } from "@/components/home/styles";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { b2eText } from "@/lib/pages/b2e-copy";
import { copy, copyList } from "@/lib/pages/w4-copy";
import { Band, CARD, HeroBand } from "./b2e-ui";

// TODO (Rapid input, slide 22): the public name, whether the report is a sample or
// personalised, included work, fee, owner and turnaround are still to be confirmed
// by Rapid. None of them is stated on this page; add them here once agreed.

function CheckList({ items, icon: ItemIcon = CheckCircle2 }) {
  return (
    <ul className="m-0 grid list-none gap-3 p-0">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] leading-7 text-slate-700">
          <ItemIcon className="mt-1 size-5 shrink-0 text-[#1f5d57]" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// The Subsidy Viability Report: the questions it answers (hero card), the inputs it
// needs, what it contains, a sample slot, and how it leads into execution support.
// The route renders the breadcrumb row; the h1 is the report's name.
export function SvrPage({ t, locale }) {
  const name = copy(t, "svr.name");
  const text = b2eText(t);

  const questions = (
    <aside aria-labelledby="svr-questions-title" className={CARD}>
      <h2 id="svr-questions-title" className="m-0! mb-5! text-xl! font-semibold! leading-snug! tracking-tight! text-[#09263e]!">
        {copy(t, "svr.questions.heading")}
      </h2>
      <CheckList items={copyList(t, "svr.questions.items")} icon={HelpCircle} />
    </aside>
  );

  return (
    <main id="main">
      <HeroBand
        id="svr-title"
        eyebrow={text("svr.eyebrow")}
        title={name}
        intro={<p>{copy(t, "svr.hero.intro")}</p>}
        actions={
          <>
            <EnquiryTrigger className={BTN_LIME} source="svr" kind="svr" serviceName={name}>
              {copy(t, "svr.execution.cta")}
              <span aria-hidden="true">→</span>
            </EnquiryTrigger>
            <a href="#report-contents" className={BTN_OUTLINE}>
              {text("svr.seeContents")}
            </a>
          </>
        }
        aside={questions}
      />

      <Band id="report-contents" labelledBy="svr-inputs-title">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="rounded-3xl border border-slate-200 bg-[#f6f8f6] p-6 sm:p-8">
            <SectionHeading
              id="svr-inputs-title"
              eyebrow={copy(t, "svr.inputs.eyebrow")}
              title={copy(t, "svr.inputs.heading")}
              intro={copy(t, "svr.inputs.intro")}
            />
            <div className="mt-6">
              <CheckList items={copyList(t, "svr.inputs.items")} icon={ListChecks} />
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-[#f6f8f6] p-6 sm:p-8">
            <SectionHeading eyebrow={copy(t, "svr.contents.eyebrow")} title={copy(t, "svr.contents.heading")} />
            <div className="mt-6">
              <CheckList items={copyList(t, "svr.contents.items")} />
            </div>
          </div>
        </div>
      </Band>

      <Band tone="sage" labelledBy="svr-sample-title">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeading id="svr-sample-title" eyebrow={copy(t, "svr.sample.eyebrow")} title={copy(t, "svr.sample.heading")} />
          <ImagePlaceholder ratio="4/3" label={copy(t, "svr.sample.label")} icon={FileSearch} className="rounded-2xl">
            <span className="text-xs text-slate-700">{copy(t, "svr.sample.caption")}</span>
          </ImagePlaceholder>
        </div>
      </Band>

      <Band tone="navy" labelledBy="svr-execution-title">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            id="svr-execution-title"
            tone="dark"
            eyebrow={copy(t, "svr.execution.eyebrow")}
            title={copy(t, "svr.execution.heading")}
            intro={copy(t, "svr.execution.body")}
          />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <EnquiryTrigger className={BTN_LIME} source="svr" kind="svr" serviceName={name}>
              {copy(t, "svr.execution.cta")}
              <span aria-hidden="true">→</span>
            </EnquiryTrigger>
            <Link href={`/${locale}/schemes`} className={BTN_WHITE}>
              {copy(t, "svr.execution.schemes")}
            </Link>
            <Link href={`/${locale}/services`} className={BTN_WHITE}>
              {copy(t, "svr.execution.services")}
            </Link>
          </div>
          <p className="mb-0! mt-6! text-sm text-white/75">{copy(t, "svr.execution.note")}</p>
        </div>
      </Band>
    </main>
  );
}
