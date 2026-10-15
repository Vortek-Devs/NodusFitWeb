import { describe, expect, it } from "vitest";

const assignmentResponse = {
  items: [
    {
      id: "10000000-0000-4000-8000-000000000001",
      status: "SCHEDULED",
      startsOn: "2026-09-29",
      endsOn: "2026-11-22",
      version: 1,
      planVersion: {
        id: "20000000-0000-4000-8000-000000000001",
        versionNumber: 1,
        name: "Plano semanal",
        workouts: [
          {
            id: "30000000-0000-4000-8000-000000000001",
            position: 1,
            weekday: 1,
            label: "Segunda-feira",
            workoutTemplateVersion: {
              id: "40000000-0000-4000-8000-000000000001",
              versionNumber: 1,
              name: "Treino A",
              notes: null,
              blocks: [
                {
                  id: "50000000-0000-4000-8000-000000000001",
                  position: 1,
                  label: null,
                  exercises: [
                    {
                      id: "60000000-0000-4000-8000-000000000001",
                      sourceExerciseId: "70000000-0000-4000-8000-000000000001",
                      position: 1,
                      exerciseName: "Agachamento livre",
                      exerciseInstructions: null,
                      exerciseModality: "STRENGTH",
                      notes: null,
                      prescription: {
                        id: "80000000-0000-4000-8000-000000000001",
                        measurementKind: "REPS_LOAD",
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
            },
          },
        ],
      },
    },
  ],
  page: 1,
  pageSize: 20,
  total: 1,
};
const templateResponse = {
  id: "40000000-0000-4000-8000-000000000001",
  name: "Treino A",
  status: "DRAFT",
  version: 1,
  currentPublishedVersionId: null,
  createdAt: "2026-09-29T12:00:00Z",
  updatedAt: "2026-09-29T12:00:00Z",
  notes: null,
  blocks: [
    {
      id: "50000000-0000-4000-8000-000000000001",
      position: 1,
      label: null,
      exercises: [
        {
          id: "60000000-0000-4000-8000-000000000001",
          position: 1,
          exerciseId: "70000000-0000-4000-8000-000000000001",
          notes: null,
          prescription: {
            id: "80000000-0000-4000-8000-000000000001",
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
const planResponse = {
  id: "90000000-0000-4000-8000-000000000001",
  name: "Plano semanal",
  status: "DRAFT",
  version: 1,
  currentPublishedVersionId: null,
  createdAt: "2026-09-29T12:00:00Z",
  updatedAt: "2026-09-29T12:00:00Z",
  workouts: [
    {
      id: "a0000000-0000-4000-8000-000000000001",
      position: 1,
      weekday: 1,
      label: null,
      workoutTemplateVersionId: "b0000000-0000-4000-8000-000000000001",
    },
  ],
};

describe("versioned training contracts", () => {
  it("validates template and weekly-plan responses from the canonical API", async () => {
    const contracts = await import("./training");
    expect(contracts.isWorkoutTemplate(templateResponse)).toBe(true);
    expect(contracts.isTrainingPlan(planResponse)).toBe(true);
  });

  it("rejects executable published content without nested data", async () => {
    const contracts = await import("./training");
    const emptyPublishedTemplate = {
      ...templateResponse,
      status: "PUBLISHED",
      currentPublishedVersionId: "c0000000-0000-4000-8000-000000000001",
      blocks: [],
    };
    const emptyPublishedPlan = {
      ...planResponse,
      status: "PUBLISHED",
      currentPublishedVersionId: "d0000000-0000-4000-8000-000000000001",
      workouts: [],
    };

    expect(contracts.isWorkoutTemplate(emptyPublishedTemplate)).toBe(false);
    expect(contracts.isTrainingPlan(emptyPublishedPlan)).toBe(false);
  });

  it("validates the complete canonical student assignment snapshot", async () => {
    const contracts = await import("./training");
    expect(contracts.isMyWorkoutAssignmentsResponse).toBeTypeOf("function");
    expect(contracts.isMyWorkoutAssignmentsResponse(assignmentResponse)).toBe(true);
  });

  it("rejects malformed dates and incomplete nested snapshots", async () => {
    const contracts = await import("./training");
    expect(contracts.isMyWorkoutAssignmentsResponse).toBeTypeOf("function");
    if (typeof contracts.isMyWorkoutAssignmentsResponse !== "function") return;

    const invalidDate = structuredClone(assignmentResponse);
    Object.assign(invalidDate.items[0], { startsOn: "2026-02-30" });
    expect(contracts.isMyWorkoutAssignmentsResponse(invalidDate)).toBe(false);

    const missingPrescription = structuredClone(assignmentResponse);
    Object.assign(
      missingPrescription.items[0].planVersion.workouts[0].workoutTemplateVersion
        .blocks[0].exercises[0],
      { prescription: undefined },
    );
    expect(contracts.isMyWorkoutAssignmentsResponse(missingPrescription)).toBe(false);
  });
});
