// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeOverviewClient } from "./home-overview-client";

const marina = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Marina Lopes",
  email: "marina@example.test",
  status: "ACTIVE",
  linkedAt: "2026-09-23T11:30:00Z",
};
const caio = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Caio Almeida",
  email: "caio@example.test",
  status: "INACTIVE",
  linkedAt: "2026-09-22T14:15:00Z",
};
const agachamento = {
  id: "33333333-3333-4333-8333-333333333333",
  ownerPersonalId: null,
  name: "Agachamento",
  status: "ACTIVE",
  modality: "STRENGTH",
  version: 1,
  createdAt: "2026-09-20T10:00:00Z",
  equipment: [],
  primaryMuscleGroups: [],
  secondaryMuscleGroups: [],
};
const fetchMock = vi.fn<typeof fetch>();
const clients: QueryClient[] = [];

function studentPage(items: (typeof marina)[], totalCount = items.length) {
  return Response.json({ items, totalCount, page: 1, pageSize: 20 });
}

function exercisePage(totalCount = 12) {
  return Response.json({ items: [agachamento], totalCount, page: 1, pageSize: 20 });
}

function isExerciseRequest(input: RequestInfo | URL) {
  return new URL(String(input), "http://localhost").pathname.endsWith("/v1/exercises");
}

function unavailable() {
  return Response.json(
    {
      type: "about:blank",
      title: "Serviço indisponível",
      status: 503,
      detail: "Tente novamente.",
      code: "ROSTER_UNAVAILABLE",
    },
    { status: 503 },
  );
}

function responseFor(input: RequestInfo | URL) {
  const url = new URL(String(input), "http://localhost");
  if (isExerciseRequest(input)) return exercisePage();
  const status = url.searchParams.get("status");
  if (status === "ACTIVE") return studentPage([marina], 4);
  if (status === "INACTIVE") return studentPage([caio], 2);
  return studentPage([marina, caio], 6);
}

function renderDashboard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <HomeOverviewClient />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => {
    client.clear();
  });
  vi.unstubAllGlobals();
});

describe("HomeOverviewClient", () => {
  it("renders server totals and recent students from the Nodus contracts", async () => {
    fetchMock.mockImplementation(async (input) => responseFor(input));
    renderDashboard();

    expect(
      await screen.findByRole("heading", { name: "Sua base em foco" }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /Marina Lopes/ })).toHaveAttribute(
      "href",
      `/alunos/${marina.id}`,
    );
    expect(screen.getByRole("link", { name: /Caio Almeida/ })).toHaveAttribute(
      "href",
      `/alunos/${caio.id}`,
    );
    expect(
      screen.getAllByRole("definition").map((definition) => definition.textContent),
    ).toEqual(["6", "4", "2", "12"]);
    expect(
      screen.getByRole("img", { name: "4 alunos ativos de 6, 67% da carteira" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Agachamento", { exact: true })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gerenciar alunos" })).toHaveAttribute(
      "href",
      "/alunos",
    );
    expect(screen.getByRole("link", { name: /Explorar exercícios/ })).toHaveAttribute(
      "href",
      "/exercicios",
    );
    expect(screen.getByRole("link", { name: /Cadastrar exercício/ })).toHaveAttribute(
      "href",
      "/exercicios/novo",
    );
    for (const linkedAt of screen.getAllByText(/Vinculado em/)) {
      expect(linkedAt).toHaveClass("text-ink-secondary");
    }
    expect(screen.getByText("com vínculo ativo")).toHaveClass("text-ink-secondary");
    expect(
      new Set(
        fetchMock.mock.calls.map(([input]) =>
          new URL(String(input), "http://localhost").searchParams.get("status"),
        ),
      ),
    ).toEqual(new Set([null, "ACTIVE", "INACTIVE"]));
    expect(
      screen.queryByText(/aderência|receita do mês|pagamentos em atraso/i),
    ).toBeNull();
  });

  it("explains an empty roster without inventing metrics", async () => {
    fetchMock.mockImplementation(async (input) =>
      isExerciseRequest(input) ? exercisePage() : studentPage([], 0),
    );
    renderDashboard();

    expect(await screen.findByText("Sua base ainda está vazia.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Cadastrar ou convidar seu primeiro aluno" }),
    ).toHaveAttribute("href", "/alunos");
    expect(
      screen.getAllByRole("definition").map((definition) => definition.textContent),
    ).toEqual(["0", "0", "0", "12"]);
  });

  it("keeps the student overview available when only the catalog fails", async () => {
    let catalogUnavailable = true;
    fetchMock.mockImplementation(async (input) =>
      isExerciseRequest(input)
        ? catalogUnavailable
          ? unavailable()
          : exercisePage(18)
        : responseFor(input),
    );
    renderDashboard();

    expect(await screen.findByRole("link", { name: /Marina Lopes/ })).toBeInTheDocument();
    expect(
      screen.getByText("Não foi possível consultar o catálogo."),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("definition")[0].textContent).toBe("6");

    catalogUnavailable = false;
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("Exercícios ativos no catálogo")).toBeInTheDocument();
    expect(
      screen.getAllByRole("definition").map((definition) => definition.textContent),
    ).toEqual(["6", "4", "2", "18"]);
  });

  it("shows a recoverable roster error rather than stale or demo data", async () => {
    let rosterUnavailable = true;
    fetchMock.mockImplementation(async (input) =>
      isExerciseRequest(input) || !rosterUnavailable ? responseFor(input) : unavailable(),
    );
    renderDashboard();

    const alert = await screen.findByRole("alert");
    expect(
      within(alert).getByText("Não foi possível carregar os alunos"),
    ).toBeInTheDocument();
    rosterUnavailable = false;
    fireEvent.click(within(alert).getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByRole("link", { name: /Marina Lopes/ })).toBeInTheDocument();
  });

  it("shows a loading state while the roster is unresolved", () => {
    fetchMock.mockImplementation(() => new Promise<Response>(() => {}));
    renderDashboard();
    expect(screen.getByRole("status", { name: "Carregando Início" })).toBeInTheDocument();
  });
});
