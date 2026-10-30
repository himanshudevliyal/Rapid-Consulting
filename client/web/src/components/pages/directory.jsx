"use client";

import { ResourceExplorer } from "./resource-explorer";
import { SchemeDirectory } from "./scheme-directory";

// Entry point kept for the collection pages: each kind of archive has its own
// behaviour contract (docs: interaction handover), so this only picks the one
// that matches.
//   kind "schemes"  -> R02 scheme directory (filter rows, Other matches)
//   anything else   -> the Resources explorer (articles, guides, reports)
// The case archive (W00) lives with its page in app/[locale]/case-studies.
export function Directory({ items, kind, industries = [], industry = "", filters = {}, defaultFormat = "all" }) {
  if (kind === "schemes") {
    return <SchemeDirectory items={items} industries={industries} initial={{ industry, ...filters }} />;
  }
  return <ResourceExplorer items={items} defaultFormat={defaultFormat} initial={filters} />;
}
