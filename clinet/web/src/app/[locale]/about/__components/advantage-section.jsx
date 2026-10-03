import {
  Building2,
  FileCheck2,
  Network,
  BookOpen,
} from "lucide-react";
import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";

const CARDS = [
  {
    icon: Building2,
    title: "Support shaped around your business",
    desc: "We start with your activity, site, investment and stage of work. A food-processing unit, manufacturing plant, recycling facility and warehouse need different inputs. Your requirement defines the assignment.",
  },
  {
    icon: FileCheck2,
    title: "Ownership of the agreed work",
    desc: "We define the scope, prepare the documents within it and coordinate applications and follow-ups through the agreed stages. You know which work Rapid is handling and what is needed from your team.",
  },
  {
    icon: Network,
    title: "Coordination across the project",
    desc: "Your CA, architect, plant manager, equipment supplier and banker may each hold part of the information. We help connect those inputs so the advisory work can move forward with a consistent set of project records.",
  },
  {
    icon: BookOpen,
    title: "Experience you can examine",
    desc: "See the location, investment scale and work undertaken in our manufacturing capital-subsidy, testing-equipment subsidy and safety-equipment subsidy case studies. The stated investment figures describe the project or equipment, not company turnover or subsidy received.",
    links: [
      { label: "manufacturing capital-subsidy", href: "/p/RC-CS05" },
      { label: "testing-equipment subsidy",      href: "/p/RC-CS06" },
      { label: "safety-equipment subsidy",       href: "/p/RC-CS03" },
    ],
  },
];

// Renders the last card's description with inline links
function CardDesc({ desc, links }) {
  if (!links?.length) {
    return <p className="mt-5 text-[15px] leading-relaxed text-slate-500">{desc}</p>;
  }

  // Split the description around each link label and weave in <a> elements
  const parts = [];
  let remaining = desc;
  links.forEach(({ label, href }) => {
    const idx = remaining.indexOf(label);
    if (idx === -1) return;
    parts.push(remaining.slice(0, idx));
    parts.push(
      <a
        key={href}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[#1f5d57] underline underline-offset-2 hover:text-[#09263e]"
      >
        {label}
      </a>
    );
    remaining = remaining.slice(idx + label.length);
  });
  parts.push(remaining);

  return (
    <p className="mt-5 text-[15px] leading-relaxed text-slate-500">
      {parts}
    </p>
  );
}

export function AdvantageSection({ t }) {
  const eyebrow = t ? t("site.advantage.eyebrow") : "The Rapid Advantage";
  const heading = t ? t("site.advantage.heading") : "The Vision Driving Our Consulting Services";
  const body    = t ? t("site.advantage.body")    : "We are dedicated to helping businesses unlock their full potential through strategic guidance, innovative solutions, and industry-focused expertise. With years of experience across diverse sectors, our team brings the right inputs to every assignment.";

  return (
    <Section
      as="div"
      className="bg-[#fafaf8] py-16 lg:py-24"
      containerClassName="px-4 sm:px-6 lg:px-8"
    >
      {/* ── Top header row ── */}
      <div className="mb-14   gap-8 lg:mb-16  ">

                  <Heading
                    eyebrow={eyebrow}
                    heading={heading}
                    className="text-center "
                    subheading={body}
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
                    headingClassName="text-[2.6rem] leading-[1.1] font-bold tracking-tight text-[#111] mt-0 text-wrap-balance lg:text-[3rem]"
                  />

      </div>

      {/* ── Feature cards grid ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map(({ icon: Icon, title, desc, links }) => (
          <div
            key={title}
            className="flex flex-col rounded-2xl bg-[#f0ede8] p-6 lg:p-7"
          >
            {/* Icon badge */}
            <span className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-[#09263e] text-white">
              <Icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
            </span>

            {/* Title */}
            <p className="text-[15px] font-bold leading-snug text-[#09263e]">
              {title}
            </p>

            {/* Description */}
            <CardDesc desc={desc} links={links} />
          </div>
        ))}
      </div>
    </Section>
  );
}
