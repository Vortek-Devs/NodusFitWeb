import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";
import { nodusApiRequest } from "@/lib/api/nodus-api-client";
import { isUuid } from "@/lib/contracts/students";
import {
  isPagedTrainingPlans,
  isTrainingPlanResponse,
  type PagedTrainingPlans,
  type TrainingPlanDraftInput,
  type TrainingPlanResponse,
} from "@/lib/contracts/training-plans";
import { trainingPlanQueryKeys } from "./training-plan-query-keys";

export function listTrainingPlans(studentId: string, page = 1, signal?: AbortSignal) {
  if (!isUuid(studentId)) return Promise.reject(new Error("STUDENT_ID_INVALID"));
  return nodusApiRequest<PagedTrainingPlans>(
    `v1/students/${encodeURIComponent(studentId)}/training-plans?page=${page}&pageSize=20`,
    isPagedTrainingPlans,
    { signal },
  );
}

export function getTrainingPlan(planId: string, signal?: AbortSignal) {
  if (!isUuid(planId)) return Promise.reject(new Error("TRAINING_PLAN_ID_INVALID"));
  return nodusApiRequest<TrainingPlanResponse>(
    `v1/training-plans/${encodeURIComponent(planId)}`,
    isTrainingPlanResponse,
    { signal },
  );
}

export function createTrainingPlan(
  studentId: string,
  input: TrainingPlanDraftInput & { operationId: string; clientEntityId: string },
) {
  if (!isUuid(studentId)) return Promise.reject(new Error("STUDENT_ID_INVALID"));
  return nodusApiRequest<TrainingPlanResponse>(
    `v1/students/${encodeURIComponent(studentId)}/training-plans`,
    isTrainingPlanResponse,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

export function updateTrainingPlan(
  planId: string,
  input: TrainingPlanDraftInput & { operationId: string; expectedVersion: number },
) {
  if (!isUuid(planId)) return Promise.reject(new Error("TRAINING_PLAN_ID_INVALID"));
  return nodusApiRequest<TrainingPlanResponse>(
    `v1/training-plans/${encodeURIComponent(planId)}`,
    isTrainingPlanResponse,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

export function publishTrainingPlan(
  planId: string,
  input: { operationId: string; expectedVersion: number },
) {
  if (!isUuid(planId)) return Promise.reject(new Error("TRAINING_PLAN_ID_INVALID"));
  return nodusApiRequest<TrainingPlanResponse>(
    `v1/training-plans/${encodeURIComponent(planId)}/publish`,
    isTrainingPlanResponse,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

export function trainingPlanListQueryOptions(studentId: string, page = 1) {
  return queryOptions({
    queryKey: trainingPlanQueryKeys.list(studentId, page),
    queryFn: ({ signal }) => listTrainingPlans(studentId, page, signal),
    enabled: isUuid(studentId),
  });
}

export function trainingPlanDetailQueryOptions(planId: string) {
  return queryOptions({
    queryKey: trainingPlanQueryKeys.detail(planId),
    queryFn: ({ signal }) => getTrainingPlan(planId, signal),
    enabled: isUuid(planId),
  });
}

export function saveTrainingPlanMutationOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationKey: trainingPlanQueryKeys.mutations(),
    mutationFn: (input: {
      studentId: string;
      planId: string | null;
      expectedVersion: number | null;
      draft: TrainingPlanDraftInput;
      operationId: string;
      clientEntityId: string;
    }) =>
      input.planId === null
        ? createTrainingPlan(input.studentId, {
            ...input.draft,
            operationId: input.operationId,
            clientEntityId: input.clientEntityId,
          })
        : updateTrainingPlan(input.planId, {
            ...input.draft,
            operationId: input.operationId,
            expectedVersion: input.expectedVersion ?? 1,
          }),
    onSuccess: async (plan) => {
      queryClient.setQueryData(trainingPlanQueryKeys.detail(plan.id), plan);
      await queryClient.invalidateQueries({ queryKey: trainingPlanQueryKeys.lists() });
    },
  });
}

export function publishTrainingPlanMutationOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationKey: [...trainingPlanQueryKeys.mutations(), "publish"],
    mutationFn: (input: {
      planId: string;
      operationId: string;
      expectedVersion: number;
    }) =>
      publishTrainingPlan(input.planId, {
        operationId: input.operationId,
        expectedVersion: input.expectedVersion,
      }),
    onSuccess: async (plan) => {
      queryClient.setQueryData(trainingPlanQueryKeys.detail(plan.id), plan);
      await queryClient.invalidateQueries({ queryKey: trainingPlanQueryKeys.lists() });
    },
  });
}
