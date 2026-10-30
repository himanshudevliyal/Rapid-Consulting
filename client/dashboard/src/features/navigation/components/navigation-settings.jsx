"use client";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Plus, Save, Trash2, Undo2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormCard as Card } from "@/components/form-layout";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSiteSetting, useUpdateSiteSetting } from "@/hooks/use-site-settings";
import { handleError } from "@/lib/handle-error-toast";
import { handleSuccessToast } from "@/lib/handle-success-toast";
import { deepClone, moveItem } from "@/lib/site-page";
import { cn } from "@/lib/utils";
import { navigationSchema } from "@/schemas/site-page";

const SETTING_KEY = "navigation";

// The seven fixed destinations, in the order the website shows them. The
// links are the starting values until a navigation is saved.
const DEFAULT_PRIMARY = [
  { key: "approvals", label: "Approvals", href: "/services/statutory-approvals-consultant" },
  { key: "subsidies", label: "Subsidies", href: "/services/msmes-subsidy-consultant" },
  { key: "your-project", label: "Your project", href: "/your-project" },
  { key: "industries", label: "Industries", href: "/industries" },
  { key: "work", label: "Our work", href: "/case-studies" },
  { key: "resources", label: "Resources", href: "/resources" },
  { key: "about", label: "About", href: "/about" },
];
const FIXED_KEYS = DEFAULT_PRIMARY.map((item) => item.key);

const toState = (value) => {
  const primary = Array.isArray(value?.primary) && value.primary.length
    ? value.primary.map((item) => ({
        ...item,
        key: item.key,
        label: item.label ?? "",
        label_hi: item.label_hi ?? "",
        href: item.href ?? "",
        visible: item.visible !== false,
      }))
    : DEFAULT_PRIMARY.map((item) => ({ ...item, label_hi: "", visible: true }));
  const footer = (Array.isArray(value?.footer) ? value.footer : []).map((column) => ({
    ...column,
    heading: column.heading ?? "",
    heading_hi: column.heading_hi ?? "",
    links: (Array.isArray(column.links) ? column.links : []).map((link) => ({
      ...link,
      label: link.label ?? "",
      label_hi: link.label_hi ?? "",
      href: link.href ?? "",
      visible: link.visible !== false,
    })),
  }));
  return { primary, footer };
};

// Empty optional Hindi text is left out of what is saved.
const toValue = (state) => {
  const clean = (item) => {
    const copy = { ...item };
    if (!String(copy.label_hi ?? "").trim()) delete copy.label_hi;
    return copy;
  };
  return {
    primary: state.primary.map(clean),
    footer: state.footer.map((column) => {
      const heading = { ...column, links: column.links.map(clean) };
      if (!String(heading.heading_hi ?? "").trim()) delete heading.heading_hi;
      return heading;
    }),
  };
};

function ErrorText({ errors, path }) {
  const message = errors[path.join(".")];
  return message ? <p className="text-sm text-red-500">{message}</p> : null;
}

function MoveButtons({ index, count, onMove }) {
  return (
    <>
      <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <ArrowUp />
        <span className="sr-only">Move up</span>
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
        <ArrowDown />
        <span className="sr-only">Move down</span>
      </Button>
    </>
  );
}

function VisibleButton({ visible, onToggle }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onToggle}
      title={visible ? "Hide from the menu" : "Show in the menu"}
    >
      {visible ? <Eye /> : <EyeOff />}
      <span className="sr-only">{visible ? "Hide" : "Show"}</span>
    </Button>
  );
}

// Label, Hindi label and link of one entry.
function LinkFields({ item, onChange, errors, path, idPrefix }) {
  return (
    <div className="grid flex-1 gap-3 md:grid-cols-3">
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-label`}>Label *</Label>
        <Input id={`${idPrefix}-label`} value={item.label} onChange={(event) => onChange({ ...item, label: event.target.value })} />
        <ErrorText errors={errors} path={[...path, "label"]} />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-label-hi`}>Hindi label</Label>
        <Input
          id={`${idPrefix}-label-hi`}
          lang="hi"
          value={item.label_hi ?? ""}
          onChange={(event) => onChange({ ...item, label_hi: event.target.value })}
          placeholder="Optional"
        />
        <ErrorText errors={errors} path={[...path, "label_hi"]} />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-href`}>Link *</Label>
        <Input
          id={`${idPrefix}-href`}
          className="font-mono text-sm"
          value={item.href}
          onChange={(event) => onChange({ ...item, href: event.target.value })}
          placeholder="/your-project"
        />
        <ErrorText errors={errors} path={[...path, "href"]} />
      </div>
    </div>
  );
}

export default function NavigationSettings() {
  const { data, isLoading, isError, error } = useSiteSetting(SETTING_KEY);
  const [state, setState] = useState({ primary: [], footer: [] });
  const [baseline, setBaseline] = useState("");
  const [errors, setErrors] = useState({});

  const saveMutation = useUpdateSiteSetting(SETTING_KEY, () =>
    handleSuccessToast({ message: "Navigation saved. The website refreshes its menus." }),
  );

  // Load the saved navigation (or the starting one) into the editor.
  useEffect(() => {
    if (isLoading || isError) return;
    const loaded = toState(data);
    setState(loaded);
    setBaseline(JSON.stringify(loaded));
    setErrors({});
  }, [data, isLoading, isError]);

  const dirty = useMemo(() => JSON.stringify(state) !== baseline, [state, baseline]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  // Nothing saved yet: the starting menu can be saved as it is.
  const neverSaved = !(Array.isArray(data?.primary) && data.primary.length);
  const canSave = dirty || neverSaved;

  const setPrimary = (primary) => setState((current) => ({ ...current, primary }));
  const setFooter = (footer) => setState((current) => ({ ...current, footer }));

  const updatePrimary = (index, next) => setPrimary(state.primary.map((item, i) => (i === index ? next : item)));
  const addCustomLink = () => {
    let number = 1;
    const keys = new Set(state.primary.map((item) => item.key));
    while (keys.has(`custom-${number}`)) number += 1;
    setPrimary([...state.primary, { key: `custom-${number}`, label: "", label_hi: "", href: "", visible: true }]);
  };

  const updateColumn = (index, next) => setFooter(state.footer.map((column, i) => (i === index ? next : column)));
  const updateLink = (columnIndex, linkIndex, next) =>
    updateColumn(columnIndex, {
      ...state.footer[columnIndex],
      links: state.footer[columnIndex].links.map((link, i) => (i === linkIndex ? next : link)),
    });

  const save = () => {
    const value = toValue(state);
    const parsed = navigationSchema.safeParse(value);
    if (!parsed.success) {
      const map = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (!map[path]) map[path] = issue.message;
      }
      setErrors(map);
      handleError({ error: { message: "Please fix the highlighted fields." } });
      return;
    }
    setErrors({});
    saveMutation.mutate(value);
  };

  const revert = () => {
    setState(JSON.parse(baseline));
    setErrors({});
  };

  return (
    <div className="max-w-5xl space-y-6">
      <Card
        title="Main menu"
        description="The destinations in the header, in this order. Links are paths without the language (for example /your-project); the website adds /en or /hi."
      >
        <ul className="space-y-3">
          {state.primary.map((item, index) => {
            const fixed = FIXED_KEYS.includes(item.key);
            const children = Array.isArray(item.children) ? item.children.length : 0;
            return (
              <li key={item.key} className={cn("rounded-lg border p-3", { "bg-muted/40": !item.visible })}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs tabular-nums text-muted-foreground">{index + 1}</span>
                  <Badge variant="secondary">{fixed ? item.key : "custom link"}</Badge>
                  {!item.visible && <Badge variant="outline">Hidden</Badge>}
                  {children > 0 && (
                    <span className="text-xs text-muted-foreground">{children} submenu links are kept as they are.</span>
                  )}
                  <div className="ml-auto flex items-center">
                    <VisibleButton visible={item.visible} onToggle={() => updatePrimary(index, { ...item, visible: !item.visible })} />
                    <MoveButtons index={index} count={state.primary.length} onMove={(from, to) => setPrimary(moveItem(state.primary, from, to))} />
                    {!fixed && (
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => setPrimary(state.primary.filter((_, i) => i !== index))}>
                        <Trash2 />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                </div>
                <LinkFields
                  item={item}
                  onChange={(next) => updatePrimary(index, next)}
                  errors={errors}
                  path={["primary", index]}
                  idPrefix={`primary-${item.key}`}
                />
              </li>
            );
          })}
        </ul>
        <Button type="button" variant="outline" size="sm" onClick={addCustomLink}>
          <Plus /> Add custom link
        </Button>
      </Card>

      <Card title="Footer" description="Columns of links at the bottom of every page.">
        {state.footer.length === 0 && <p className="text-sm text-muted-foreground">No footer columns yet.</p>}
        <div className="space-y-4">
          {state.footer.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-3 rounded-lg border p-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[180px] flex-1 space-y-1">
                  <Label htmlFor={`footer-${columnIndex}-heading`}>Column heading *</Label>
                  <Input
                    id={`footer-${columnIndex}-heading`}
                    value={column.heading}
                    onChange={(event) => updateColumn(columnIndex, { ...column, heading: event.target.value })}
                  />
                  <ErrorText errors={errors} path={["footer", columnIndex, "heading"]} />
                </div>
                <div className="min-w-[180px] flex-1 space-y-1">
                  <Label htmlFor={`footer-${columnIndex}-heading-hi`}>Hindi heading</Label>
                  <Input
                    id={`footer-${columnIndex}-heading-hi`}
                    lang="hi"
                    value={column.heading_hi ?? ""}
                    onChange={(event) => updateColumn(columnIndex, { ...column, heading_hi: event.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="flex items-center">
                  <MoveButtons index={columnIndex} count={state.footer.length} onMove={(from, to) => setFooter(moveItem(state.footer, from, to))} />
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => setFooter(state.footer.filter((_, i) => i !== columnIndex))}>
                    <Trash2 />
                    <span className="sr-only">Remove column</span>
                  </Button>
                </div>
              </div>

              <ul className="space-y-2 border-t pt-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex} className={cn("rounded-md border p-2", { "bg-muted/40": !link.visible })}>
                    <div className="flex flex-wrap items-start gap-2">
                      <LinkFields
                        item={link}
                        onChange={(next) => updateLink(columnIndex, linkIndex, next)}
                        errors={errors}
                        path={["footer", columnIndex, "links", linkIndex]}
                        idPrefix={`footer-${columnIndex}-${linkIndex}`}
                      />
                      <div className="flex items-center pt-5">
                        <VisibleButton
                          visible={link.visible}
                          onToggle={() => updateLink(columnIndex, linkIndex, { ...link, visible: !link.visible })}
                        />
                        <MoveButtons
                          index={linkIndex}
                          count={column.links.length}
                          onMove={(from, to) => updateColumn(columnIndex, { ...column, links: moveItem(column.links, from, to) })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => updateColumn(columnIndex, { ...column, links: column.links.filter((_, i) => i !== linkIndex) })}
                        >
                          <Trash2 />
                          <span className="sr-only">Remove link</span>
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  updateColumn(columnIndex, {
                    ...column,
                    links: [...column.links, { label: "", label_hi: "", href: "", visible: true }],
                  })
                }
              >
                <Plus /> Add link
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFooter([...deepClone(state.footer), { heading: "", heading_hi: "", links: [] }])}
        >
          <Plus /> Add footer column
        </Button>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
        {!dirty && neverSaved && (
          <span className="text-xs text-muted-foreground">Not saved yet. These are the starting links.</span>
        )}
        <Button type="button" variant="outline" disabled={!dirty || saveMutation.isPending} onClick={revert}>
          <Undo2 /> Discard changes
        </Button>
        <Button type="button" disabled={!canSave || saveMutation.isPending} onClick={save}>
          {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />} Save navigation
        </Button>
      </div>
    </div>
  );
}
