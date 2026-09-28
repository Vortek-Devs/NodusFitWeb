import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  ArchiveExerciseInput,
  CreateExerciseInput,
  ExerciseListFilter,
  ExerciseMutationResponse,
  UpdateExerciseInput,
} from "@/lib/contracts/exercises";
import {
  DEFAULT_EXERCISE_FILTERS,
  exerciseFiltersToSearchParams,
  exerciseQueryKeys,
  hasActiveExerciseFilters,
  normalizeExerciseListFilter,
} from "./exercise-query-keys";
import {
  archiveExercise,
  archiveExerciseMutationOptions,
  createExercise,
  createExerciseMutationOptions,
  getExercise,
  getExerciseOptions,
  listExercises,
  updateExercise,
  updateExerciseMutationOptions,
} from "./exercises-api";

const exerciseId = "53dc1d29-040b-4d67-9f16-c908bdd65660";
const ownerId = "68b8cd20-f648-4093-8918-d4eeb3970b7c";
const equipmentId = "d6b2f7ae-4f77-4604-9901-d1c73c7a64a9";
const muscleId = "a28f355f-a284-47ba-b76e-1b58a970852c";
const operationId = "239a4a18-8cfe-4c0c-9bed-75a7d9990f54";
const timestamp = "2026-09-21T12:34:56.1234567+00:00";

const option = { id: equipmentId, name: "Halter" };
const item = {
  id: exerciseId,
  ownerPersonalId: ownerId,
  name: "Agachamento goblet",
  status: "ACTIVE",
  modality: "STRENGTH",
  version: 1,
  createdAt: timestamp,
  equipment: [option],
  primaryMuscleGroups: [{ id: muscleId, name: "Quadríceps" }],
  secondaryMuscleGroups: [],
} as const;
const page = { items: [item], page: 1, pageSize: 20, totalCount: 1 };
const canonical: ExerciseMutationResponse = {
  id: exerciseId,
  ownerPersonalId: ownerId,
  name: item.name,
  instructions: "Conteúdo autoral Nodus.",
  status: "ACTIVE",
  modality: "STRENGTH",
  version: 1,
  equipmentIds: [equipmentId],
  primaryMuscleGroupIds: [muscleId],
  secondaryMuscleGroupIds: [],
  createdAt: timestamp,
  updatedAt: timestamp,
};
const createInput: CreateExerciseInput = {
  operationId,
  clientEntityId: exerciseId,
  name: canonical.name,
  instructions: canonical.instructions,
  modality: canonical.modality,
  equipmentIds: canonical.equipmentIds,
  primaryMuscleGroupIds: canonical.primaryMuscleGroupIds,
  secondaryMuscleGroupIds: canonical.secondaryMuscleGroupIds,
};

afterEach(() => vi.unstubAllGlobals());

describe("exercise filters and query keys", () => {
  it("normalizes allowlisted URL state without coercing hostile values", () => {
    const filter = normalizeExerciseListFilter(
      new URLSearchParams(
        `page=2&search=+goblet+&status=ARCHIVED&ownership=MINE&equipmentId=${equipmentId}` +
          `&muscleGroupId=${muscleId}&sortBy=CREATED_AT&sortDirection=DESC`,
      ),
    );
    expect(filter).toEqual({
      page: 2,
      pageSize: 20,
      search: "goblet",
      status: "ARCHIVED",
      ownership: "MINE",
      equipmentId,
      muscleGroupId: muscleId,
      sortBy: "CREATED_AT",
      sortDirection: "DESC",
    });
    expect(normalizeExerciseListFilter({ search: {}, equipmentId: "../me" })).toEqual(
      DEFAULT_EXERCISE_FILTERS,
    );
  });

  it("serializes a stable backend-compatible URL and tracks active filters", () => {
    const filter: ExerciseListFilter = {
      ...DEFAULT_EXERCISE_FILTERS,
      page: 2,
      search: "goblet",
      status: "ARCHIVED",
      ownership: "MINE",
      equipmentId,
      muscleGroupId: muscleId,
      sortBy: "CREATED_AT",
      sortDirection: "DESC",
    };
    expect(exerciseFiltersToSearchParams(filter).toString()).toBe(
      `page=2&pageSize=20&search=goblet&status=ARCHIVED&ownership=MINE&equipmentId=${equipmentId}` +
        `&muscleGroupId=${muscleId}&sortBy=CREATED_AT&sortDirection=DESC`,
    );
    expect(hasActiveExerciseFilters(DEFAULT_EXERCISE_FILTERS)).toBe(false);
    expect(hasActiveExerciseFilters(filter)).toBe(true);
  });

  it("builds stable hierarchical cache keys", () => {
    const filter = normalizeExerciseListFilter({ search: " goblet " });
    expect(exerciseQueryKeys.all).toEqual(["exercises"]);
    expect(exerciseQueryKeys.lists()).toEqual(["exercises", "list"]);
    expect(exerciseQueryKeys.list(filter)).toEqual(["exercises", "list", filter]);
    expect(exerciseQueryKeys.details()).toEqual(["exercises", "detail"]);
    expect(exerciseQueryKeys.detail(exerciseId)).toEqual([
      "exercises",
      "detail",
      exerciseId,
    ]);
    expect(exerciseQueryKeys.options()).toEqual(["exercises", "options"]);
  });
});

describe("exercise transport", () => {
  it("lists with the exact normalized query and forwards cancellation", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json(page));
    vi.stubGlobal("fetch", fetcher);
    const signal = new AbortController().signal;
    const filter = normalizeExerciseListFilter({ search: " goblet " });
    expect(await listExercises(filter, signal)).toEqual(page);
    expect(fetcher.mock.calls[0][0]).toBe(
      "/api/backend/v1/exercises?page=1&pageSize=20&search=goblet&status=ACTIVE&ownership=ALL&sortBy=NAME&sortDirection=ASC",
    );
    expect(fetcher.mock.calls[0][1].signal).toBe(signal);
  });

  it("loads options and detail while rejecting an unsafe path identifier", async () => {
    const options = { equipment: [option], muscleGroups: [] };
    const detail = { ...item, instructions: null, updatedAt: timestamp };
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json(options))
      .mockResolvedValueOnce(Response.json(detail));
    vi.stubGlobal("fetch", fetcher);
    const signal = new AbortController().signal;
    expect(await getExerciseOptions(signal)).toEqual(options);
    expect(await getExercise(exerciseId, signal)).toEqual(detail);
    expect(fetcher.mock.calls[0][0]).toBe("/api/backend/v1/exercises/options");
    expect(fetcher.mock.calls[1][0]).toBe(`/api/backend/v1/exercises/${exerciseId}`);
    expect(fetcher.mock.calls[0][1].signal).toBe(signal);
    expect(fetcher.mock.calls[1][1].signal).toBe(signal);
    await expect(getExercise("../me")).rejects.toThrow("EXERCISE_ID_INVALID");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("sends canonical create, update and archive bodies with their methods", async () => {
    const fetcher = vi
      .fn()
      .mockImplementation(() => Promise.resolve(Response.json(canonical)));
    vi.stubGlobal("fetch", fetcher);
    const signal = new AbortController().signal;
    const updateInput = { ...createInput, expectedVersion: 1 };
    const { clientEntityId: _clientEntityId, ...expectedUpdateBody } = updateInput;
    const archiveInput = { operationId, expectedVersion: 2 };

    await createExercise(createInput, signal);
    await updateExercise(exerciseId, updateInput, signal);
    await archiveExercise(exerciseId, archiveInput, signal);

    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "/api/backend/v1/exercises",
      `/api/backend/v1/exercises/${exerciseId}`,
      `/api/backend/v1/exercises/${exerciseId}/archive`,
    ]);
    expect(fetcher.mock.calls.map(([, init]) => init.method)).toEqual([
      "POST",
      "PUT",
      "POST",
    ]);
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(createInput);
    expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual(expectedUpdateBody);
    expect(JSON.parse(fetcher.mock.calls[2][1].body)).toEqual(archiveInput);
    expect(fetcher.mock.calls.every(([, init]) => init.signal === signal)).toBe(true);
    expect(
      fetcher.mock.calls.every(
        ([, init]) => init.headers.get("content-type") === "application/json",
      ),
    ).toBe(true);
  });

  it("rejects a malformed canonical mutation response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ ...canonical, version: 0 })),
    );
    await expect(createExercise(createInput)).rejects.toMatchObject({
      code: "INVALID_API_RESPONSE",
    });
  });
});

describe("exercise mutation cache", () => {
  it("invalidates list and canonical detail for every validated mutation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => Promise.resolve(Response.json(canonical))),
    );
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined);
    const updateInput: UpdateExerciseInput = {
      operationId,
      expectedVersion: 1,
      name: canonical.name,
      instructions: canonical.instructions,
      modality: canonical.modality,
      equipmentIds: canonical.equipmentIds,
      primaryMuscleGroupIds: canonical.primaryMuscleGroupIds,
      secondaryMuscleGroupIds: canonical.secondaryMuscleGroupIds,
    };
    const archiveInput: ArchiveExerciseInput = { operationId, expectedVersion: 2 };

    await new MutationObserver(client, createExerciseMutationOptions(client)).mutate(
      createInput,
    );
    await new MutationObserver(
      client,
      updateExerciseMutationOptions(client, exerciseId),
    ).mutate(updateInput);
    await new MutationObserver(
      client,
      archiveExerciseMutationOptions(client, exerciseId),
    ).mutate(archiveInput);

    expect(invalidate).toHaveBeenCalledTimes(6);
    for (let index = 0; index < 3; index += 1) {
      expect(invalidate).toHaveBeenNthCalledWith(index * 2 + 1, {
        queryKey: exerciseQueryKeys.lists(),
      });
      expect(invalidate).toHaveBeenNthCalledWith(index * 2 + 2, {
        queryKey: exerciseQueryKeys.detail(exerciseId),
      });
    }
  });

  it("does not invalidate when the upstream success body is not canonical", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ ...canonical, updatedAt: "invalid" })),
    );
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined);
    const observer = new MutationObserver(client, createExerciseMutationOptions(client));

    await expect(observer.mutate(createInput)).rejects.toMatchObject({
      code: "INVALID_API_RESPONSE",
    });
    expect(invalidate).not.toHaveBeenCalled();
  });
});
