import "server-only";

import type { AppRouter } from "@midday/api/trpc/routers/_app";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCClient, loggerLink } from "@trpc/client";
import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { cache } from "react";
import { makeMockLink } from "./mock-link";
import { makeQueryClient } from "./query-client";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

// ⚠️ FARADAY DEMO MODE — original httpLink to `@midday/api` replaced with a
// local mock link so SSR doesn't depend on a running API. Restore the network
// link before any non-local deployment.
export const trpc = createTRPCOptionsProxy<AppRouter>({
  queryClient: getQueryClient,
  client: createTRPCClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      makeMockLink(),
    ],
  }),
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();

  if (queryOptions.queryKey[1]?.type === "infinite") {
    void queryClient.prefetchInfiniteQuery(queryOptions as any).catch(() => {
      // Avoid unhandled promise rejections from fire-and-forget prefetches.
    });
  } else {
    void queryClient.prefetchQuery(queryOptions).catch(() => {
      // Avoid unhandled promise rejections from fire-and-forget prefetches.
    });
  }
}

export function batchPrefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptionsArray: T[],
) {
  const queryClient = getQueryClient();

  for (const queryOptions of queryOptionsArray) {
    if (queryOptions.queryKey[1]?.type === "infinite") {
      void queryClient.prefetchInfiniteQuery(queryOptions as any).catch(() => {
        // Avoid unhandled promise rejections from fire-and-forget prefetches.
      });
    } else {
      void queryClient.prefetchQuery(queryOptions).catch(() => {
        // Avoid unhandled promise rejections from fire-and-forget prefetches.
      });
    }
  }
}

/**
 * Get a tRPC client for server-side API routes
 * Use this when you need to call mutations from API routes (e.g., webhooks, callbacks)
 * For queries, use the `trpc` proxy with `queryOptions` instead
 *
 * @param options.forcePrimary - Force all reads to use the primary database,
 *   bypassing replicas. Use this in auth callbacks and other flows where
 *   read-after-write consistency is critical (e.g., reading a user that was
 *   just created). This is more reliable than depending on the cookie alone.
 */
export async function getTRPCClient(options?: { forcePrimary?: boolean }) {
  const requestContext = await getServerRequestContext();

  const shouldForcePrimary =
    options?.forcePrimary ||
    getForcePrimaryFromCookies(requestContext.cookieStore);

  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${API_BASE_URL}/trpc`,
        transformer: superjson,
        fetch: fetchWithTimeout,
        headers: buildTRPCRequestHeaders({
          session: requestContext.session,
          forcePrimary: shouldForcePrimary,
          location: requestContext.location,
          traceHeaders: requestContext.traceHeaders,
        }),
      }),
    ],
  });
}
