import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";
import { nodusApiRequest } from "@/lib/api/nodus-api-client";
import { isUuid } from "@/lib/contracts/students";
import {
  type CreateTrainingPlanInput,
  type CreateWorkoutAssignmentInput,
  type CreateWorkoutTemplateInput,
  isPagedTrainingPlans,
  isPagedWorkoutTemplates,
  isTrainingPlan,
  isWorkoutAssignmentResponse,
  isWorkoutTemplate,
  type PublishTrainingInput,
  type TrainingListFilter,
  type UpdateTrainingPlanInput,
  type UpdateWorkoutTemplateInput,
  type WorkoutAssignmentResponse,
} from "@/lib/contracts/training";
import { trainingFilterSearchParams, trainingQueryKeys } from "./training-query-keys";

function resourceId(id: string, error: string): string {
  if (!isUuid(id)) throw new Error(error);
  return encodeURIComponent(id);
}

function jsonRequest(
  method: "POST" | "PUT",
  body: object,
  signal?: AbortSignal,
): RequestInit {
  return {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  };
}

export function listWorkoutTemplates(filter: TrainingListFilter, signal?: AbortSignal) {
  return nodusApiRequest(
    `v1/workout-templates?${trainingFilterSearchParams(filter)}`,
    isPagedWorkoutTemplates,
    { signal },
  );
}

export function listTrainingPlans(filter: TrainingListFilter, signal?: AbortSignal) {
  return nodusApiRequest(
    `v1/training-plans?${trainingFilterSearchParams(filter)}`,
    isPagedTrainingPlans,
    { signal },
  );
}

export async function getWorkoutTemplate(id: string, signal?: AbortSignal) {
  return nodusApiRequest(
    `v1/workout-templates/${resourceId(id, "WORKOUT_TEMPLATE_ID_INVALID")}`,
    isWorkoutTemplate,
    { signal },
  );
}

export async function getTrainingPlan(id: string, signal?: AbortSignal) {
  return nodusApiRequest(
    `v1/training-plans/${resourceId(id, "TRAINING_PLAN_ID_INVALID")}`,
    isTrainingPlan,
    { signal },
  );
}

export function createWorkoutTemplate(
  input: CreateWorkoutTemplateInput,
  signal?: AbortSignal,
) {
  const { operationId, clientEntityId, name, notes, blocks } = input;
  return nodusApiRequest(
    "v1/workout-templates",
    isWorkoutTemplate,
    jsonRequest(
      "POST",
      {
        operationId,
        clientEntityId,
        name,
        notes,
        blocks,
      },
      signal,
    ),
  );
}

export async function updateWorkoutTemplate(
  id: string,
  input: UpdateWorkoutTemplateInput,
  signal?: AbortSignal,
) {
  const { operationId, expectedVersion, name, notes, blocks } = input;
  return nodusApiRequest(
    `v1/workout-templates/${resourceId(id, "WORKOUT_TEMPLATE_ID_INVALID")}`,
    isWorkoutTemplate,
    jsonRequest("PUT", { operationId, expectedVersion, name, notes, blocks }, signal),
  );
}

export async function publishWorkoutTemplate(
  id: string,
  input: PublishTrainingInput,
  signal?: AbortSignal,
) {
  return nodusApiRequest(
    `v1/workout-templates/${resourceId(id, "WORKOUT_TEMPLATE_ID_INVALID")}/publish`,
    isWorkoutTemplate,
    jsonRequest(
      "POST",
      { operationId: input.operationId, expectedVersion: input.expectedVersion },
      signal,
    ),
  );
}

export function createTrainingPlan(input: CreateTrainingPlanInput, signal?: AbortSignal) {
  const { operationId, clientEntityId, name, workouts } = input;
  return nodusApiRequest(
    "v1/training-plans",
    isTrainingPlan,
    jsonRequest(
      "POST",
      {
        operationId,
        clientEntityId,
        name,
        workouts,
      },
      signal,
    ),
  );
}

export async function updateTrainingPlan(
  id: string,
  input: UpdateTrainingPlanInput,
  signal?: AbortSignal,
) {
  const { operationId, expectedVersion, name, workouts } = input;
  return nodusApiRequest(
    `v1/training-plans/${resourceId(id, "TRAINING_PLAN_ID_INVALID")}`,
    isTrainingPlan,
    jsonRequest("PUT", { operationId, expectedVersion, name, workouts }, signal),
  );
}

export async function publishTrainingPlan(
  id: string,
  input: PublishTrainingInput,
  signal?: AbortSignal,
) {
  return nodusApiRequest(
    `v1/training-plans/${resourceId(id, "TRAINING_PLAN_ID_INVALID")}/publish`,
    isTrainingPlan,
    jsonRequest(
      "POST",
      { operationId: input.operationId, expectedVersion: input.expectedVersion },
      signal,
    ),
  );
}

export function createWorkoutAssignment(
  input: CreateWorkoutAssignmentInput,
  signal?: AbortSignal,
): Promise<WorkoutAssignmentResponse> {
  return nodusApiRequest(
    "v1/workout-assignments",
    isWorkoutAssignmentResponse,
    jsonRequest("POST", input, signal),
  );
}

export function workoutTemplateListOptions(filter: TrainingListFilter) {
  return queryOptions({
    queryKey: trainingQueryKeys.templateList(filter),
    queryFn: ({ signal }) => listWorkoutTemplates(filter, signal),
  });
}

export function trainingPlanListOptions(filter: TrainingListFilter) {
  return queryOptions({
    queryKey: trainingQueryKeys.planList(filter),
    queryFn: ({ signal }) => listTrainingPlans(filter, signal),
  });
}

export function workoutTemplateDetailOptions(id: string) {
  return queryOptions({
    queryKey: trainingQueryKeys.templateDetail(id),
    queryFn: ({ signal }) => getWorkoutTemplate(id, signal),
  });
}

export function trainingPlanDetailOptions(id: string) {
  return queryOptions({
    queryKey: trainingQueryKeys.planDetail(id),
    queryFn: ({ signal }) => getTrainingPlan(id, signal),
  });
}

export function templateMutationOptions(queryClient: QueryClient, id?: string) {
  return mutationOptions({
    mutationFn: (input: CreateWorkoutTemplateInput | UpdateWorkoutTemplateInput) =>
      id
        ? updateWorkoutTemplate(id, input as UpdateWorkoutTemplateInput)
        : createWorkoutTemplate(input as CreateWorkoutTemplateInput),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: trainingQueryKeys.templateLists(),
      });
      await queryClient.invalidateQueries({
        queryKey: trainingQueryKeys.templateDetail(response.id),
      });
    },
  });
}

export function planMutationOptions(queryClient: QueryClient, id?: string) {
  return mutationOptions({
    mutationFn: (input: CreateTrainingPlanInput | UpdateTrainingPlanInput) =>
      id
        ? updateTrainingPlan(id, input as UpdateTrainingPlanInput)
        : createTrainingPlan(input as CreateTrainingPlanInput),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: trainingQueryKeys.planLists() });
      await queryClient.invalidateQueries({
        queryKey: trainingQueryKeys.planDetail(response.id),
      });
    },
  });
}
