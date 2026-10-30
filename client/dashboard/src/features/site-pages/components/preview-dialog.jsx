"use client";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Monitor, RefreshCw, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePreviewToken } from "@/hooks/use-site-pages";
import { cn } from "@/lib/utils";
import { WEBSITE_URL, formatDateTime } from "@/lib/site-page";

const DEVICES = {
  desktop: { label: "Desktop", icon: Monitor, width: "100%" },
  mobile: { label: "Mobile", icon: Smartphone, width: "390px" },
};

// Preview of the saved draft in the real website: the server issues a
// short-lived token and the page is opened in an iframe at
// ${NEXT_PUBLIC_WEBSITE_URL}/<locale>/preview/<id>?token=...
// Desktop / mobile only change the width of the frame.
export default function PreviewDialog({ open, onOpenChange, pageId, locale }) {
  const [device, setDevice] = useState("desktop");
  const [preview, setPreview] = useState(null);
  const tokenMutation = usePreviewToken(pageId);

  const configured = !!WEBSITE_URL;
  const { mutate } = tokenMutation;

  // A fresh token every time the dialog opens.
  useEffect(() => {
    if (!open || !configured || !pageId) return;
    setPreview(null);
    mutate(undefined, { onSuccess: (data) => setPreview(data) });
  }, [open, configured, pageId, mutate]);

  const src = useMemo(() => {
    if (!preview?.token || !configured) return "";
    const path = preview.url_path || `/${locale}/preview/${pageId}`;
    return `${WEBSITE_URL}${path.startsWith("/") ? path : `/${path}`}?token=${encodeURIComponent(preview.token)}`;
  }, [preview, configured, locale, pageId]);

  const refresh = () => {
    setPreview(null);
    mutate(undefined, { onSuccess: (data) => setPreview(data) });
  };

  const failed = tokenMutation.isError && !preview;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] flex-col gap-3 sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>
            The saved draft as visitors will see it. Use the buttons to check the page at desktop and phone width.
          </DialogDescription>
        </DialogHeader>

        {!configured ? (
          <div className="rounded-lg border border-dashed p-6 text-sm">
            <p className="font-medium">The website address is not set.</p>
            <p className="mt-1 text-muted-foreground">
              Set <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">NEXT_PUBLIC_WEBSITE_URL</code> in the
              dashboard environment (for example <span className="font-mono text-xs">https://www.example.com</span>) and
              rebuild the dashboard. The preview opens the website with a short-lived token.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border bg-muted/40 p-0.5" role="group" aria-label="Preview width">
                {Object.entries(DEVICES).map(([key, item]) => (
                  <Button
                    key={key}
                    type="button"
                    size="sm"
                    variant={device === key ? "default" : "ghost"}
                    onClick={() => setDevice(key)}
                    aria-pressed={device === key}
                  >
                    <item.icon /> {item.label}
                  </Button>
                ))}
              </div>
              <Button type="button" size="sm" variant="outline" onClick={refresh} disabled={tokenMutation.isPending}>
                <RefreshCw className={cn({ "animate-spin": tokenMutation.isPending })} /> Reload
              </Button>
              {src && (
                <Button asChild size="sm" variant="outline">
                  <a href={src} target="_blank" rel="noreferrer">
                    <ExternalLink /> Open in a new tab
                  </a>
                </Button>
              )}
              {preview?.expires_at && (
                <span className="text-xs text-muted-foreground">Link valid until {formatDateTime(preview.expires_at)}</span>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-muted/30">
              {failed ? (
                <p className="p-6 text-sm text-red-500">Could not create a preview link. Try again.</p>
              ) : !src ? (
                <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin" /> Preparing the preview...
                </div>
              ) : (
                <div className="mx-auto h-full" style={{ width: DEVICES[device].width, maxWidth: "100%" }}>
                  <iframe
                    key={src}
                    title={`Preview (${DEVICES[device].label})`}
                    src={src}
                    className="h-full w-full border-0 bg-white"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
