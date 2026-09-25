// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExercisesCatalogClient } from "./exercises-catalog-client";

const navigation = vi.hoisted(() => ({
  params: new URLSearchParams(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/exercicios",
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => navigation.params,
}));

const ownId = "53dc1d29-040b-4d67-9f16-c908bdd65660";
const systemId = "68b8cd20-f648-4093-8918-d4eeb3970b7c";
const ownerId = "a28f355f-a284-47ba-b76e-1b58a970852c";
const equipmentId = "d6b2f7ae-4f77-4604-9901-d1c73c7a64a9";
const muscleId = "239a4a18-8cfe-4c0c-9bed-75a7d9990f54";
const timestamp = "2026-09-21T12:34:56.123Z";

const equipment = { id: equipmentId, name: "Halter" };
const muscle = { id: muscleId, name: "Quadríceps" };
const mine = {
  id: ownId,
  ownerPersonalId: ownerId,
  name: "Agachamento goblet",
  status: "ACTIVE",
  modality: "STRENGTH",
  version: 3,
  createdAt: timestamp,
  equipment: [equipment],
  primaryMuscleGroups: [muscle],
  secondaryMuscleGroups: [],
} as const;
const system = {
  ...mine,
  id: systemId,
  ownerPersonalId: null,
  name: "Caminhada",
  modality: "CARDIO",
  equipment: [],
  primaryMuscleGroups: [],
} as const;
const options = { equipment: [equipment], muscleGroups: [muscle] };
const fetchMock = vi.fn<typeof fetch>();
const clients: QueryClient[] = [];

function page(items = [mine, system], totalCount = items.length, pageNumber = 1) {
  return Response.json({ items, totalCount, page: pageNumber, pageSize: 20 });
}

function problem(status: number, code = "EXERCISE_CATALOG_UNAVAILABLE") {
  return Response.json(
    {
      title: "Falha segura",
      detail: "Solicitação indisponível.",
      code,
      traceId: "trace-exercise",
      status,
    },
    { status },
  );
}

function installSuccessfulApi(listResponse: () => Response = () => page()) {
  fetchMock.mockImplementation((input, init) => {
    const url = String(input);
    if (url.endsWith("/v1/exercises/options"))
      return Promise.resolve(Response.json(options));
    if (url.endsWith(`/${ownId}/archive`) && init?.method === "POST") {
      return Promise.resolve(
        Response.json({
          id: ownId,
          ownerPersonalId: ownerId,
          name: mine.name,
          instructions: null,
          status: "ARCHIVED",
          modality: mine.modality,
          version: 4,
          equipmentIds: [equipmentId],
          primaryMuscleGroupIds: [muscleId],
          secondaryMuscleGroupIds: [],
          createdAt: timestamp,
          updatedAt: timestamp,
        }),
      );
    }
    if (url.includes("/v1/exercises?")) return Promise.resolve(listResponse());
    return Promise.reject(new Error(`Unexpected request: ${url}`));
  });
}

function renderCatalog(url = "") {
  navigation.params = new URLSearchParams(url);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  clients.push(client);
  const tree = () => (
    <QueryClientProvider client={client}>
      <ExercisesCatalogClient />
    </QueryClientProvider>
  );
  const view = render(tree());
  navigation.replace.mockImplementation((path: string) => {
    const destination = new URL(path, "http://localhost");
    if (destination.pathname !== "/exercicios") return;
    navigation.params = destination.searchParams;
    view.rerender(tree());
  });
  return {
    ...view,
    navigate: (url: string) => {
      navigation.params = new URLSearchParams(url);
      view.rerender(tree());
    },
  };
}

beforeEach(() => {
  navigation.replace.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  for (const client of clients.splice(0)) client.clear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("exercise catalog", () => {
  it("renders semantic desktop rows and equivalent mobile cards without system mutations", async () => {
    installSuccessfulApi();
    renderCatalog();

    const table = await screen.findByRole("table", { name: "Catálogo de exercícios" });
    expect(table.parentElement?.parentElement).toHaveClass("hidden", "xl:block");
    for (const heading of ["Exercício", "Origem", "Modalidade", "Equipamentos", "Ações"])
      expect(within(table).getByRole("columnheader", { name: heading })).toBeVisible();
    expect(within(table).getByText("Meu exercício")).toBeVisible();
    expect(within(table).getByText("Sistema")).toBeVisible();
    expect(
      within(table).getByRole("link", { name: `Editar ${mine.name}` }),
    ).toHaveAttribute("href", `/exercicios/${ownId}`);
    expect(
      within(table).getByRole("link", { name: `Ver detalhes de ${system.name}` }),
    ).toHaveAttribute("href", `/exercicios/${systemId}`);
    expect(
      within(table).queryByRole("button", { name: `Arquivar ${system.name}` }),
    ).toBeNull();

    const cards = screen.getByRole("list", { name: "Catálogo de exercícios" });
    expect(cards).toHaveClass("xl:hidden");
    for (const label of within(cards).getAllByText("Modalidade"))
      expect(label).toHaveClass("text-ink-secondary");
    expect(screen.getByRole("textbox", { name: "Buscar exercício" })).toHaveClass(
      "placeholder:text-ink-secondary",
    );
    expect(within(cards).getByText(mine.name)).toBeInTheDocument();
    expect(within(cards).getByText(system.name)).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.find(([url]) => String(url).includes("exercises?"))?.[1]
        ?.signal,
    ).toBeInstanceOf(AbortSignal);
  });

  it("archives an owned exercise only after accessible confirmation and announces success", async () => {
    installSuccessfulApi();
    renderCatalog();
    const table = await screen.findByRole("table");

    fireEvent.click(within(table).getByRole("button", { name: `Arquivar ${mine.name}` }));
    const dialog = screen.getByRole("alertdialog", {
      name: `Arquivar ${mine.name}?`,
    });
    expect(
      within(dialog).getByText(/deixa de aparecer no catálogo ativo/i),
    ).toBeVisible();
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: `Confirmar arquivamento de ${mine.name}`,
      }),
    );

    expect(await screen.findByText(`${mine.name} foi arquivado.`)).toHaveAttribute(
      "role",
      "status",
    );
    const archiveCall = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith(`/${ownId}/archive`),
    );
    expect(archiveCall?.[1]?.method).toBe("POST");
    expect(JSON.parse(String(archiveCall?.[1]?.body))).toMatchObject({
      expectedVersion: 3,
      operationId: expect.any(String),
    });
  });

  it("reuses the archive operation id when a timed-out request is retried", async () => {
    let archiveAttempts = 0;
    fetchMock.mockImplementation((input, init) => {
      const url = String(input);
      if (url.endsWith("/v1/exercises/options"))
        return Promise.resolve(Response.json(options));
      if (url.endsWith(`/${ownId}/archive`) && init?.method === "POST") {
        archiveAttempts += 1;
        return Promise.resolve(
          archiveAttempts === 1
            ? problem(504, "EXERCISE_CATALOG_UNAVAILABLE")
            : Response.json({
                id: ownId,
                ownerPersonalId: ownerId,
                name: mine.name,
                instructions: null,
                status: "ARCHIVED",
                modality: mine.modality,
                version: 4,
                equipmentIds: [equipmentId],
                primaryMuscleGroupIds: [muscleId],
                secondaryMuscleGroupIds: [],
                createdAt: timestamp,
                updatedAt: timestamp,
              }),
        );
      }
      if (url.includes("/v1/exercises?")) return Promise.resolve(page());
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });
    renderCatalog();
    const table = await screen.findByRole("table");
    fireEvent.click(within(table).getByRole("button", { name: `Arquivar ${mine.name}` }));
    const dialog = screen.getByRole("alertdialog");
    const confirm = within(dialog).getByRole("button", {
      name: `Confirmar arquivamento de ${mine.name}`,
    });
    fireEvent.click(confirm);
    expect(await within(dialog).findByRole("alert")).toBeVisible();
    fireEvent.click(confirm);
    expect(await screen.findByText(`${mine.name} foi arquivado.`)).toBeVisible();

    const archiveBodies = fetchMock.mock.calls
      .filter(([url]) => String(url).endsWith(`/${ownId}/archive`))
      .map(([, init]) => JSON.parse(String(init?.body)));
    expect(archiveBodies).toHaveLength(2);
    expect(archiveBodies[0].operationId).toBe(archiveBodies[1].operationId);
  });

  it("keeps search draft and focus while debouncing into backend-compatible URL state", async () => {
    vi.useFakeTimers();
    installSuccessfulApi();
    renderCatalog("ownership=MINE");
    const search = screen.getByRole("textbox", { name: "Buscar exercício" });
    search.focus();
    fireEvent.change(search, { target: { value: "goblet" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.getByRole("textbox", { name: "Buscar exercício" })).toHaveFocus();
    expect(navigation.params.get("search")).toBe("goblet");
    expect(navigation.params.get("ownership")).toBe("MINE");
    expect(navigation.params.get("page")).toBe("1");
  });

  it("loads controlled options and resets page when server filters change", async () => {
    installSuccessfulApi();
    renderCatalog("page=3");
    await screen.findByRole("table");

    const equipmentFilter = screen.getByRole("combobox", {
      name: "Filtrar por equipamento",
    });
    expect(within(equipmentFilter).getByRole("option", { name: "Halter" })).toHaveValue(
      equipmentId,
    );
    fireEvent.change(equipmentFilter, { target: { value: equipmentId } });
    expect(navigation.params.get("equipmentId")).toBe(equipmentId);
    expect(navigation.params.get("page")).toBe("1");
  });

  it.each([
    false,
    true,
  ])("distinguishes global and filtered empty states (%s)", async (filtered) => {
    installSuccessfulApi(() => page([], 0));
    renderCatalog(filtered ? "search=salto" : "");
    expect(
      await screen.findByText(
        filtered
          ? "Nenhum exercício corresponde aos filtros"
          : "Nenhum exercício disponível",
      ),
    ).toBeVisible();
    if (filtered) {
      fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
      expect(navigation.params.has("search")).toBe(false);
    }
  });

  it("explains forbidden access without exposing catalog rows", async () => {
    fetchMock.mockImplementation((input) =>
      String(input).endsWith("/options")
        ? Promise.resolve(Response.json(options))
        : Promise.resolve(problem(403, "EXERCISE_FORBIDDEN")),
    );
    renderCatalog();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Catálogo indisponível para esta conta",
    );
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("retries recoverable failures and includes code and correlation", async () => {
    let attempts = 0;
    fetchMock.mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith("/options")) return Promise.resolve(Response.json(options));
      attempts += 1;
      return Promise.resolve(attempts === 1 ? problem(500) : page([mine], 1));
    });
    renderCatalog();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("EXERCISE_CATALOG_UNAVAILABLE");
    expect(alert).toHaveTextContent("trace-exercise");
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByRole("table")).toBeVisible();
  });

  it("keeps an out-of-range page recoverable", async () => {
    installSuccessfulApi(() => page([], 21, 9));
    renderCatalog("page=9");
    expect(await screen.findByText("Nenhum exercício nesta página")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Primeira página" }));
    expect(navigation.params.get("page")).toBe("1");
  });

  it("announces a pending catalog without claiming zero results", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    renderCatalog();
    expect(screen.getByRole("status", { name: "Carregando exercícios" })).toBeVisible();
    expect(screen.queryByText(/0 exercícios encontrados/)).toBeNull();
  });

  it("does not persist a search draft when unmounted", async () => {
    vi.useFakeTimers();
    installSuccessfulApi();
    const storage = vi.spyOn(Storage.prototype, "setItem");
    const view = renderCatalog();
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar exercício" }), {
      target: { value: "privado" },
    });
    view.unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(storage).not.toHaveBeenCalled();
  });
});
