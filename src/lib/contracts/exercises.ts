import { isRecord, isTimestamp, isUuid } from "./students";

export type ExerciseStatus = "ACTIVE" | "ARCHIVED";
export type ExerciseModality = "STRENGTH" | "CARDIO" | "MOBILITY";
export type ExerciseOwnership = "ALL" | "SYSTEM" | "MINE";
export type ExerciseSortBy = "NAME" | "CREATED_AT";
export type ExerciseSortDirection = "ASC" | "DESC";

export interface ExerciseOption {
  id: string;
  name: string;
}

export interface ExerciseCatalogItem {
  id: string;
  ownerPersonalId: string | null;
  name: string;
  status: ExerciseStatus;
  modality: ExerciseModality;
  version: number;
  createdAt: string;
  equipment: ExerciseOption[];
  primaryMuscleGroups: ExerciseOption[];
  secondaryMuscleGroups: ExerciseOption[];
}

export interface ExerciseCatalogDetail extends ExerciseCatalogItem {
  instructions: string | null;
  updatedAt: string;
}

export interface ExerciseCatalogOptions {
  equipment: ExerciseOption[];
  muscleGroups: ExerciseOption[];
}

export interface PagedExercises {
  items: ExerciseCatalogItem[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface ExerciseListFilter {
  page: number;
  pageSize: 20;
  search?: string;
  status: ExerciseStatus;
  ownership: ExerciseOwnership;
  equipmentId?: string;
  muscleGroupId?: string;
  sortBy: ExerciseSortBy;
  sortDirection: ExerciseSortDirection;
}

export interface ExerciseEditableInput {
  name: string;
  instructions: string | null;
  modality: ExerciseModality;
  equipmentIds: string[];
  primaryMuscleGroupIds: string[];
  secondaryMuscleGroupIds: string[];
}

export interface CreateExerciseInput extends ExerciseEditableInput {
  operationId: string;
  clientEntityId: string;
}

export interface UpdateExerciseInput extends ExerciseEditableInput {
  operationId: string;
  expectedVersion: number;
}

export interface ArchiveExerciseInput {
  operationId: string;
  expectedVersion: number;
}

export interface ExerciseMutationResponse extends ExerciseEditableInput {
  id: string;
  ownerPersonalId: string | null;
  status: ExerciseStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export function isExerciseStatus(value: unknown): value is ExerciseStatus {
  return value === "ACTIVE" || value === "ARCHIVED";
}

export function isExerciseModality(value: unknown): value is ExerciseModality {
  return value === "STRENGTH" || value === "CARDIO" || value === "MOBILITY";
}

function isVersion(value: unknown): value is number {
  return Number.isSafeInteger(value) && typeof value === "number" && value >= 1;
}

function isNullableUuid(value: unknown): value is string | null {
  return value === null || isUuid(value);
}

function isExerciseOption(value: unknown): value is ExerciseOption {
  return isRecord(value) && isUuid(value.id) && typeof value.name === "string";
}

function isUniqueArray<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
  identity: (item: T) => string,
): value is T[] {
  if (!Array.isArray(value) || !value.every(guard)) return false;
  return new Set(value.map(identity)).size === value.length;
}

function isExerciseOptionArray(value: unknown): value is ExerciseOption[] {
  return isUniqueArray(value, isExerciseOption, (item) => item.id);
}

function isUuidArray(value: unknown): value is string[] {
  return isUniqueArray(value, isUuid, (id) => id);
}

function isExerciseCatalogItem(value: unknown): value is ExerciseCatalogItem {
  if (
    isRecord(value) &&
    isUuid(value.id) &&
    isNullableUuid(value.ownerPersonalId) &&
    typeof value.name === "string" &&
    isExerciseStatus(value.status) &&
    isExerciseModality(value.modality) &&
    isVersion(value.version) &&
    isTimestamp(value.createdAt) &&
    isExerciseOptionArray(value.equipment) &&
    isExerciseOptionArray(value.primaryMuscleGroups) &&
    isExerciseOptionArray(value.secondaryMuscleGroups)
  ) {
    const secondaryIds = new Set(value.secondaryMuscleGroups.map((item) => item.id));
    return !value.primaryMuscleGroups.some((item) => secondaryIds.has(item.id));
  }
  return false;
}

export function isPagedExercises(value: unknown): value is PagedExercises {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isExerciseCatalogItem) &&
    typeof value.page === "number" &&
    Number.isSafeInteger(value.page) &&
    value.page >= 1 &&
    value.page <= 2_147_483_647 &&
    typeof value.pageSize === "number" &&
    Number.isInteger(value.pageSize) &&
    value.pageSize >= 1 &&
    value.pageSize <= 100 &&
    typeof value.totalCount === "number" &&
    Number.isSafeInteger(value.totalCount) &&
    value.totalCount >= 0
  );
}

export function isExerciseCatalogDetail(value: unknown): value is ExerciseCatalogDetail {
  return (
    isRecord(value) &&
    isExerciseCatalogItem(value) &&
    (value.instructions === null || typeof value.instructions === "string") &&
    isTimestamp(value.updatedAt)
  );
}

export function isExerciseCatalogOptions(
  value: unknown,
): value is ExerciseCatalogOptions {
  return (
    isRecord(value) &&
    isExerciseOptionArray(value.equipment) &&
    isExerciseOptionArray(value.muscleGroups)
  );
}

export function isExerciseMutationResponse(
  value: unknown,
): value is ExerciseMutationResponse {
  if (
    isRecord(value) &&
    isUuid(value.id) &&
    isNullableUuid(value.ownerPersonalId) &&
    typeof value.name === "string" &&
    (value.instructions === null || typeof value.instructions === "string") &&
    isExerciseStatus(value.status) &&
    isExerciseModality(value.modality) &&
    isVersion(value.version) &&
    isUuidArray(value.equipmentIds) &&
    isUuidArray(value.primaryMuscleGroupIds) &&
    isUuidArray(value.secondaryMuscleGroupIds) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  ) {
    const secondaryIds = value.secondaryMuscleGroupIds;
    return !value.primaryMuscleGroupIds.some((id) => secondaryIds.includes(id));
  }
  return false;
}
