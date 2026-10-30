"use client";

import { useState } from "react";

import { TabList, panelId, tabId } from "@/components/common/tab-list";

// "Further reading and downloads": Articles / Guides / Reports as pill tabs over
// one panel. The panels are rendered on the server (cards) and passed in; a tab
// with nothing in it (for example Reports, until there are any) is shown but
// disabled.
//
//   panels: [{ id, label, content, empty }]
export function ReadingTabs({ panels, label, idPrefix = "reading" }) {
  const first = panels.find((panel) => !panel.empty)?.id ?? panels[0]?.id;
  const [active, setActive] = useState(first);
  const current = panels.find((panel) => panel.id === active) ?? panels[0];

  return (
    <div>
      <TabList
        tabs={panels.map(({ id, label: tabLabel, empty }) => ({ id, label: tabLabel, disabled: empty }))}
        value={current?.id ?? ""}
        onChange={setActive}
        label={label}
        idPrefix={idPrefix}
        className="mt-6 flex flex-wrap gap-2"
        tabClassName="min-h-10 rounded-lg px-4 text-sm"
        selectedClassName="border-[#09263e] bg-[#09263e] text-white"
        idleClassName="border-[#09263e]/30 bg-white text-[#09263e] hover:bg-[#eef3f1]"
      />
      {current && (
        <div role="tabpanel" id={panelId(idPrefix)} aria-labelledby={tabId(idPrefix, current.id)} className="mt-6">
          {current.content}
        </div>
      )}
    </div>
  );
}
