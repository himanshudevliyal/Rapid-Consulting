"use client";

import { useEffect, useState } from "react";
import { SectionNav } from "./section-nav";

/**
 * Wraps SectionNav with IntersectionObserver-based active section detection.
 *
 * Observes all section elements matching the given section ids and tracks
 * which one is currently most visible in the viewport.
 *
 * Props are identical to SectionNav — sections, title, label — no activeId
 * needed (this component computes it).
 */
export function ActiveSectionNav({ sections = [], title, label }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (!sections.length) return;

    // rootMargin accounts for the sticky header + nav itself (~160px at top)
    // so a section is only "active" once it's properly within the view area.
    const observer = new IntersectionObserver(
      (entries) => {
        // Among all currently-intersecting sections, pick the one nearest the top.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-160px 0px -40% 0px",
        threshold: 0,
      },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <SectionNav
      sections={sections}
      title={title}
      label={label}
      activeId={activeId}
    />
  );
}
