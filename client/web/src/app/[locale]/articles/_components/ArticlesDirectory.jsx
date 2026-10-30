"use client";

import { ResourceCollection } from "@/components/pages/resource-collection";

// Articles / guides collection (the Resources explorer opened on its own
// format). initialData comes from the server render, so it is in the HTML.
export function ArticlesDirectory({ initialData, defaultFormat = "article" }) {
  return <ResourceCollection initialData={initialData} defaultFormat={defaultFormat} />;
}
