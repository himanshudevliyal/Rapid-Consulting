import { ArrowRight, ArrowUpRight } from "lucide-react";

import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { BTN_LIME, BTN_WHITE, WRAP } from "@/components/home/styles";
import { mainSiteHref } from "@/lib/site";

const PHOTO = "/assets/home-approach.jpg";

/**
 * The Rapid Approach: one rounded navy panel with the photograph (two people
 * reviewing a site file) on its right, fading into the navy so the text on the
 * left stays readable. Heading on top; under a thin rule, the short promise on
 * the left and the two actions on the right. The only accent colour is the
 * lime action.
 */
export function ApproachSection({ text, title, locale, learnHref }) {
  const t = (key) => text(`homeA.approach.${key}`);

  return (
    <section id="approach" aria-labelledby="home-approach-title" className="scroll-mt-24 bg-white py-12 sm:py-16 lg:py-20">
      <div className={WRAP}>
        <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#09263e] text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PHOTO}
            alt=""
            aria-hidden="true"
            width="1600"
            height="547"
            loading="lazy"
            decoding="async"
            className="absolute inset-y-0 right-0 -z-10 !h-full !w-full !max-w-none object-cover object-[72%_center] lg:!w-[62%]"
          />
          {/* Navy from the left (and from the bottom on small screens) over the photo. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-[#09263e] via-[#09263e]/85 to-[#09263e]/40 lg:bg-gradient-to-r lg:from-[#09263e] lg:from-40% lg:via-[#09263e]/75 lg:via-60% lg:to-[#09263e]/10"
          />

          <div className="px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <p className="mb-4! mt-0! text-xs font-bold uppercase tracking-[0.16em] text-white/85">{t("eyebrow")}</p>
            <h2
              id="home-approach-title"
              className="m-0! max-w-[22ch]! text-[2rem]! font-semibold! leading-[1.12]! tracking-tight! text-white! sm:text-4xl! lg:text-[2.75rem]!"
            >
              {title || t("title")}
            </h2>

            <hr className="my-7 border-0 border-t border-white/20 lg:max-w-[58%]" />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <p className="m-0! text-lg font-semibold leading-snug text-white">{t("bold")}</p>
                <p className="mb-0! mt-2! text-[15px] leading-6 text-white/85">{t("text")}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:shrink-0">
                <a href={learnHref || mainSiteHref("A01", locale)} className={BTN_LIME}>
                  {t("learn")}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
                <EnquiryTrigger source="home-approach" className={BTN_WHITE}>
                  {t("discuss")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </EnquiryTrigger>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
