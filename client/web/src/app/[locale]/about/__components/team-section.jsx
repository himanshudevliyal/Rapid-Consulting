import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";
import { loadTeam } from "@/lib/content/site-data";

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

// The people of the About page, straight from the API (Advisers in the admin
// panel), under their group headings. Hidden when nobody has been added yet.
export async function TeamSection() {
  const groups = await loadTeam();
  if (!groups.length) return null;

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
        subheading="Meet the people behind the advice, coordination and follow-through."
        headingClassName="text-[2.6rem] leading-[1.1] font-bold tracking-tight text-[#111] mt-0 text-wrap-balance lg:text-[3rem]"
      />

      {groups.map((group) => (
        <div key={group.title || "team"} className="mt-10">
          {group.title && (
            <h3 className="mb-5 text-xl font-semibold text-[#09263e]">{group.title}</h3>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {group.members.map((member) => (
              <div
                key={member.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8ede6] bg-[#fafaf7] shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[3/3.5] w-full overflow-hidden bg-[#e8ede6]">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex size-full items-center justify-center text-5xl font-semibold text-[#1f5d57]/60"
                      aria-hidden="true"
                    >
                      {initials(member.name)}
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-3 px-4 py-4">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="text-md m-0 font-bold leading-snug text-[#09263e]">{member.name}</p>
                    {member.designation && <p className="m-0 text-sm text-slate-500">{member.designation}</p>}
                    {member.bio && <p className="mt-2 mb-0 line-clamp-4 text-sm text-slate-600">{member.bio}</p>}
                  </div>

                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${member.name}'s profile`}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#d6e6d1] bg-white text-[#1f5d57] transition-colors hover:bg-[#1f5d57] hover:text-white"
                    >
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Section>
  );
}
