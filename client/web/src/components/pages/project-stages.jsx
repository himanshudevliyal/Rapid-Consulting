import { ArrowUpRight } from "lucide-react";
import { Html, Icon } from "./content-primitives";

const STAGE_ICONS = ["factory", "chart-line-up", "target"];

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

/**
 * The project types of a section as data: the section's <h3> headings with the
 * text and the link paragraphs under each. Used by ProjectStages (cards) and by
 * the industry page (the "What are you setting up?" picker).
 *   -> [{ title, body (html), actions: [{ href, label }] }]
 */
export function parseProjectStages(html = "") {
  return [...String(html).matchAll(/<h3[^>]*>[\s\S]*?<\/h3>[\s\S]*?(?=<h3[\s>]|$)/g)]
    .map((m) => parseBlock(m[0]))
    .filter((s) => s.title);
}

/**
 * The project-stage choices (new facility, expansion, a specific requirement)
 * on Home and Industries. They are peer situations, not a sequence: no step
 * numbers, no connecting line, no stagger. Extra props from older callers
 * (`stepLabel`) are ignored.
 */
export function ProjectStages({ html }) {
  const firstHeading = html.search(/<h3[\s>]/);
  const intro = firstHeading < 0 ? html : html.slice(0, firstHeading);
  const stages = parseProjectStages(html);

  return (
    <>
      {intro.trim() && (
        <Html
          html={intro}
          className="project-stages-intro mx-auto mb-10 max-w-3xl text-center text-base leading-8 text-slate-600 [&_p]:m-0"
        />
      )}

      <ul
        className="m-0 grid list-none gap-5 p-0 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
        style={{ "--cols": Math.min(Math.max(stages.length, 1), 4) }}
      >
        {stages.map((stage, i) => (
          <li key={i} className="m-0 flex">
            <article className="flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg sm:p-7">
              <span
                aria-hidden="true"
                className="flex size-12 items-center justify-center rounded-xl bg-[#e8efec] text-[#1f5d57] [&_svg]:size-6"
              >
                <Icon name={STAGE_ICONS[i] || "target"} />
              </span>

              <h3 className="mb-0! mt-5! text-xl! font-semibold! leading-snug! tracking-tight! text-[#071f33]!">
                {stage.title}
              </h3>
              <Html
                html={stage.body}
                className="mt-2 text-[15px] leading-7 text-slate-700 [&_p]:m-0 [&_p+p]:mt-2"
              />
              {stage.actions.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  {stage.actions.map((a) => (
                    <a
                      key={a.href + a.label}
                      href={a.href}
                      className="project-stage-action inline-flex items-center gap-2 rounded-full bg-[#eaff6b] px-4 py-2 text-sm font-semibold text-[#09263e]! no-underline transition-colors hover:bg-[#dcf24f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e]"
                    >
                      {a.label}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
