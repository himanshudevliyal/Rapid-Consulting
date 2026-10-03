import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Section from "@/components/layout/section";
import { Html } from "@/components/pages/content-primitives";
import Heading from "@/components/layout/heading";

const APPROACH_IMAGE = "/assets/hero-section.jpg"; // <- apni team / meeting photo yahan lagao

export function ApproachSection({
  id,
  eyebrow,
  title,
  paragraphs = [],
  alternate,
  alternateLocale,
  ctaHref = "#contact",
  ctaLabel = "Talk to us",
  image = APPROACH_IMAGE,
}) {
  const [lead, ...rest] = paragraphs;

  return (
    <Section
      id={id}
      className="relative overflow-hidden bg-gray-50 py-16 lg:py-24"
    >
      <div className="relative mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
        <div>
          <Heading
            className="mx-auto max-w-3xl text-start"
            eyebrow={eyebrow}
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
            heading={title}
            headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl"
            subheading={alternate}
          />

          <div>
            {lead && (
              <Html
                html={lead}
                className="text-lg leading-relaxed text-[#56677b] md:text-xl [&_p]:m-0"
              />
            )}

            {rest.length > 0 && (
              <Html
                html={rest.join("")}
                className="mt-5 max-w-xl text-base leading-relaxed text-[#56677b] [&_p]:m-0 [&_p+p]:mt-4"
              />
            )}

            <a
              href={ctaHref}
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#09263e] py-2 pl-6 pr-2 text-base font-semibold text-white! shadow-sm transition-all duration-300 hover:bg-[#1f5d57] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
            >
              {ctaLabel}
              <span className="flex size-9 items-center justify-center rounded-full bg-[#eaff6b] text-[#09263e] transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>

        {/* Image with decorative border */}
        <div className="relative">
          <div
            className="absolute -right-3 -top-3 size-full rounded-2xl border-2 border-[#eaff6b]/60"
            aria-hidden="true"
          />
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#eaf0f4]">
            <Image
              src={image}
              alt=""
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
