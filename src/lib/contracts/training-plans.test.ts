import { describe, expect, it } from "vitest";
import { isPagedTrainingPlans, isTrainingPlanResponse } from "./training-plans";

const plan = {
  id: "00000000-0000-4000-8000-000000000001",
  personalProfileId: "00000000-0000-4000-8000-000000000002",
  studentProfileId: "00000000-0000-4000-8000-000000000003",
  name: "Hipertrofia fase 1",
  notes: null,
  status: "DRAFT",
  version: 1,
  createdAt: "2026-09-27T12:00:00Z",
  updatedAt: "2026-09-27T12:00:00Z",
  publishedAt: null,
  days: [
    {
      id: "00000000-0000-4000-8000-000000000004",
      code: "A",
      name: "Peito e tríceps",
      position: 1,
      exercises: [
        {
          id: "00000000-0000-4000-8000-000000000005",
          exerciseId: "00000000-0000-4000-8000-000000000006",
          exerciseName: "Supino reto",
          position: 1,
          supersetGroup: null,
          sets: [
            {
              id: "00000000-0000-4000-8000-000000000007",
              number: 1,
              targetRepetitions: 10,
              loadKg: 40,
              restSeconds: 90,
              targetDurationSeconds: null,
            },
          ],
        },
      ],
    },
  ],
};

describe("training plan contracts", () => {
  it("accepts API plan details and paged list responses", () => {
    expect(isTrainingPlanResponse(plan)).toBe(true);
    expect(
      isPagedTrainingPlans({
        items: [
          {
            id: plan.id,
            studentProfileId: plan.studentProfileId,
            name: plan.name,
            status: plan.status,
            version: 1,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
            publishedAt: null,
            dayCount: 1,
            exerciseCount: 1,
          },
        ],
        page: 1,
        pageSize: 20,
        totalCount: 1,
      }),
    ).toBe(true);
  });

  it("rejects malformed nested data and impossible set values", () => {
    const malformed = structuredClone(plan);
    malformed.days[0].exercises[0].sets[0].loadKg = -1;
    expect(isTrainingPlanResponse(malformed)).toBe(false);
    expect(
      isPagedTrainingPlans({ items: [plan], page: 1, pageSize: 20, totalCount: 1 }),
    ).toBe(false);
  });
});
