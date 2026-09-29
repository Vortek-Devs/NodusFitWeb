// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TrainingPlansListClient } from "./training-plans-list-client";

vi.mock("next/navigation", () => ({
  usePathname: () => "/treinos",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const timestamp = "2026-09-29T12:00:00Z";

afterEach(() => vi.unstubAllGlobals());

describe("training hub", () => {
  it("shows separate canonical template and weekly-plan collections", async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("workout-templates")) {
        return Response.json({
          items: [
            {
              id: "10000000-0000-4000-8000-000000000001",
              name: "Treino A",
              status: "PUBLISHED",
              version: 2,
              currentPublishedVersionId: "10000000-0000-4000-8000-000000000002",
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ],
          page: 1,
          pageSize: 20,
          totalCount: 1,
        });
      }
      if (url.includes("training-plans")) {
        return Response.json({
          items: [
            {
              id: "20000000-0000-4000-8000-000000000001",
              name: "Plano semanal",
              status: "DRAFT",
              version: 1,
              currentPublishedVersionId: null,
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ],
          page: 1,
          pageSize: 20,
          totalCount: 1,
        });
      }
      return Response.json({ items: [], page: 1, pageSize: 20, totalCount: 0 });
    });
    vi.stubGlobal("fetch", fetcher);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TrainingPlansListClient />
      </QueryClientProvider>,
    );

    expect(await screen.findByRole("link", { name: "Novo treino" })).toHaveAttribute(
      "href",
      "/treinos/novo?tipo=modelo",
    );
    expect(await screen.findByRole("link", { name: "Novo plano" })).toHaveAttribute(
      "href",
      "/treinos/novo?tipo=plano",
    );
    expect(await screen.findByRole("link", { name: "Treino A" })).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "Plano semanal" }),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole("table")).toHaveLength(2));
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("/api/backend/v1/workout-templates"),
      expect.any(Object),
    );
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("/api/backend/v1/training-plans"),
      expect.any(Object),
    );
  });
});
