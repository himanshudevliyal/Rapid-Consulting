"use client";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// A picture of how a layout looks on the website (public/layout-previews/<role>.png).
// Hidden when there is no picture for the role.
function Preview({ role, label, className }) {
  const [missing, setMissing] = useState(false);
  useEffect(() => setMissing(false), [role]);
  if (missing) {
    return (
      <div className={cn("flex items-center justify-center rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground", className)}>
        No preview picture for “{label}” yet.
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/layout-previews/${role}.png`}
      alt={`How the “${label}” layout looks on the website`}
      onError={() => setMissing(true)}
      className={cn("block h-auto w-full rounded-md border bg-white", className)}
    />
  );
}

/**
 * "Layout on the website": the options open in a list; the picture on the right
 * follows the option that is highlighted, so the editor can see what each name
 * looks like before choosing it (the whole picture is shown).
 */
export default function LayoutPicker({ id, roles, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = roles.find((role) => role.value === value) ?? roles[0];
  const [active, setActive] = useState(selected.value);
  const [up, setUp] = useState(false);
  const root = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const activeRole = roles.find((role) => role.value === active) ?? selected;
  const move = (step) => {
    const index = roles.findIndex((role) => role.value === active);
    setActive(roles[(index + step + roles.length) % roles.length].value);
  };
  const choose = (role) => {
    onChange(role.value);
    setOpen(false);
  };

  return (
    <div
      ref={root}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
        if (!open) return;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          move(1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          move(-1);
        } else if (event.key === "Enter") {
          event.preventDefault();
          choose(activeRole);
        }
      }}
    >
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(event) => {
          // The popup is about 30rem tall: open it upwards when the room below is smaller than the room above.
          const box = event.currentTarget.getBoundingClientRect();
          const below = window.innerHeight - box.bottom;
          setUp(below < 500 && box.top > below);
          setActive(selected.value);
          setOpen((current) => !current);
        }}
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {selected.label}
        <ChevronDown className="h-4 w-4 opacity-60" aria-hidden="true" />
      </button>

      {open && (
        <div className={cn("absolute left-0 z-50 grid w-[min(44rem,90vw)] gap-3 rounded-lg border bg-popover p-2 text-popover-foreground shadow-lg sm:grid-cols-[14rem_minmax(0,1fr)]", up ? "bottom-full mb-1" : "top-full mt-1")}>
          <ul role="listbox" aria-label="Layouts" className="m-0 max-h-80 list-none space-y-0.5 overflow-y-auto p-0">
            {roles.map((role) => (
              <li key={role.value} role="option" aria-selected={role.value === selected.value}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(role.value)}
                  onFocus={() => setActive(role.value)}
                  onClick={() => choose(role)}
                  className={cn(
                    "w-full rounded px-2 py-1.5 text-left text-sm",
                    role.value === active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
                    role.value === selected.value && "font-semibold",
                  )}
                >
                  {role.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="max-h-[70vh] min-w-0 space-y-2 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground">How “{activeRole.label}” looks on the website</p>
            <Preview role={activeRole.value} label={activeRole.label} />
            <p className="text-xs text-muted-foreground">{activeRole.help}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export { Preview as LayoutPreview };
