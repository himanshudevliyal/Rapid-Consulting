"use client";

import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

function Label({ className, ...props }) {
  return <LabelPrimitive.Root data-slot="label" className={cn(className)} {...props} />;
}

export { Label };
