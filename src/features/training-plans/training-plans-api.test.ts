import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TrainingPlanResponse } from "@/lib/contracts/training-plans";
import { trainingPlanQueryKeys } from "./training-plan-query-keys";
import {
  createTrainingPlan,
  getTrainingPlan,
  listTrainingPlans,
  publishTrainingPlan,
  saveTrainingPlanMutationOptions,
  trainingPlanDetailQueryOptions,
  trainingPlanListQueryOptions,
} from "./training-plans-api";

const studentId = "00000000-0000-4000-8000-000000000001";
const planId = "00000000-0000-4000-8000-000000000002";
const operationId = "00000000-0000-4000-8000-000000000003";
const timestamp = "2026-09-27T12:00:00Z";
const plan: TrainingPlanResponse = {
  id: planId,
  personalProfileId: "00000000-0000-4000-8000-000000000004",
  studentProfileId: studentId,
  name: "Treino A",
  notes: null,
  status: "DRAFT",
  version: 1,
  createdAt: timestamp,
  updatedAt: timestamp,
  publishedAt: null,
  days: [],
};

afterEach(() => vi.unstubAllGlobals());

describe("training plan transport", () => {
  it("uses the student-scoped list and plan detail endpoints", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ items: [], page: 1, pageSize: 20, totalCount: 0 }),
      )
      .mockResolvedValueOnce(Response.json(plan));
    vi.stubGlobal("fetch", fetcher);
    const signal = new AbortController().signal;

    await listTrainingPlans(studentId, 2, signal);
    await getTrainingPlan(planId, signal);

    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      `/api/backend/v1/students/${studentId}/training-plans?page=2&pageSize=20`,
      `/api/backend/v1/training-plans/${planId}`,
    ]);
    expect(fetcher.mock.calls.every(([, init]) => init.signal === signal)).toBe(true);
  });

  it("sends create and publish requests with stable request identifiers", async () => {
    const fetcher = vi
      .fn()
      .mockImplementation(() => Promise.resolve(Response.json(plan)));
    vi.stubGlobal("fetch", fetcher);
    const draft = {
      operationId,
      clientEntityId: planId,
      name: "Treino A",
      notes: null,
      days: [],
    };

    await createTrainingPlan(studentId, draft);
    await publishTrainingPlan(planId, { operationId, expectedVersion: 1 });

    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      `/api/backend/v1/students/${studentId}/training-plans`,
      `/api/backend/v1/training-plans/${planId}/publish`,
    ]);
    expect(fetcher.mock.calls.map(([, init]) => init.method)).toEqual(["POST", "POST"]);
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(draft);
    expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({
      operationId,
      expectedVersion: 1,
    });
  });

  it("rejects invalid identifiers before sending a request", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(listTrainingPlans("../student")).rejects.toThrow("STUDENT_ID_INVALID");
    await expect(getTrainingPlan("../plan")).rejects.toThrow("TRAINING_PLAN_ID_INVALID");
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("training plan queries and mutations", () => {
  it("uses stable student and detail keys and caches saves before invalidating lists", async () => {
    expect(trainingPlanListQueryOptions(studentId, 2).queryKey).toEqual([
      "training-plans",
      "list",
      studentId,
      2,
    ]);
    expect(trainingPlanDetailQueryOptions(planId).queryKey).toEqual([
      "training-plans",
      "detail",
      planId,
    ]);

    const client = new QueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(plan)));
    const mutation = client
      .getMutationCache()
      .build(client, saveTrainingPlanMutationOptions(client));
    const saved = await mutation.execute({
      studentId,
      planId: null,
      expectedVersion: null,
      draft: { name: plan.name, notes: null, days: [] },
      operationId,
      clientEntityId: planId,
    });

    expect(saved).toEqual(plan);
    expect(client.getQueryData(trainingPlanQueryKeys.detail(planId))).toEqual(plan);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: trainingPlanQueryKeys.lists() });
  });
});
