import Image from "next/image";
import { ChevronRight } from "lucide-react";
import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";
import Link from "next/link";

const STATS = [
  {
    value: "350+",
    label: "Successful Cases",
    desc: "Strategies delivered across diverse industries and markets.",
  },
  {
    value: "20+",
    label: "Years Of Experience",
    desc: "Decades of expertise guiding businesses toward sustainable growth.",
  },
  {
    value: "278k",
    label: "Trusted Clients",
    desc: "Businesses worldwide empowered through our consulting solutions.",
  },
  {
    value: "18+",
    label: "Master Certification",
    desc: "Industry-recognized credentials backing every solution we deliver.",
  },
];

export function TrustedSection({ t }) {
  return (
    <Section
      as="div"
      className="bg-white"

    >
      {/* ── Top row: photo left · headline right ── */}
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        {/* Photo */}
        <div className="w-full shrink-0 lg:w-[52%]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 lg:aspect-[3/2]">
            <Image
              src="/assets/hero-section.jpg"
              alt="Consulting professional"
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover object-center"
              priority
            />
          </div>
        </div>

        {/* Heading + CTA */}
        <div className="flex flex-col items-start gap-8 lg:max-w-md">
          <Heading
            eyebrow= "Trusted Experience"
            heading= "Solutions That Inspire Progress"
            className="text-left"
            subheading=" Expert guidance. Ownership through execution. Rapid Consulting brings subsidy expertise, approval support, and project advisory together to help businesses across Haryana navigate opportunities, streamline approvals, and move projects forward with greater clarity and confidence.
"
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
            headingClassName="text-[2.6rem] leading-[1.1] font-bold tracking-tight text-[#111] mt-0 text-wrap-balance lg:text-[3rem]"
          />

          <Link
          href="/contact"
              className="  flex items-center h-14 rounded-full bg-[#eaff6b] pl-7 pr-2 text-[16px] font-medium text-[#09263e] shadow-none hover:bg-[#dcf24f] sm:inline-flex"
            >
           
                <span>Contact Us</span>
                <span className="ml-3 flex size-10 items-center justify-center rounded-full bg-[#09263e] text-white!">
                  <ChevronRight className="size-5" aria-hidden="true" />
                </span>
             
            </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className=" grid grid-cols-2 gap-x-8 gap-y-10  pt-12 sm:grid-cols-4  lg:gap-x-12">
        {STATS.map(({ value, label, desc }) => (
          <div key={label} className="flex flex-col gap-3 border-t-2 border-slate-200 pt-10">
            <p className="text-[2.6rem] font-bold leading-none tracking-tight text-[#111] sm:text-5xl lg:text-[3.25rem]">
              {value}
            </p>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-[#111]">{label}</p>
              <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
