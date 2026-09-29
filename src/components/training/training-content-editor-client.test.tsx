// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TrainingContentEditorClient } from "./training-content-editor-client";

const mockReplace = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const ids = {
  exercise: "10000000-0000-4000-8000-000000000001",
  template: "20000000-0000-4000-8000-000000000001",
  templateVersion: "20000000-0000-4000-8000-000000000002",
  plan: "30000000-0000-4000-8000-000000000001",
  block: "40000000-0000-4000-8000-000000000001",
  workoutExercise: "50000000-0000-4000-8000-000000000001",
  prescription: "60000000-0000-4000-8000-000000000001",
  planWorkout: "70000000-0000-4000-8000-000000000001",
};
const timestamp = "2026-09-29T12:00:00Z";
const exercise = {
  id: ids.exercise,
  ownerPersonalId: null,
  name: "Agachamento livre",
  status: "ACTIVE",
  modality: "STRENGTH",
  version: 1,
  createdAt: timestamp,
  equipment: [],
  primaryMuscleGroups: [],
  secondaryMuscleGroups: [],
};
const templateItem = {
  id: ids.template,
  name: "Treino A",
  status: "PUBLISHED",
  version: 1,
  currentPublishedVersionId: ids.templateVersion,
  createdAt: timestamp,
  updatedAt: timestamp,
};

afterEach(() => {
  vi.unstubAllGlobals();
  mockReplace.mockReset();
});

function renderEditor(kind: "modelo" | "plano", fetcher: typeof fetch) {
  vi.stubGlobal("fetch", fetcher);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TrainingContentEditorClient kind={kind} />
    </QueryClientProvider>,
  );
}

describe("versioned training editor", () => {
  it("creates a workout template from the exercise catalog without actor identity", async () => {
    const createdTemplate = {
      ...templateItem,
      name: "Força A",
      status: "DRAFT",
      currentPublishedVersionId: null,
      notes: null,
      blocks: [
        {
          id: ids.block,
          position: 1,
          label: null,
          exercises: [
            {
              id: ids.workoutExercise,
              position: 1,
              exerciseId: ids.exercise,
              notes: null,
              prescription: {
                id: ids.prescription,
                sets: 3,
                repsMin: 8,
                repsMax: 12,
                suggestedLoadKg: null,
                restSeconds: 90,
              },
            },
          ],
        },
      ],
    };
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const path = String(input);
      if (path.includes("/exercises?")) {
        return Response.json({ items: [exercise], page: 1, pageSize: 20, totalCount: 1 });
      }
      if (path === "/api/backend/v1/workout-templates" && init?.method === "POST") {
        return Response.json(createdTemplate, { status: 201 });
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    renderEditor("modelo", fetcher);
    fireEvent.change(await screen.findByLabelText("Nome do treino"), {
      target: { value: "Força A" },
    });
    fireEvent.click(
      await screen.findByRole("button", { name: /Adicionar Agachamento livre/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    await waitFor(() => {
      const [, init] =
        fetcher.mock.calls.find(
          ([path, request]) =>
            String(path) === "/api/backend/v1/workout-templates" &&
            request?.method === "POST",
        ) ?? [];
      expect(init?.body).toBeDefined();
    });
    const [, request] =
      fetcher.mock.calls.find(
        ([path, init]) =>
          String(path) === "/api/backend/v1/workout-templates" && init?.method === "POST",
      ) ?? [];
    const payload = JSON.parse(String(request?.body));
    expect(payload).toMatchObject({ name: "Força A", notes: null });
    expect(payload).not.toHaveProperty("personalId");
    expect(payload.blocks).toHaveLength(1);
    expect(payload.blocks[0].exercises[0]).toMatchObject({
      exerciseId: ids.exercise,
      prescription: { sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90 },
    });
    expect(mockReplace).toHaveBeenCalledWith(`/treinos/${ids.template}?tipo=modelo`);
  });

  it("creates a weekly plan using only published workout versions", async () => {
    const createdPlan = {
      id: ids.plan,
      name: "Hipertrofia",
      status: "DRAFT",
      version: 1,
      currentPublishedVersionId: null,
      workouts: [
        {
          id: ids.planWorkout,
          position: 1,
          weekday: 1,
          label: null,
          workoutTemplateVersionId: ids.templateVersion,
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const path = String(input);
      if (path.includes("/workout-templates?")) {
        return Response.json({
          items: [templateItem],
          page: 1,
          pageSize: 20,
          totalCount: 1,
        });
      }
      if (path === "/api/backend/v1/training-plans" && init?.method === "POST") {
        return Response.json(createdPlan, { status: 201 });
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    renderEditor("plano", fetcher);
    fireEvent.change(await screen.findByLabelText("Nome do plano"), {
      target: { value: "Hipertrofia" },
    });
    fireEvent.change(await screen.findByLabelText("Treino de segunda-feira"), {
      target: { value: ids.templateVersion },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    await waitFor(() => {
      const [, init] =
        fetcher.mock.calls.find(
          ([path, request]) =>
            String(path) === "/api/backend/v1/training-plans" &&
            request?.method === "POST",
        ) ?? [];
      expect(init?.body).toBeDefined();
    });
    const [, request] =
      fetcher.mock.calls.find(
        ([path, init]) =>
          String(path) === "/api/backend/v1/training-plans" && init?.method === "POST",
      ) ?? [];
    const payload = JSON.parse(String(request?.body));
    expect(payload).toMatchObject({ name: "Hipertrofia" });
    expect(payload.workouts).toEqual([
      expect.objectContaining({
        position: 1,
        weekday: 1,
        workoutTemplateVersionId: ids.templateVersion,
      }),
    ]);
    expect(payload).not.toHaveProperty("studentId");
    expect(mockReplace).toHaveBeenCalledWith(`/treinos/${ids.plan}?tipo=plano`);
  });

  it("assigns a published immutable plan to an active student without actor identity", async () => {
    const student = {
      id: "40000000-0000-4000-8000-000000000001",
      name: "Ana Souza",
      email: "ana@example.test",
      status: "ACTIVE",
      linkedAt: timestamp,
    };
    const plan = {
      ...createdPlanFixture(),
      currentPublishedVersionId: ids.templateVersion,
      status: "PUBLISHED",
      version: 2,
    };
    const assignmentResponse = {
      id: "80000000-0000-4000-8000-000000000001",
      studentId: student.id,
      trainingPlanVersionId: ids.templateVersion,
      status: "SCHEDULED",
      startsOn: "2026-10-01",
      endsOn: null,
      replacesAssignmentId: null,
      replacementReason: null,
      version: 1,
      assignedAt: timestamp,
    };
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const path = String(input);
      if (path.includes("/workout-templates?")) {
        return Response.json({ items: [], page: 1, pageSize: 20, totalCount: 0 });
      }
      if (path === `/api/backend/v1/training-plans/${ids.plan}`) {
        return Response.json(plan);
      }
      if (path.includes("/students?")) {
        return Response.json({ items: [student], page: 1, pageSize: 20, totalCount: 1 });
      }
      if (path === "/api/backend/v1/workout-assignments" && init?.method === "POST") {
        return Response.json(assignmentResponse, { status: 201 });
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    vi.stubGlobal("fetch", fetcher);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <TrainingContentEditorClient kind="plano" resourceId={ids.plan} />
      </QueryClientProvider>,
    );

    fireEvent.change(await screen.findByLabelText("Aluno"), {
      target: { value: student.id },
    });
    fireEvent.change(screen.getByLabelText("Início"), {
      target: { value: "2026-10-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Atribuir plano" }));

    await screen.findByText("Plano atribuído a Ana Souza · agendado.");
    const [, request] =
      fetcher.mock.calls.find(
        ([path, init]) =>
          String(path) === "/api/backend/v1/workout-assignments" &&
          init?.method === "POST",
      ) ?? [];
    const payload = JSON.parse(String(request?.body));
    expect(payload).toMatchObject({
      studentId: student.id,
      trainingPlanVersionId: ids.templateVersion,
      startsOn: "2026-10-01",
      endsOn: null,
      replacesAssignmentId: null,
      replacementReason: null,
    });
    expect(payload).not.toHaveProperty("personalId");
    expect(payload).not.toHaveProperty("actorUserId");
  });
});

function createdPlanFixture() {
  return {
    id: ids.plan,
    name: "Hipertrofia",
    status: "DRAFT",
    version: 1,
    currentPublishedVersionId: null,
    workouts: [
      {
        id: ids.planWorkout,
        position: 1,
        weekday: 1,
        label: null,
        workoutTemplateVersionId: ids.templateVersion,
      },
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
