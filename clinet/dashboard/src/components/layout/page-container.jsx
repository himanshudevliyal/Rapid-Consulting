import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heading } from "../ui/heading";
import { cn } from "@/lib/utils";

function PageSkeleton() {
  return (
    <div className="flex flex-1 animate-pulse flex-col gap-4">
      <div className="flex items-center justify-between"></div>
      <div className="bg-muted mt-6 h-40 w-full rounded-lg" />
    </div>
  );
}

export default function PageContainer({
  children,
  scrollable = true,
  isloading = false,
  pageTitle,
  pageDescription,
  pageHeaderAction,
  className = "",
}) {
  const content = isloading ? <PageSkeleton /> : children;

  return scrollable ? (
    <div className="h-[calc(100dvh-64px)] overflow-auto">
      <div className={cn("flex flex-1 flex-col p-4", className)}>
        <div className="flex flex-wrap items-start justify-between">
          <div>
            <Heading
              title={pageTitle ?? ""}
              description={pageDescription ?? ""}
            />
          </div>
          {pageHeaderAction ? <div>{pageHeaderAction}</div> : null}
        </div>
        <div>{content}</div>
      </div>
    </div>
  ) : (
    <div className={cn("flex flex-1 flex-col p-4", className)}>
      <div className="flex flex-wrap items-start justify-between">
        <div>
          <Heading
            title={pageTitle ?? ""}
            description={pageDescription ?? ""}
          />
        </div>
        {pageHeaderAction ? <div>{pageHeaderAction}</div> : null}
      </div>
      {content}
    </div>
  );
}
