import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";
import { nodusApiRequest } from "@/lib/api/nodus-api-client";
import {
  type ArchiveExerciseInput,
  type CreateExerciseInput,
  type ExerciseListFilter,
  type ExerciseMutationResponse,
  isExerciseCatalogDetail,
  isExerciseCatalogOptions,
  isExerciseMutationResponse,
  isPagedExercises,
  type UpdateExerciseInput,
} from "@/lib/contracts/exercises";
import { isUuid } from "@/lib/contracts/students";
import { exerciseFiltersToSearchParams, exerciseQueryKeys } from "./exercise-query-keys";

export function listExercises(filter: ExerciseListFilter, signal?: AbortSignal) {
  return nodusApiRequest(
    `v1/exercises?${exerciseFiltersToSearchParams(filter)}`,
    isPagedExercises,
    { signal },
  );
}

export function getExerciseOptions(signal?: AbortSignal) {
  return nodusApiRequest("v1/exercises/options", isExerciseCatalogOptions, {
    signal,
  });
}

export function getExercise(exerciseId: string, signal?: AbortSignal) {
  if (!isUuid(exerciseId)) {
    return Promise.reject(new Error("EXERCISE_ID_INVALID"));
  }
  return nodusApiRequest(
    `v1/exercises/${encodeURIComponent(exerciseId)}`,
    isExerciseCatalogDetail,
    { signal },
  );
}

export function createExercise(input: CreateExerciseInput, signal?: AbortSignal) {
  return nodusApiRequest("v1/exercises", isExerciseMutationResponse, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(createPayload(input)),
    signal,
  });
}

export function updateExercise(
  exerciseId: string,
  input: UpdateExerciseInput,
  signal?: AbortSignal,
) {
  if (!isUuid(exerciseId)) {
    return Promise.reject(new Error("EXERCISE_ID_INVALID"));
  }
  return nodusApiRequest(
    `v1/exercises/${encodeURIComponent(exerciseId)}`,
    isExerciseMutationResponse,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updatePayload(input)),
      signal,
    },
  );
}

export function archiveExercise(
  exerciseId: string,
  input: ArchiveExerciseInput,
  signal?: AbortSignal,
) {
  if (!isUuid(exerciseId)) {
    return Promise.reject(new Error("EXERCISE_ID_INVALID"));
  }
  return nodusApiRequest(
    `v1/exercises/${encodeURIComponent(exerciseId)}/archive`,
    isExerciseMutationResponse,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        operationId: input.operationId,
        expectedVersion: input.expectedVersion,
      }),
      signal,
    },
  );
}

export function exerciseListQueryOptions(filter: ExerciseListFilter) {
  return queryOptions({
    queryKey: exerciseQueryKeys.list(filter),
    queryFn: ({ signal }) => listExercises(filter, signal),
  });
}

export function exerciseDetailQueryOptions(exerciseId: string) {
  return queryOptions({
    queryKey: exerciseQueryKeys.detail(exerciseId),
    queryFn: ({ signal }) => getExercise(exerciseId, signal),
  });
}

export function exerciseOptionsQueryOptions() {
  return queryOptions({
    queryKey: exerciseQueryKeys.options(),
    queryFn: ({ signal }) => getExerciseOptions(signal),
  });
}

export function createExerciseMutationOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationKey: exerciseQueryKeys.create(),
    mutationFn: (input: CreateExerciseInput) => createExercise(input),
    onSuccess: (response) => invalidateAfterMutation(queryClient, response),
  });
}

export function updateExerciseMutationOptions(
  queryClient: QueryClient,
  exerciseId: string,
) {
  return mutationOptions({
    mutationKey: exerciseQueryKeys.update(exerciseId),
    mutationFn: (input: UpdateExerciseInput) => updateExercise(exerciseId, input),
    onSuccess: (response) => invalidateAfterMutation(queryClient, response),
  });
}

export function archiveExerciseMutationOptions(
  queryClient: QueryClient,
  exerciseId: string,
) {
  return mutationOptions({
    mutationKey: exerciseQueryKeys.archive(exerciseId),
    mutationFn: (input: ArchiveExerciseInput) => archiveExercise(exerciseId, input),
    onSuccess: (response) => invalidateAfterMutation(queryClient, response),
  });
}

function createPayload(input: CreateExerciseInput): CreateExerciseInput {
  return {
    operationId: input.operationId,
    clientEntityId: input.clientEntityId,
    name: input.name,
    instructions: input.instructions,
    modality: input.modality,
    equipmentIds: input.equipmentIds,
    primaryMuscleGroupIds: input.primaryMuscleGroupIds,
    secondaryMuscleGroupIds: input.secondaryMuscleGroupIds,
  };
}

function updatePayload(input: UpdateExerciseInput): UpdateExerciseInput {
  return {
    operationId: input.operationId,
    expectedVersion: input.expectedVersion,
    name: input.name,
    instructions: input.instructions,
    modality: input.modality,
    equipmentIds: input.equipmentIds,
    primaryMuscleGroupIds: input.primaryMuscleGroupIds,
    secondaryMuscleGroupIds: input.secondaryMuscleGroupIds,
  };
}

async function invalidateAfterMutation(
  queryClient: QueryClient,
  response: ExerciseMutationResponse,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: exerciseQueryKeys.lists() }),
    queryClient.invalidateQueries({
      queryKey: exerciseQueryKeys.detail(response.id),
    }),
  ]);
}
