"use client";
import { handleError } from "@/lib/handle-error-toast";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";

export default function QueryProvider({ children }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        refetchOnWindowFocus: false,
      },
    },
    // queryCache: new QueryCache({
    //   onError: (error, query) => {
    //     console.error("Query failed:", query.queryKey, error);
    //     // handleError(error, "Failed to fetch data.");
    //   },
    // }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        console.error("Mutation failed:", mutation.options.mutationKey, error);
        handleError({ error, defaultMessage: "Failed to perform action." });
      },
      onSuccess: (data, variables, context, mutation) => {
        // console.log("Mutation success:", mutation.options.mutationKey);
      },
    }),
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
