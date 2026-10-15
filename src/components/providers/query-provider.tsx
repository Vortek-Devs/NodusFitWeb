"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { shouldRetryRequest } from "@/lib/query/retry-policy";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: shouldRetryRequest,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  // QueryCache.clear destroys each query, cancelling its retryer and abort signal.
  useMountEffect(() => () => client.clear());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
