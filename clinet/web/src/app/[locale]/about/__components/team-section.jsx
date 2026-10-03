import Image from "next/image";
import { Share2 } from "lucide-react";
import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";

const TEAM = [
  {
    name: "James Carter",
    role: "Senior Manager",
    image: "/assets/hero-section.jpg",
    href: "#",
  },
  {
    name: "Jerome Bell",
    role: "Senior Manager",
    image: "/assets/hero-section.jpg",
    href: "#",
  },
  {
    name: "Wade Warren",
    role: "Senior Manager",
    image: "/assets/hero-section.jpg",
    href: "#",
  },
  {
    name: "Robertson",
    role: "Senior Manager",
    image: "/assets/hero-section.jpg",
    href: "#",
  },
];

export function TeamSection({ t }) {
  const heading = t ? t("site.team.heading") : "The Faces Behind Our Trusted Services";

  return (
    <Section
      as="div"
      className="bg-white py-16 lg:py-24"
      containerClassName="px-4 sm:px-6 lg:px-8"
    >
              <Heading
                eyebrow="our team"
                heading="The Rapid Team"
                className="text-center"
                subheading="Meet the people behind the advice, coordination and follow-through. Select a card to view that person's profile."
                headingClassName="text-[2.6rem] leading-[1.1] font-bold tracking-tight text-[#111] mt-0 text-wrap-balance lg:text-[3rem]"
              />

      {/* Team cards grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM.map(({ name, role, image, href }) => (
          <div
            key={name}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8ede6] bg-[#fafaf7] shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Photo */}
            <div className="relative aspect-[3/3.5] w-full overflow-hidden">
              <Image
                src={image}
                alt={name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Info row */}
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex flex-col gap-0.5">
                <p className="text-md font-bold leading-snug text-[#09263e]">{name}</p>
                <p className="text-sm text-slate-500">{role}</p>
              </div>

              {/* Share / profile link */}
              <a
                href={href}
                aria-label={`View ${name}'s profile`}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#d6e6d1] bg-white text-[#1f5d57] transition-colors hover:bg-[#1f5d57] hover:text-white"
              >
                <Share2 className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
