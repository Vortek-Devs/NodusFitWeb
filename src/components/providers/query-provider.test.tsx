// @vitest-environment jsdom
import { useQueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { QueryProvider } from "./query-provider";

describe("QueryProvider", () => {
  it("keeps the client and cached data across rerenders", () => {
    const { result, rerender } = renderHook(() => useQueryClient(), {
      wrapper: QueryProvider,
    });
    const client = result.current;
    client.setQueryData(["roster"], ["student"]);
    rerender();
    expect(result.current).toBe(client);
    expect(result.current.getQueryData(["roster"])).toEqual(["student"]);
    expect(client.getDefaultOptions().queries).toMatchObject({
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    });
  });

  it("starts an empty client when the authenticated identity key changes", () => {
    let identity = "account-a";
    function Boundary({ children }: { children: ReactNode }) {
      return <QueryProvider key={identity}>{children}</QueryProvider>;
    }
    const { result, rerender } = renderHook(() => useQueryClient(), {
      wrapper: Boundary,
    });
    const previous = result.current;
    previous.setQueryData(["roster"], ["private-student"]);
    identity = "account-b";
    rerender();
    expect(result.current).not.toBe(previous);
    expect(result.current.getQueryCache().getAll()).toHaveLength(0);
    expect(previous.getQueryCache().getAll()).toHaveLength(0);
  });

  it("aborts in-flight queries and clears query and mutation caches on unmount", async () => {
    const { result, unmount } = renderHook(() => useQueryClient(), {
      wrapper: QueryProvider,
    });
    const client = result.current;
    let requestSignal: AbortSignal | undefined;
    let request: Promise<unknown> = Promise.resolve();
    act(() => {
      client.setQueryData(["roster"], ["private-student"]);
      client.getMutationCache().build(client, { mutationKey: ["invite"] });
      request = client
        .fetchQuery({
          queryKey: ["pending"],
          queryFn: ({ signal }) => {
            requestSignal = signal;
            return new Promise(() => {});
          },
        })
        .catch((error: unknown) => error);
    });
    expect(requestSignal?.aborted).toBe(false);
    unmount();
    await request;
    expect(requestSignal?.aborted).toBe(true);
    expect(client.getQueryCache().getAll()).toHaveLength(0);
    expect(client.getMutationCache().getAll()).toHaveLength(0);
  });
});
