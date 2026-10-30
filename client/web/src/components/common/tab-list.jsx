"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

export const tabId = (prefix, id) => `${prefix}-tab-${id}`;
export const panelId = (prefix) => `${prefix}-panel`;

/**
 * Accessible tab strip: one selected tab (aria-selected), arrow keys / Home /
 * End move between tabs, and a tab that has no content yet is shown but
 * non-actionable (aria-disabled, skipped by the arrow keys, no click).
 *
 *   tabs:  [{ id, label, detail?, disabled?, disabledHint?, controls? }]  (controls = that tab's own panel id)
 *   value: id of the selected tab
 *   idPrefix: ties each tab to the panel `id={panelId(idPrefix)}`
 *             (`aria-labelledby={tabId(idPrefix, value)}`); `controls` names
 *             another element id when the tabs drive a panel with a different id.
 *
 * Tabs are buttons (type="button"), so switching never navigates or jumps
 * the page.
 */
export function TabList({
  tabs,
  value,
  onChange,
  label,
  idPrefix,
  controls,
  className,
  tabClassName,
  selectedClassName = "bg-[#09263e] text-white",
  idleClassName = "bg-white text-[#09263e] hover:bg-[#eef3f1]",
}) {
  const refs = useRef({});

  const move = (from, step) => {
    const enabled = tabs.filter((tab) => !tab.disabled);
    if (!enabled.length) return;
    const index = Math.max(
      0,
      enabled.findIndex((tab) => tab.id === from),
    );
    const next =
      step === "first"
        ? enabled[0]
        : step === "last"
          ? enabled[enabled.length - 1]
          : enabled[(index + step + enabled.length) % enabled.length];
    onChange(next.id);
    refs.current[next.id]?.focus({ preventScroll: true });
  };

  const onKeyDown = (event, id) => {
    const keys = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
      Home: "first",
      End: "last",
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    move(id, keys[event.key]);
  };

  return (
    <div role="tablist" aria-label={label} className={className}>
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[tab.id] = node;
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, tab.id)}
            aria-selected={selected}
            aria-controls={tab.controls || controls || panelId(idPrefix)}
            aria-disabled={tab.disabled ? "true" : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              if (!tab.disabled) onChange(tab.id);
            }}
            onKeyDown={(event) => onKeyDown(event, tab.id)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#09263e]/15 px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57] focus-visible:ring-offset-2",
              selected ? selectedClassName : idleClassName,
              tab.disabled && "cursor-not-allowed border-dashed bg-transparent text-slate-500 hover:bg-transparent",
              tabClassName,
            )}
          >
            <span>{tab.label}</span>
            {tab.detail !== undefined && tab.detail !== "" && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  selected ? "bg-white/20 text-white" : "bg-[#e8efec] text-[#1f5d57]",
                )}
              >
                {tab.detail}
              </span>
            )}
            {tab.disabled && tab.disabledHint && (
              <span className="text-xs font-normal">
                {tab.disabledHint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
