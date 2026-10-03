import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createWorkoutAssignment,
  createWorkoutTemplate,
  getTrainingPlan,
  listTrainingPlans,
  listWorkoutTemplates,
  publishWorkoutTemplate,
  updateTrainingPlan,
} from "./training-api";

const id = "10000000-0000-4000-8000-000000000001";
const versionId = "10000000-0000-4000-8000-000000000002";
const timestamp = "2026-09-23T12:00:00Z";
const item = {
  id,
  name: "Treino A",
  status: "DRAFT",
  version: 1,
  currentPublishedVersionId: null,
  createdAt: timestamp,
  updatedAt: timestamp,
};
const filter = {
  page: 2,
  pageSize: 20,
  search: "força & mobilidade",
  status: "ALL" as const,
  sortBy: "UPDATED_AT" as const,
  sortDirection: "DESC" as const,
};

afterEach(() => vi.unstubAllGlobals());

describe("training API", () => {
  it("queries both paginated resources through the cookie BFF with escaped filters and abort signal", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () =>
        Response.json({ items: [item], page: 2, pageSize: 20, totalCount: 21 }),
      );
    vi.stubGlobal("fetch", fetcher);
    const signal = new AbortController().signal;

    await listWorkoutTemplates(filter, signal);
    await listTrainingPlans(filter, signal);

    expect(fetcher.mock.calls.map(([path]) => String(path))).toEqual([
      "/api/backend/v1/workout-templates?page=2&pageSize=20&search=for%C3%A7a+%26+mobilidade&status=ALL&sortBy=UPDATED_AT&sortDirection=DESC",
      "/api/backend/v1/training-plans?page=2&pageSize=20&search=for%C3%A7a+%26+mobilidade&status=ALL&sortBy=UPDATED_AT&sortDirection=DESC",
    ]);
    expect(
      fetcher.mock.calls.every(
        ([, init]) => init?.signal === signal && init?.credentials === "include",
      ),
    ).toBe(true);
  });

  it("sends exact create/update/publish bodies without actor identity", async () => {
    const template = { ...item, notes: null, blocks: [] };
    const plan = { ...item, workouts: [] };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(template))
      .mockResolvedValueOnce(Response.json(plan))
      .mockResolvedValueOnce(Response.json(template));
    vi.stubGlobal("fetch", fetcher);
    const create = {
      operationId: id,
      clientEntityId: id,
      name: "Treino A",
      notes: null,
      blocks: [],
    };
    const update = {
      operationId: id,
      expectedVersion: 1,
      name: "Plano",
      workouts: [
        {
          clientEntityId: id,
          position: 1,
          weekday: 1,
          label: null,
          workoutTemplateVersionId: versionId,
        },
      ],
    };

    await createWorkoutTemplate(create);
    await updateTrainingPlan(id, update);
    await publishWorkoutTemplate(id, { operationId: id, expectedVersion: 1 });

    expect(
      fetcher.mock.calls.map(([path, init]) => [
        path,
        init?.method,
        JSON.parse(String(init?.body)),
      ]),
    ).toEqual([
      ["/api/backend/v1/workout-templates", "POST", create],
      [`/api/backend/v1/training-plans/${id}`, "PUT", update],
      [
        `/api/backend/v1/workout-templates/${id}/publish`,
        "POST",
        { operationId: id, expectedVersion: 1 },
      ],
    ]);
  });

  it("assigns a published plan using the cookie identity and an idempotent payload", async () => {
    const assignment = {
      id: "30000000-0000-4000-8000-000000000001",
      studentId: "40000000-0000-4000-8000-000000000001",
      trainingPlanVersionId: "50000000-0000-4000-8000-000000000001",
      status: "SCHEDULED",
      startsOn: "2026-09-29",
      endsOn: null,
      replacesAssignmentId: null,
      replacementReason: null,
      version: 1,
      assignedAt: timestamp,
    };
    const input = {
      operationId: "10000000-0000-4000-8000-000000000001",
      clientEntityId: "20000000-0000-4000-8000-000000000001",
      studentId: assignment.studentId,
      trainingPlanVersionId: assignment.trainingPlanVersionId,
      startsOn: assignment.startsOn,
      endsOn: null,
      replacesAssignmentId: null,
      replacementReason: null,
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(assignment, { status: 201 }));
    vi.stubGlobal("fetch", fetcher);

    await createWorkoutAssignment(input);

    const [path, init] = fetcher.mock.calls[0];
    expect(path).toBe("/api/backend/v1/workout-assignments");
    expect(init).toMatchObject({
      method: "POST",
      body: JSON.stringify(input),
      credentials: "include",
      cache: "no-store",
    });
    expect(new Headers(init?.headers).get("content-type")).toBe("application/json");
    expect(input).not.toHaveProperty("personalId");
    expect(input).not.toHaveProperty("actorUserId");
  });

  it("rejects malformed detail and invalid route identity", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ ...item, workouts: [{ weekday: "1" }] }));
    vi.stubGlobal("fetch", fetcher);
    await expect(getTrainingPlan(id)).rejects.toMatchObject({
      code: "INVALID_API_RESPONSE",
    });
    await expect(getTrainingPlan("not-an-id")).rejects.toThrow(
      "TRAINING_PLAN_ID_INVALID",
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
