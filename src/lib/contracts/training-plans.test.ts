import { describe, expect, it } from "vitest";
import {
  isPagedTrainingPlans,
  isTrainingPlanResponse,
  type TrainingPlanListItem,
  type TrainingPlanResponse,
} from "./training-plans";

const plan: TrainingPlanResponse = {
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

  it("rejects set loads outside the API range and precision", () => {
    for (const loadKg of [10_000, 40.001, Number.POSITIVE_INFINITY]) {
      const malformed = structuredClone(plan);
      malformed.days[0].exercises[0].sets[0].loadKg = loadKg;
      expect(isTrainingPlanResponse(malformed)).toBe(false);
    }
  });

  it("accepts the API maximum two-decimal load", () => {
    const maximumLoad = structuredClone(plan);
    maximumLoad.days[0].exercises[0].sets[0].loadKg = 9_999.99;
    expect(isTrainingPlanResponse(maximumLoad)).toBe(true);
  });

  it("rejects set values outside API bounds and incompatible targets", () => {
    const invalidSets = [
      { targetRepetitions: 101 },
      { targetDurationSeconds: 7_201 },
      { restSeconds: 3_601 },
      { targetRepetitions: 10, targetDurationSeconds: 60 },
      { targetRepetitions: null, loadKg: 40 },
    ];

    for (const invalidSet of invalidSets) {
      const malformed = structuredClone(plan);
      Object.assign(malformed.days[0].exercises[0].sets[0], invalidSet);
      expect(isTrainingPlanResponse(malformed)).toBe(false);
    }
  });

  it("accepts maximum API repetitions, duration, and rest values", () => {
    const maximumValues = structuredClone(plan);
    Object.assign(maximumValues.days[0].exercises[0].sets[0], {
      targetRepetitions: 100,
      targetDurationSeconds: null,
      restSeconds: 3_600,
    });
    expect(isTrainingPlanResponse(maximumValues)).toBe(true);

    const maximumDuration = structuredClone(plan);
    Object.assign(maximumDuration.days[0].exercises[0].sets[0], {
      targetRepetitions: null,
      targetDurationSeconds: 7_200,
      loadKg: null,
    });
    expect(isTrainingPlanResponse(maximumDuration)).toBe(true);
  });

  it("rejects content outside API limits and duplicate nested positions", () => {
    const tooLongName = structuredClone(plan);
    tooLongName.name = "N".repeat(121);

    const tooLongNotes = structuredClone(plan);
    Object.assign(tooLongNotes, { notes: "N".repeat(2_001) });

    const tooLongDayName = structuredClone(plan);
    tooLongDayName.days[0].name = "D".repeat(121);

    const tooLongDayCode = structuredClone(plan);
    tooLongDayCode.days[0].code = "D".repeat(9);

    const tooManyDays = structuredClone(plan);
    tooManyDays.days = Array.from({ length: 13 }, (_, index) => ({
      ...structuredClone(plan.days[0]),
      code: `DAY${index + 1}`,
      position: index + 1,
    }));

    const duplicateDayCode = structuredClone(plan);
    duplicateDayCode.days.push({
      ...structuredClone(plan.days[0]),
      id: "00000000-0000-4000-8000-000000000008",
      code: "a",
      position: 2,
    });

    const invalidDayPosition = structuredClone(plan);
    invalidDayPosition.days[0].position = 13;

    const duplicateDayPosition = structuredClone(plan);
    duplicateDayPosition.days.push({
      ...structuredClone(plan.days[0]),
      id: "00000000-0000-4000-8000-000000000011",
      code: "B",
    });

    const invalidDayCode = structuredClone(plan);
    invalidDayCode.days[0].code = "D!";

    const tooManyExercises = structuredClone(plan);
    tooManyExercises.days[0].exercises = Array.from({ length: 31 }, (_, index) => ({
      ...structuredClone(plan.days[0].exercises[0]),
      position: index + 1,
    }));

    const duplicateExercisePosition = structuredClone(plan);
    duplicateExercisePosition.days[0].exercises.push({
      ...structuredClone(plan.days[0].exercises[0]),
      id: "00000000-0000-4000-8000-000000000009",
    });

    const invalidExercisePosition = structuredClone(plan);
    invalidExercisePosition.days[0].exercises[0].position = 31;

    const invalidSupersetGroup = structuredClone(plan);
    Object.assign(invalidSupersetGroup.days[0].exercises[0], { supersetGroup: "A!" });

    const tooLongSupersetGroup = structuredClone(plan);
    Object.assign(tooLongSupersetGroup.days[0].exercises[0], {
      supersetGroup: "G".repeat(21),
    });

    const tooManySets = structuredClone(plan);
    tooManySets.days[0].exercises[0].sets = Array.from({ length: 21 }, (_, index) => ({
      ...structuredClone(plan.days[0].exercises[0].sets[0]),
      number: index + 1,
    }));

    const duplicateSetNumber = structuredClone(plan);
    duplicateSetNumber.days[0].exercises[0].sets.push({
      ...structuredClone(plan.days[0].exercises[0].sets[0]),
      id: "00000000-0000-4000-8000-000000000010",
    });

    const invalidSetNumber = structuredClone(plan);
    invalidSetNumber.days[0].exercises[0].sets[0].number = 21;

    const malformedPlans: Array<[string, unknown]> = [
      ["plan name length", tooLongName],
      ["plan notes length", tooLongNotes],
      ["day name length", tooLongDayName],
      ["day code length", tooLongDayCode],
      ["day count", tooManyDays],
      ["case-insensitive day code uniqueness", duplicateDayCode],
      ["day position uniqueness", duplicateDayPosition],
      ["day position range", invalidDayPosition],
      ["day code format", invalidDayCode],
      ["exercise count per day", tooManyExercises],
      ["exercise position uniqueness", duplicateExercisePosition],
      ["exercise position range", invalidExercisePosition],
      ["superset group format", invalidSupersetGroup],
      ["superset group length", tooLongSupersetGroup],
      ["set count per exercise", tooManySets],
      ["set number uniqueness", duplicateSetNumber],
      ["set number range", invalidSetNumber],
    ];

    for (const [constraint, malformed] of malformedPlans) {
      expect(isTrainingPlanResponse(malformed), constraint).toBe(false);
    }
  });

  it("accepts the API maximum plan, day, exercise, and set sizes", () => {
    const maximumFields = structuredClone(plan);
    maximumFields.name = "N".repeat(120);
    Object.assign(maximumFields, { notes: "N".repeat(2_000) });
    maximumFields.days[0].code = "D".repeat(8);
    maximumFields.days[0].name = "D".repeat(120);
    maximumFields.days[0].position = 12;
    maximumFields.days[0].exercises[0].position = 30;
    Object.assign(maximumFields.days[0].exercises[0], { supersetGroup: "G".repeat(20) });
    Object.assign(maximumFields.days[0].exercises[0].sets[0], {
      number: 20,
      targetRepetitions: 100,
      loadKg: 9_999.99,
      restSeconds: 3_600,
    });

    const maximumDays = structuredClone(plan);
    maximumDays.days = Array.from({ length: 12 }, (_, index) => ({
      ...structuredClone(plan.days[0]),
      id: `00000000-0000-4000-8000-${String(index + 20).padStart(12, "0")}`,
      code: `DAY${index + 1}`,
      position: index + 1,
      exercises: [],
    }));

    const maximumExercises = structuredClone(plan);
    maximumExercises.days[0].exercises = Array.from({ length: 30 }, (_, index) => ({
      ...structuredClone(plan.days[0].exercises[0]),
      id: `00000000-0000-4000-8000-${String(index + 100).padStart(12, "0")}`,
      position: index + 1,
      sets: [],
    }));

    const maximumSets = structuredClone(plan);
    maximumSets.days[0].exercises[0].sets = Array.from({ length: 20 }, (_, index) => ({
      ...structuredClone(plan.days[0].exercises[0].sets[0]),
      id: `00000000-0000-4000-8000-${String(index + 200).padStart(12, "0")}`,
      number: index + 1,
    }));

    for (const maximum of [maximumFields, maximumDays, maximumExercises, maximumSets]) {
      expect(isTrainingPlanResponse(maximum)).toBe(true);
    }

    expect(
      isPagedTrainingPlans({
        items: [
          {
            id: plan.id,
            studentProfileId: plan.studentProfileId,
            name: "N".repeat(120),
            status: plan.status,
            version: 1,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
            publishedAt: null,
            dayCount: 12,
            exerciseCount: 360,
          },
        ],
        page: 1,
        pageSize: 100,
        totalCount: 1,
      }),
    ).toBe(true);
  });

  it("enforces published-plan invariants and list summary limits", () => {
    const publishedWithoutTimestamp = {
      ...structuredClone(plan),
      status: "PUBLISHED" as const,
    };

    const draftWithTimestamp = {
      ...structuredClone(plan),
      publishedAt: plan.createdAt,
    };

    const publishedWithoutDays = {
      ...structuredClone(plan),
      status: "PUBLISHED" as const,
      publishedAt: plan.createdAt,
      days: [],
    };

    const publishedWithoutExercises = {
      ...structuredClone(plan),
      status: "PUBLISHED" as const,
      publishedAt: plan.createdAt,
    };
    publishedWithoutExercises.days[0].exercises = [];

    const publishedWithoutSets = {
      ...structuredClone(plan),
      status: "PUBLISHED" as const,
      publishedAt: plan.createdAt,
    };
    publishedWithoutSets.days[0].exercises[0].sets = [];

    const publishedWithoutTargets = {
      ...structuredClone(plan),
      status: "PUBLISHED" as const,
      publishedAt: plan.createdAt,
    };
    Object.assign(publishedWithoutTargets.days[0].exercises[0].sets[0], {
      targetRepetitions: null,
      targetDurationSeconds: null,
      loadKg: null,
    });

    const publishedWithUnmatchedSuperset = {
      ...structuredClone(plan),
      status: "PUBLISHED" as const,
      publishedAt: plan.createdAt,
    };
    Object.assign(publishedWithUnmatchedSuperset.days[0].exercises[0], {
      supersetGroup: "SUPERSET_A",
    });

    const listItem: TrainingPlanListItem = {
      id: plan.id,
      studentProfileId: plan.studentProfileId,
      name: plan.name,
      status: "DRAFT" as const,
      version: 1,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      publishedAt: null,
      dayCount: 0,
      exerciseCount: 0,
    };
    const pageFor = (item: TrainingPlanListItem) => ({
      items: [item],
      page: 1,
      pageSize: 20,
      totalCount: 1,
    });

    const malformedListItems: Array<[string, TrainingPlanListItem]> = [
      ["day count", { ...listItem, dayCount: 13 }],
      ["exercise count", { ...listItem, exerciseCount: 361 }],
      ["published timestamp", { ...listItem, status: "PUBLISHED" }],
      ["draft publication timestamp", { ...listItem, publishedAt: plan.createdAt }],
    ];

    const malformedPlans: Array<[string, unknown]> = [
      ["published timestamp", publishedWithoutTimestamp],
      ["draft publication timestamp", draftWithTimestamp],
      ["published day count", publishedWithoutDays],
      ["published day exercises", publishedWithoutExercises],
      ["published exercise sets", publishedWithoutSets],
      ["published set target", publishedWithoutTargets],
      ["published superset pairing", publishedWithUnmatchedSuperset],
    ];

    for (const [constraint, malformed] of malformedPlans) {
      expect(isTrainingPlanResponse(malformed), constraint).toBe(false);
    }

    for (const [constraint, malformed] of malformedListItems) {
      expect(isPagedTrainingPlans(pageFor(malformed)), `list summary ${constraint}`).toBe(
        false,
      );
    }

    const validPublishedPlan = {
      ...structuredClone(plan),
      status: "PUBLISHED" as const,
      publishedAt: plan.createdAt,
    };
    expect(isTrainingPlanResponse(validPublishedPlan)).toBe(true);

    const validSupersetPlan: TrainingPlanResponse = structuredClone(validPublishedPlan);
    Object.assign(validSupersetPlan.days[0].exercises[0], {
      supersetGroup: "SUPERSET_A",
    });
    validSupersetPlan.days[0].exercises.push({
      ...structuredClone(plan.days[0].exercises[0]),
      id: "00000000-0000-4000-8000-000000000012",
      position: 2,
      supersetGroup: "SUPERSET_A",
    });
    expect(isTrainingPlanResponse(validSupersetPlan)).toBe(true);
  });
});
