import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Html, Icon } from "./content-primitives";

// ✏️ Optional: har step ki photo (public/ ke andar). Khaali rakho to green gradient dikhega.
const STEP_IMAGES = [
   "/assets/hero-section.jpg",
   "/assets/hero-section.jpg",
   "/assets/hero-section.jpg",
];
const STEP_ICONS = ["factory", "chart-line-up", "target"];
const STAGGER = 64; // px: har agla card itna neeche (lg+)

const strip = (s = "") =>
  s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

// <h3> block -> { title, action:{href,label}[], body(html) }
function parseBlock(block) {
  const title = strip(block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1]);
  const actions = [];
  const body = block
    .replace(/<h3[^>]*>[\s\S]*?<\/h3>/, "")
    .replace(/<p>\s*<a\b([^>]*)>([\s\S]*?)<\/a>\s*<\/p>/g, (_, attrs, label) => {
      const href = attrs.match(/href="([^"]*)"/)?.[1];
      if (href) actions.push({ href, label: strip(label).replace(/\s*[↗→]\s*$/, "") });
      return "";
    });
  return { title, actions, body };
}

// Dashed green arc: card i ke dot se card i+1 ke dot tak (sirf desktop)
function Arc() {
  const top = 70;
  const h = top + STAGGER;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 100 ${h}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute left-1/2 z-0 hidden w-[calc(100%+2rem)] lg:block"
      style={{ top: -top, height: h }}
    >
      <path
        d={`M0,${top} C25,-8 75,-8 100,${h}`}
        fill="none"
        stroke="#1f5d57"
        strokeWidth="1.5"
        strokeDasharray="5 5"
        vectorEffect="non-scaling-stroke"
        opacity="0.7"
      />
    </svg>
  );
}

/** Shared presentation for the project-stage choices on Home and Industries. */
export function ProjectStages({ html, stepLabel = "Step" }) {
  const firstHeading = html.search(/<h3[\s>]/);
  const intro = firstHeading < 0 ? html : html.slice(0, firstHeading);
  const stages = [...html.matchAll(/<h3[^>]*>[\s\S]*?<\/h3>[\s\S]*?(?=<h3[\s>]|$)/g)]
    .map((m) => parseBlock(m[0]))
    .filter((s) => s.title);

  return (
    <>
      {intro.trim() && (
        <Html
          html={intro}
          className="project-stages-intro mx-auto mb-10 max-w-3xl text-center text-base leading-8 text-slate-600 [&_p]:m-0"
        />
      )}

      <ol
        className="relative grid list-none gap-8 p-0 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))] lg:pt-20"
        style={{ "--cols": Math.min(Math.max(stages.length, 1), 5) }}
      >
        {stages.map((stage, i) => (
          <li key={i} className="relative lg:mt-[calc(var(--i)*64px)]" style={{ "--i": i }}>
            {/* connector dot + arc (desktop only, mobile par hidden) */}
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-0 z-20 hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#1f5d57] shadow lg:block"
            />
            {i < stages.length - 1 && <Arc />}

            <article className=" relative z-10 flex flex-col rounded-2xl bg-white p-2.5 shadow-[0_10px_40px_-15px_rgba(9,38,62,0.25)] transition-transform duration-300 hover:-translate-y-1">
              {/* image + green overlay + number */}
              <div className="relative flex h-[190px] shrink-0 items-end overflow-hidden rounded-xl bg-gradient-to-br from-[#1f5d57] to-[#09263e] p-5">
                {STEP_IMAGES[i] && (
                  <Image src={STEP_IMAGES[i]} alt="" fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
                )}
                <span aria-hidden="true" className="absolute inset-0 bg-[#1f5d57]/80" />
                <span className="absolute right-4 top-4 text-[#eaff6b] [&_svg]:size-6">
                  <Icon name={STEP_ICONS[i] || "target"} />
                </span>
                <div className="relative flex items-end gap-3 text-white!">
                  <span className="text-[5.5rem] font-extralight leading-[0.85]">{i + 1}</span>
                  <span className="pb-1 text-base font-medium leading-tight">{stepLabel}</span>
                </div>
              </div>

              {/* content */}
              <div className="flex flex-1 flex-col px-3 pb-4 pt-5">
                <h3 className="text-xl font-medium text-[#071f33]">{stage.title}</h3>
                <Html
                  html={stage.body}
                  className="mt-2 text-[15px] leading-7 text-slate-600 [&_p]:m-0 [&_p+p]:mt-2"
                />
                {stage.actions.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    {stage.actions.map((a) => (
                      <a
                        key={a.href + a.label}
                        href={a.href}
                        className="project-stage-action inline-flex items-center gap-2 rounded-full bg-[#eaff6b] px-4 py-2 text-sm font-semibold text-[#09263e] transition-colors hover:bg-[#dcf24f]"
                      >
                        {a.label}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </li>
        ))}
      </ol>
    </>
  );
}