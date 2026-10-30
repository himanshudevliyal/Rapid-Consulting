import { Info, TriangleAlert, StickyNote } from "lucide-react";

import { Html } from "@/components/common/html";
import { hasHtml } from "@/lib/content/site-page-adapters";
import { BlockShell } from "./shared";

const TONES = {
  info: { icon: Info, label: ["toneInfo", "Good to know"], box: "border-[#1f5d57]/30 bg-[#e8efec]", mark: "text-[#1f5d57]" },
  caution: { icon: TriangleAlert, label: ["toneCaution", "Please note"], box: "border-amber-300 bg-amber-50", mark: "text-amber-700" },
  note: { icon: StickyNote, label: ["toneNote", "Note"], box: "border-slate-300 bg-slate-50", mark: "text-slate-600" },
};

export function CalloutBlock({ section, ctx }) {
  const tone = TONES[section.data.tone] ?? TONES.info;
  const Icon = tone.icon;
  const label = ctx.tx(...tone.label);
  return (
    <BlockShell section={section} ctx={ctx} ariaLabel={section.label || label}>
      <div role="note" aria-label={label} className={`flex gap-4 rounded-2xl border p-5 sm:p-6 ${tone.box}`}>
        <Icon className={`mt-0.5 size-5 shrink-0 ${tone.mark}`} aria-hidden="true" />
        <div className="min-w-0">
          <p className={`!m-0 !mb-1 text-xs font-semibold uppercase tracking-[0.14em] ${tone.mark}`}>{label}</p>
          <Html html={section.data.html} className="!text-[15px] !leading-7 text-slate-800" />
        </div>
      </div>
    </BlockShell>
  );
}

export const calloutEmpty = (data) => !hasHtml(data.html);
