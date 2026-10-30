"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Slot } from "@radix-ui/react-slot";
import { X } from "lucide-react";

import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { useTx } from "@/lib/use-tx";
import { ContactExperience } from "./contact-experience";

// One contextual "Request a callback" drawer for every "Discuss your project"
// call to action (PDF: "Every Discuss your project CTA opens the same
// contextual drawer. Preserve existing page and form state.").
//
//   - desktop: right-hand drawer; mobile / small tablet: bottom sheet
//   - Radix dialog underneath: focus trap, Esc, overlay click, aria-modal,
//     focus returns to the control that opened it
//   - the page never navigates or reloads; a half-typed form is kept while the
//     drawer is closed and re-opened (draft lives in the provider)
//   - the form is ContactExperience (RHF + zod, honeypot, page title / URL)
//
// Mounted once in app/[locale]/layout.js. Use:
//
//   <EnquiryTrigger source="service-hero" serviceName="CTE" className="button">Discuss your project</EnquiryTrigger>
//   const { open, close, isOpen } = useEnquiryDrawer();  open({ source, serviceName, kind, pageTitle });

const EnquiryDrawerContext = createContext(null);

// The API only accepts lowercase letters, digits and hyphens (max 60) as source.
const cleanSource = (value) =>
  typeof value === "string" && value.trim()
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || undefined
    : undefined;

export function EnquiryDrawerProvider({ children }) {
  const t = useTx();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({});
  const returnFocus = useRef(null);
  const draft = useRef(null);

  const open = useCallback((next = {}) => {
    const { trigger, ...rest } = next ?? {};
    returnFocus.current = trigger instanceof HTMLElement ? trigger : document.activeElement;
    setOptions({
      ...rest,
      pageTitle: rest.pageTitle || (typeof document !== "undefined" ? document.title : ""),
    });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  // The drawer belongs to the page that opened it: leaving the page closes it.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const onDraftChange = useCallback((values) => {
    draft.current = values;
  }, []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  const restoreFocus = (event) => {
    event.preventDefault();
    let target = returnFocus.current;
    // The trigger can be gone (it was inside the mobile menu, which closes):
    // fall back to the menu button, then to the page.
    if (!target || !target.isConnected) target = document.querySelector("[data-mobile-trigger]");
    if (!target || !target.isConnected) target = document.getElementById("main");
    target?.focus?.({ preventScroll: true });
  };

  return (
    <EnquiryDrawerContext.Provider value={value}>
      {children}
      <Dialog open={isOpen} onOpenChange={(next) => !next && close()}>
        <DialogContent
          bare
          aria-describedby={undefined}
          onCloseAutoFocus={restoreFocus}
          className={[
            // mobile: bottom sheet
            "enquiry-drawer fixed inset-x-0 bottom-0 left-0 right-0 top-auto flex max-h-[92dvh] w-full translate-x-0 translate-y-0 flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-12px_40px_rgba(9,38,62,0.25)]",
            // desktop: right-hand drawer
            "md:inset-y-0 md:left-auto md:right-0 md:top-0 md:bottom-0 md:h-dvh md:max-h-none md:w-[440px] md:max-w-[100vw] md:rounded-none md:rounded-l-2xl md:shadow-[-12px_0_40px_rgba(9,38,62,0.22)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out duration-300",
            "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
            "md:data-[state=open]:slide-in-from-right md:data-[state=closed]:slide-out-to-right",
            "motion-reduce:animate-none",
          ].join(" ")}
        >
          <div className="enquiry-drawer__bar flex shrink-0 items-center justify-end px-3 pt-3">
            {/* grab handle hint on the mobile sheet */}
            <span aria-hidden="true" className="mr-auto ml-auto h-1 w-10 rounded-full bg-slate-300 md:hidden" />
            <DialogClose
              className="absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-full text-[#09263e] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]"
              aria-label={t("contact.closeForm", "Close callback form")}
            >
              <X className="size-5" aria-hidden="true" />
            </DialogClose>
          </div>

          <div className="enquiry-drawer__scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
            <ContactExperience
              variant="drawer"
              kind={options.kind === "contact" ? "contact" : "enquiry"}
              formId="enquiry-drawer"
              pageTitle={options.pageTitle}
              serviceName={options.serviceName}
              source={cleanSource(options.source) ?? "enquiry-drawer"}
              initialValues={draft.current ?? undefined}
              onDraftChange={onDraftChange}
              heading={t("enquiryDrawer.heading", "Request a callback")}
              eyebrow={t("enquiryDrawer.eyebrow", "Discuss your project")}
            />
          </div>
        </DialogContent>
      </Dialog>
    </EnquiryDrawerContext.Provider>
  );
}

const FALLBACK = {
  // Outside the provider (should not happen) the CTA still works: go to the contact page.
  open: () => {
    if (typeof window !== "undefined") window.location.assign("/contact");
  },
  close: () => {},
  isOpen: false,
};

export function useEnquiryDrawer() {
  return useContext(EnquiryDrawerContext) ?? FALLBACK;
}

// A real <button type="button"> that opens the drawer. Callers style it with
// className. `asChild` renders the child element instead (for example a styled
// <span> or a Button), keeping the same behaviour.
export function EnquiryTrigger({
  children,
  className,
  source,
  serviceName,
  kind,
  pageTitle,
  asChild = false,
  onClick,
  type = "button",
  ...props
}) {
  const { open } = useEnquiryDrawer();
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      {...(asChild ? {} : { type })}
      data-enquiry-trigger=""
      aria-haspopup="dialog"
      className={className}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        // A link as the child must not navigate; the drawer replaces it.
        event.preventDefault();
        open({ source, serviceName, kind, pageTitle, trigger: event.currentTarget });
      }}
    >
      {children}
    </Comp>
  );
}

export default EnquiryTrigger;
