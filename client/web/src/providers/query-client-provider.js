"use client";

import { useState } from "react";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { handleError } from "@/lib/handle-error-toast";

export default function QueryProvider({ children }) {
  // One client per browser session (not re-created on every render).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 0,
            refetchOnWindowFocus: false,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => handleError(error, "Failed to fetch data."),
        }),
        mutationCache: new MutationCache({
          // Forms that show their own error (meta.silent) skip the toast.
          onError: (error, _variables, _context, mutation) => {
            if (mutation?.meta?.silent) return;
            handleError(error, "Failed to perform action.");
          },
        }),
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
