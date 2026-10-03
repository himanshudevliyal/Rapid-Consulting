"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";

import { cn } from "@/lib/utils";

function Accordion(props) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("border-b last:border-b-0", className)} {...props} />;
}

// `icon` lets a design keep its own indicator (Rapid uses "+").
function AccordionTrigger({ className, children, icon, ...props }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-start justify-between gap-4 text-left outline-none disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>.accordion-icon]:rotate-45",
          className,
        )}
        {...props}
      >
        {children}
        <span aria-hidden="true" className="accordion-icon shrink-0 transition-transform duration-200">
          {icon ?? "+"}
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

// With `forceMount`, closed answers stay in the HTML (useful for search
// engines) and are hidden with CSS instead of being removed.
function AccordionContent({ className, children, forceMount, ...props }) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      forceMount={forceMount}
      className={cn(
        "overflow-hidden data-[state=open]:animate-accordion-down",
        forceMount ? "data-[state=closed]:hidden" : "data-[state=closed]:animate-accordion-up",
      )}
      {...props}
    >
      <div className={cn(className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
