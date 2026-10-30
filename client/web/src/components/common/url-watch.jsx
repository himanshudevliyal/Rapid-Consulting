"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

function Watch({ onChange }) {
  const params = useSearchParams();
  const search = params.toString();
  const latest = useRef(onChange);

  useEffect(() => {
    latest.current = onChange;
  });

  useEffect(() => {
    latest.current(search ? `?${search}` : "");
  }, [search]);

  return null;
}

/**
 * Tells a page when its address (query string) changed from outside the
 * component: Back/Forward, or an in-site link to the same page with other
 * filters. It renders nothing and sits in its own Suspense boundary, so pages
 * stay statically rendered and their lists stay in the server HTML.
 */
export function UrlWatch({ onChange }) {
  return (
    <Suspense fallback={null}>
      <Watch onChange={onChange} />
    </Suspense>
  );
}
