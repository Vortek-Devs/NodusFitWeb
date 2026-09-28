// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExerciseForm } from "./exercise-form";

const navigation = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation }));

const exerciseId = "11111111-1111-4111-8111-111111111111";
const equipmentId = "22222222-2222-4222-8222-222222222222";
const primaryId = "33333333-3333-4333-8333-333333333333";
const secondaryId = "44444444-4444-4444-8444-444444444444";
const ownerId = "55555555-5555-4555-8555-555555555555";
const options = {
  equipment: [{ id: equipmentId, name: "Halter" }],
  muscleGroups: [
    { id: primaryId, name: "Peitoral" },
    { id: secondaryId, name: "Tríceps" },
  ],
};
const detail = {
  id: exerciseId,
  ownerPersonalId: ownerId,
  name: "Supino reto",
  instructions: "Controle a descida.",
  status: "ACTIVE",
  modality: "STRENGTH",
  version: 3,
  createdAt: "2026-09-20T10:00:00Z",
  updatedAt: "2026-09-20T10:00:00Z",
  equipment: options.equipment,
  primaryMuscleGroups: [options.muscleGroups[0]],
  secondaryMuscleGroups: [options.muscleGroups[1]],
};
const mutationResponse = {
  id: exerciseId,
  ownerPersonalId: ownerId,
  name: "Supino inclinado",
  instructions: "Controle a descida.",
  status: "ACTIVE",
  modality: "STRENGTH",
  version: 4,
  createdAt: "2026-09-20T10:00:00Z",
  updatedAt: "2026-09-21T10:00:00Z",
  equipmentIds: [equipmentId],
  primaryMuscleGroupIds: [primaryId],
  secondaryMuscleGroupIds: [secondaryId],
};

const fetchMock = vi.fn<typeof fetch>();
const clients: QueryClient[] = [];

function mount(props: Parameters<typeof ExerciseForm>[0] = {}) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <ExerciseForm {...props} />
    </QueryClientProvider>,
  );
}

function requestPath(input: RequestInfo | URL) {
  return typeof input === "string"
    ? input
    : input instanceof URL
      ? input.href
      : input.url;
}

beforeEach(() => {
  navigation.replace.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  for (const client of clients.splice(0)) client.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("exercise form", () => {
  it("creates a custom exercise with canonical IDs and announces success", async () => {
    const generatedIds = [
      "66666666-6666-4666-8666-666666666666",
      "77777777-7777-4777-8777-777777777777",
    ] as const;
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce(generatedIds[0])
      .mockReturnValueOnce(generatedIds[1]);
    fetchMock.mockImplementation(async (input, init) => {
      const path = requestPath(input);
      if (path.endsWith("/options")) return Response.json(options);
      if (path.endsWith("/v1/exercises") && init?.method === "POST") {
        return Response.json({ ...mutationResponse, version: 1 }, { status: 201 });
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    mount();
    fireEvent.change(await screen.findByLabelText("Nome do exercício"), {
      target: { value: "Supino inclinado" },
    });
    fireEvent.change(screen.getByLabelText("Instruções"), {
      target: { value: "Controle a descida." },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Selecionar Halter" }));
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Peitoral como grupo principal" }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Tríceps como grupo secundário" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Criar exercício" }));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledTimes(1));
    const createCall = fetchMock.mock.calls.find(
      ([input, init]) =>
        requestPath(input).endsWith("/v1/exercises") && init?.method === "POST",
    );
    expect(JSON.parse(String(createCall?.[1]?.body))).toEqual({
      operationId: generatedIds[1],
      clientEntityId: generatedIds[0],
      name: "Supino inclinado",
      instructions: "Controle a descida.",
      modality: "STRENGTH",
      equipmentIds: [equipmentId],
      primaryMuscleGroupIds: [primaryId],
      secondaryMuscleGroupIds: [secondaryId],
    });
    expect(navigation.replace).toHaveBeenCalledWith(
      `/exercicios/${exerciseId}?saved=created`,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Exercício criado com sucesso.");
  });

  it("edits an owned exercise with optimistic version and archives after confirmation", async () => {
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce("66666666-6666-4666-8666-666666666666")
      .mockReturnValueOnce("77777777-7777-4777-8777-777777777777");
    fetchMock.mockImplementation(async (input, init) => {
      const path = requestPath(input);
      if (path.endsWith("/options")) return Response.json(options);
      if (path.endsWith(`/v1/exercises/${exerciseId}/archive`)) {
        return Response.json({ ...mutationResponse, status: "ARCHIVED", version: 4 });
      }
      if (path.endsWith(`/v1/exercises/${exerciseId}`) && init?.method === "PUT") {
        return Response.json(mutationResponse);
      }
      if (path.endsWith(`/v1/exercises/${exerciseId}`)) return Response.json(detail);
      throw new Error(`Unexpected request: ${path}`);
    });

    mount({ exerciseId });
    const name = await screen.findByLabelText("Nome do exercício");
    expect(name).toHaveValue("Supino reto");
    fireEvent.change(name, { target: { value: "Supino inclinado" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await screen.findByText("Exercício atualizado com sucesso.");
    const updateCall = fetchMock.mock.calls.find(
      ([input, init]) =>
        requestPath(input).endsWith(`/v1/exercises/${exerciseId}`) &&
        init?.method === "PUT",
    );
    expect(JSON.parse(String(updateCall?.[1]?.body))).toMatchObject({
      expectedVersion: 3,
      name: "Supino inclinado",
    });

    fireEvent.click(screen.getByRole("button", { name: "Arquivar exercício" }));
    const confirmation = screen.getByRole("alertdialog");
    expect(confirmation).toHaveTextContent(
      "O exercício deixará de aparecer no catálogo ativo.",
    );
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    fireEvent.keyDown(confirmation, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Arquivar exercício" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Arquivar exercício" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar arquivamento" }));
    await screen.findByText("Exercício arquivado com sucesso.");
    const archiveCall = fetchMock.mock.calls.find(([input]) =>
      requestPath(input).endsWith(`/v1/exercises/${exerciseId}/archive`),
    );
    expect(JSON.parse(String(archiveCall?.[1]?.body))).toMatchObject({
      expectedVersion: 3,
    });
  });

  it("renders a system exercise as read-only", async () => {
    fetchMock.mockImplementation(async (input) => {
      const path = requestPath(input);
      if (path.endsWith("/options")) {
        return Response.json(
          {
            title: "Falha nas opções",
            detail: "Opções temporariamente indisponíveis.",
            status: 500,
            code: "OPTIONS_UNAVAILABLE",
          },
          { status: 500 },
        );
      }
      if (path.endsWith(`/v1/exercises/${exerciseId}`)) {
        return Response.json({ ...detail, ownerPersonalId: null });
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    mount({ exerciseId });
    expect(await screen.findByRole("heading", { name: "Supino reto" })).toBeVisible();
    expect(screen.getByText("Exercício do sistema")).toBeVisible();
    expect(screen.queryByLabelText("Nome do exercício")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Salvar alterações" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Arquivar exercício" }),
    ).not.toBeInTheDocument();
  });

  it("shows field validation, backend correlation and keeps muscle roles disjoint", async () => {
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce("66666666-6666-4666-8666-666666666666")
      .mockReturnValueOnce("77777777-7777-4777-8777-777777777777");
    fetchMock.mockImplementation(async (input, init) => {
      const path = requestPath(input);
      if (path.endsWith("/options")) return Response.json(options);
      if (path.endsWith("/v1/exercises") && init?.method === "POST") {
        return Response.json(
          {
            title: "Dados inválidos",
            detail: "Revise o formulário.",
            status: 400,
            code: "VALIDATION_ERROR",
            traceId: "trace-exercise-form",
            errors: { Name: ["Nome já utilizado."] },
          },
          { status: 400 },
        );
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    mount();
    fireEvent.click(await screen.findByRole("button", { name: "Criar exercício" }));
    expect(screen.getByText("Informe o nome do exercício.")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText("Nome do exercício"), {
      target: { value: "Remada" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Peitoral como grupo principal" }),
    );
    expect(
      screen.getByRole("checkbox", { name: "Peitoral como grupo secundário" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Criar exercício" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Nome já utilizado.");
    expect(alert).toHaveTextContent("Correlação: trace-exercise-form");
    expect(screen.getByLabelText("Nome do exercício")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("announces the server-provided creation confirmation on detail", async () => {
    fetchMock.mockImplementation(async (input) => {
      const path = requestPath(input);
      if (path.endsWith("/options")) return Response.json(options);
      if (path.endsWith(`/v1/exercises/${exerciseId}`)) return Response.json(detail);
      throw new Error(`Unexpected request: ${path}`);
    });

    mount({ exerciseId, initialAnnouncement: "Exercício criado com sucesso." });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Exercício criado com sucesso.",
    );
    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith(`/exercicios/${exerciseId}`, {
        scroll: false,
      }),
    );
  });
});
