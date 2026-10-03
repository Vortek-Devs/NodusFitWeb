import {
  type ExerciseListFilter,
  type ExerciseOwnership,
  type ExerciseSortBy,
  type ExerciseSortDirection,
  isExerciseStatus,
} from "@/lib/contracts/exercises";
import { isUuid } from "@/lib/contracts/students";

export const DEFAULT_EXERCISE_FILTERS: ExerciseListFilter = {
  page: 1,
  pageSize: 20,
  search: undefined,
  status: "ACTIVE",
  ownership: "ALL",
  equipmentId: undefined,
  muscleGroupId: undefined,
  sortBy: "NAME",
  sortDirection: "ASC",
};

type FilterInput =
  | Partial<Record<keyof ExerciseListFilter, unknown>>
  | { get(name: string): string | null };

function hasGetter(input: FilterInput): input is { get(name: string): string | null } {
  return "get" in input && typeof input.get === "function";
}

function readFilter(input: FilterInput, name: keyof ExerciseListFilter) {
  return hasGetter(input) ? input.get(name) : input[name];
}

function normalizePage(value: unknown) {
  const page =
    typeof value === "string" || typeof value === "number" ? Number(value) : NaN;
  return Number.isSafeInteger(page) && page >= 1 && page <= 2_147_483_647 ? page : 1;
}

function normalizeOwnership(value: unknown): ExerciseOwnership {
  return value === "SYSTEM" || value === "MINE" ? value : "ALL";
}

function normalizeSortBy(value: unknown): ExerciseSortBy {
  return value === "CREATED_AT" ? value : "NAME";
}

function normalizeSortDirection(value: unknown): ExerciseSortDirection {
  return value === "DESC" ? value : "ASC";
}

export function normalizeExerciseListFilter(input: FilterInput): ExerciseListFilter {
  const searchInput = readFilter(input, "search");
  const search = typeof searchInput === "string" ? searchInput.trim().slice(0, 100) : "";
  const statusInput = readFilter(input, "status");
  const equipmentIdInput = readFilter(input, "equipmentId");
  const muscleGroupIdInput = readFilter(input, "muscleGroupId");
  return {
    page: normalizePage(readFilter(input, "page")),
    pageSize: 20,
    search: search || undefined,
    status: isExerciseStatus(statusInput) ? statusInput : "ACTIVE",
    ownership: normalizeOwnership(readFilter(input, "ownership")),
    equipmentId: isUuid(equipmentIdInput) ? equipmentIdInput : undefined,
    muscleGroupId: isUuid(muscleGroupIdInput) ? muscleGroupIdInput : undefined,
    sortBy: normalizeSortBy(readFilter(input, "sortBy")),
    sortDirection: normalizeSortDirection(readFilter(input, "sortDirection")),
  };
}

export function exerciseFiltersToSearchParams(filter: ExerciseListFilter) {
  const params = new URLSearchParams({
    page: String(filter.page),
    pageSize: String(filter.pageSize),
  });
  if (filter.search) params.set("search", filter.search);
  params.set("status", filter.status);
  params.set("ownership", filter.ownership);
  if (filter.equipmentId) params.set("equipmentId", filter.equipmentId);
  if (filter.muscleGroupId) params.set("muscleGroupId", filter.muscleGroupId);
  params.set("sortBy", filter.sortBy);
  params.set("sortDirection", filter.sortDirection);
  return params;
}

export function hasActiveExerciseFilters(filter: ExerciseListFilter) {
  return Boolean(
    filter.search ||
      filter.status !== "ACTIVE" ||
      filter.ownership !== "ALL" ||
      filter.equipmentId ||
      filter.muscleGroupId,
  );
}

export const exerciseQueryKeys = {
  all: ["exercises"] as const,
  lists: () => ["exercises", "list"] as const,
  list: (filter: ExerciseListFilter) => ["exercises", "list", filter] as const,
  details: () => ["exercises", "detail"] as const,
  detail: (exerciseId: string) => ["exercises", "detail", exerciseId] as const,
  options: () => ["exercises", "options"] as const,
  mutations: () => ["exercises", "mutation"] as const,
  create: () => ["exercises", "mutation", "create"] as const,
  update: (exerciseId: string) =>
    ["exercises", "mutation", "update", exerciseId] as const,
  archive: (exerciseId: string) =>
    ["exercises", "mutation", "archive", exerciseId] as const,
};
