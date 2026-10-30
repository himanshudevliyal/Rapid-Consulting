"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { BTN_LIME } from "@/components/home/styles";
import { TabList, panelId, tabId } from "@/components/common/tab-list";

/**
 * Insights & resources: Articles | Guides | Reports. Each tab's cards are
 * rendered on the server and passed in as `panels`; this component only switches
 * which one is shown (in place, no page jump). A tab with `disabled` (Reports,
 * until reports exist) is shown but not actionable.
 *
 *   tabs: [{ id, label, disabled?, hint?, empty?, viewAllHref?, viewAllLabel? }]
 *   panels: { [id]: ReactNode | null }
 */
export function ResourcesTabs({ tabs, panels, tabsLabel, emptyText }) {
  const firstEnabled = tabs.find((tab) => !tab.disabled)?.id ?? tabs[0]?.id;
  const [activeId, setActiveId] = useState(firstEnabled);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  const prefix = "home-insights";
  if (!active) return null;

  return (
    <div>
      <TabList
        tabs={tabs.map(({ id, label, disabled, hint }) => ({ id, label, disabled, disabledHint: hint }))}
        value={active.id}
        onChange={setActiveId}
        label={tabsLabel}
        idPrefix={prefix}
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
        tabClassName="px-5"
        selectedClassName="border-[#09263e] bg-[#09263e] text-white"
        idleClassName="bg-white text-[#09263e] hover:bg-[#eaf0ec]"
      />

      <div role="tabpanel" id={panelId(prefix)} aria-labelledby={tabId(prefix, active.id)} className="mt-6">
        {panels[active.id] ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 [&_[data-component=ContentCard]]:border [&_[data-component=ContentCard]]:border-slate-200 [&_[data-component=ContentCard]]:bg-white">
            {panels[active.id]}
          </div>
        ) : (
          <p className="m-0! rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-700">{emptyText}</p>
        )}

        {active.viewAllHref && (
          <div className="mt-8">
            <a href={active.viewAllHref} className={BTN_LIME}>
              {active.viewAllLabel}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
