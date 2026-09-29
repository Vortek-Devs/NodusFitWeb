import type { TrainingListFilter } from "@/lib/contracts/training";

export const DEFAULT_TRAINING_FILTER: TrainingListFilter = {
  page: 1,
  pageSize: 20,
  status: "ALL",
  sortBy: "UPDATED_AT",
  sortDirection: "DESC",
};

export function trainingFilterSearchParams(filter: TrainingListFilter): URLSearchParams {
  const params = new URLSearchParams({
    page: String(filter.page),
    pageSize: String(filter.pageSize),
  });
  if (filter.search) params.set("search", filter.search);
  params.set("status", filter.status);
  params.set("sortBy", filter.sortBy);
  params.set("sortDirection", filter.sortDirection);
  return params;
}

export const trainingQueryKeys = {
  templates: ["workout-templates"] as const,
  templateLists: () => ["workout-templates", "list"] as const,
  templateList: (filter: TrainingListFilter) =>
    ["workout-templates", "list", filter] as const,
  templateDetail: (id: string) => ["workout-templates", "detail", id] as const,
  plans: ["training-plans"] as const,
  planLists: () => ["training-plans", "list"] as const,
  planList: (filter: TrainingListFilter) => ["training-plans", "list", filter] as const,
  planDetail: (id: string) => ["training-plans", "detail", id] as const,
};
