"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { cn } from "@/lib/utils";
import { Html } from "./content-primitives";

// "What are you setting up?" -> "Your project".
//
// ProjectPicker is a row of navy cards: the selected project type is the wide
// card (its text, links and button), the others are narrow buttons that open in
// place (aria-expanded).
// ProjectCardLink is a row of the hero card: it selects that type in the panel
// and scrolls to the panel. The selection follows the address: #project-<id>
// selects (and scrolls on load, back / forward and when the hash changes).

export const PROJECT_SECTION_ID = "your-project";
export const PROJECT_EVENT = "b2b-select-project";
const hashFor = (id) => `#project-${id}`;
const idFromHash = (hash) => {
  const match = /^#project-(.+)$/.exec(hash || "");
  if (!match) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return "";
  }
};

function scrollToPanel() {
  const target = document.getElementById(PROJECT_SECTION_ID);
  if (!target) return;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

// A row of the hero card. Without JavaScript it is a plain link to the panel.
export function ProjectCardLink({ id, title, hint, className }) {
  const onClick = (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.pushState(null, "", hashFor(id));
    window.dispatchEvent(new CustomEvent(PROJECT_EVENT, { detail: { id, scroll: true } }));
  };
  return (
    <a href={`#${PROJECT_SECTION_ID}`} onClick={onClick} className={className}>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold leading-snug text-[#09263e]">{title}</span>
        {hint && <span className="mt-0.5 block text-sm leading-5 text-slate-600">{hint}</span>}
      </span>
      <ArrowDownRight className="size-5 shrink-0 text-[#09263e] transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
    </a>
  );
}

export function ProjectPicker({ projects, related = [], labels, industryName, headingId, heading, intro, eyebrow }) {
  const [active, setActive] = useState(projects[0]?.id ?? "");
  const known = useCallback((id) => projects.some((project) => project.id === id), [projects]);

  // Follow the address (load, back / forward) and the hero card.
  useEffect(() => {
    const fromHash = () => {
      const id = idFromHash(window.location.hash);
      if (id && known(id)) {
        setActive(id);
        return true;
      }
      return false;
    };
    if (fromHash()) requestAnimationFrame(() => requestAnimationFrame(scrollToPanel));
    const onHash = () => {
      if (fromHash()) scrollToPanel();
    };
    const onSelect = (event) => {
      const { id, scroll } = event.detail || {};
      if (!known(id)) return;
      setActive(id);
      if (scroll) requestAnimationFrame(scrollToPanel);
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    window.addEventListener(PROJECT_EVENT, onSelect);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
      window.removeEventListener(PROJECT_EVENT, onSelect);
    };
  }, [known]);

  const choose = (id) => {
    setActive(id);
    // keep the address shareable without adding history entries or jumping
    try {
      window.history.replaceState(null, "", hashFor(id));
    } catch {
      // the selection still works without the address
    }
  };

  return (
    <div className="b2b-wrap">
      <div className="max-w-3xl">
        {eyebrow && <p className="b2b-eyebrow">{eyebrow}</p>}
        <h2 id={headingId} className="b2b-h2">
          {heading}
        </h2>
        {intro && <Html html={intro} className="b2b-prose mt-3" />}
      </div>

      {/* One wide card (the selected project type: text, links and button) and the
          others narrow; pressing a narrow card opens it in place. */}
      <ul className="m-0 mt-8 flex list-none flex-col gap-3 p-0 lg:min-h-[440px] lg:flex-row" aria-label={labels.tabs}>
        {projects.map((project) => {
          const open = project.id === active;
          return (
            <li
              key={project.id}
              id={`project-panel-${project.id}`}
              className={cn(
                "relative m-0 min-w-0 overflow-hidden rounded-3xl bg-[#0d2f4f] text-white transition-[flex-grow] duration-300 motion-reduce:transition-none",
                open ? "lg:flex-[3.4]" : "lg:flex-1",
              )}
            >
              {open ? (
                <div className="flex h-full flex-col justify-end p-6 sm:p-7">
                  <h3 className="m-0! text-xl! font-semibold! leading-snug! text-white! sm:text-2xl!">{project.title}</h3>
                  <Html html={project.body} className="b2b-prose b2b-prose--on-navy mt-3 max-w-xl" />
                  {/* The project type's own links; the industry's links only when it has none. */}
                  {(project.actions.length > 0 || related.length > 0) && (
                    <ul className="m-0 mt-4 grid list-none gap-2 p-0" aria-label={labels.related}>
                      {(project.actions.length > 0 ? project.actions : related).map((link) => (
                        <li key={`${link.href}-${link.label}`} className="m-0">
                          <a
                            href={link.href}
                            className="inline-flex items-center gap-1 text-[15px] text-white! underline decoration-white/50 underline-offset-4 hover:decoration-white"
                          >
                            {link.label}
                            <ArrowUpRight className="size-4" aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  <EnquiryTrigger
                    className="mt-6 inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-xl bg-[#eaff6b] px-5 py-2.5 text-sm font-semibold text-[#09263e] transition-colors hover:bg-[#dcf24f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eaff6b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d2f4f]"
                    source="industry-project"
                    serviceName={`${industryName}: ${project.title}`}
                  >
                    {labels.cta}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </EnquiryTrigger>
                </div>
              ) : (
                <button
                  type="button"
                  aria-expanded="false"
                  aria-controls={`project-panel-${project.id}`}
                  onClick={() => choose(project.id)}
                  className="flex h-full min-h-[76px] w-full flex-col justify-end p-5 text-left text-[15px] font-semibold leading-snug text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#eaff6b] lg:min-h-0"
                >
                  {project.title}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
