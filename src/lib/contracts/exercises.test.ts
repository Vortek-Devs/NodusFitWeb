import { describe, expect, it } from "vitest";
import {
  isExerciseCatalogDetail,
  isExerciseCatalogOptions,
  isExerciseMutationResponse,
  isPagedExercises,
} from "./exercises";

const exerciseId = "53dc1d29-040b-4d67-9f16-c908bdd65660";
const ownerId = "68b8cd20-f648-4093-8918-d4eeb3970b7c";
const equipmentId = "d6b2f7ae-4f77-4604-9901-d1c73c7a64a9";
const muscleId = "a28f355f-a284-47ba-b76e-1b58a970852c";
const createdAt = "2026-09-21T12:34:56.1234567+00:00";

const option = { id: equipmentId, name: "Halter" };
const item = {
  id: exerciseId,
  ownerPersonalId: ownerId,
  name: "Agachamento goblet",
  status: "ACTIVE",
  modality: "STRENGTH",
  version: 1,
  createdAt,
  equipment: [option],
  primaryMuscleGroups: [{ id: muscleId, name: "Quadríceps" }],
  secondaryMuscleGroups: [],
};
const page = { items: [item], page: 1, pageSize: 20, totalCount: 1 };
const detail = {
  ...item,
  instructions: "Conteúdo autoral Nodus.",
  updatedAt: createdAt,
};
const mutation = {
  id: exerciseId,
  ownerPersonalId: ownerId,
  name: item.name,
  instructions: detail.instructions,
  status: item.status,
  modality: item.modality,
  version: 2,
  equipmentIds: [equipmentId],
  primaryMuscleGroupIds: [muscleId],
  secondaryMuscleGroupIds: [],
  createdAt,
  updatedAt: createdAt,
};

describe("exercise runtime contracts", () => {
  it("accepts every canonical response shape", () => {
    expect(isPagedExercises(page)).toBe(true);
    expect(isPagedExercises({ ...page, items: [], totalCount: 0 })).toBe(true);
    expect(isExerciseCatalogDetail(detail)).toBe(true);
    expect(
      isExerciseCatalogOptions({
        equipment: [option],
        muscleGroups: [{ id: muscleId, name: "Quadríceps" }],
      }),
    ).toBe(true);
    expect(isExerciseMutationResponse(mutation)).toBe(true);
  });

  it.each([
    { page: 0 },
    { page: 1.5 },
    { page: 2_147_483_648 },
    { pageSize: 0 },
    { pageSize: 101 },
    { totalCount: -1 },
    { totalCount: Number.MAX_SAFE_INTEGER + 1 },
    { items: [{ ...item, id: "not-a-uuid" }] },
    { items: [{ ...item, status: "UNKNOWN" }] },
    { items: [{ ...item, modality: "UNKNOWN" }] },
    { items: [{ ...item, version: 0 }] },
    { items: [{ ...item, version: Number.MAX_SAFE_INTEGER + 1 }] },
    { items: [{ ...item, createdAt: "2026-02-30T12:00:00Z" }] },
    { items: [{ ...item, equipment: [{ ...option, id: "invalid" }] }] },
    {
      items: [
        {
          ...item,
          secondaryMuscleGroups: [{ id: muscleId, name: "Quadríceps" }],
        },
      ],
    },
  ])("rejects an invalid page contract %j", (invalid) => {
    expect(isPagedExercises({ ...page, ...invalid })).toBe(false);
  });

  it.each([
    { ownerPersonalId: "invalid" },
    { instructions: 42 },
    { updatedAt: "yesterday" },
    { primaryMuscleGroups: [null] },
  ])("rejects an invalid detail contract %j", (invalid) => {
    expect(isExerciseCatalogDetail({ ...detail, ...invalid })).toBe(false);
  });

  it.each([
    { id: "invalid" },
    { ownerPersonalId: "invalid" },
    { version: 1.5 },
    { equipmentIds: ["invalid"] },
    { primaryMuscleGroupIds: [muscleId, muscleId] },
    { secondaryMuscleGroupIds: [muscleId] },
    { updatedAt: "2026-09-21" },
  ])("rejects an invalid mutation contract %j", (invalid) => {
    expect(isExerciseMutationResponse({ ...mutation, ...invalid })).toBe(false);
  });
});
