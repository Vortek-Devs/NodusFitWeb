import {
  isStudentPage,
  isStudentStatus,
  type StudentListFilter,
} from "@/lib/contracts/students";

export const DEFAULT_STUDENT_FILTERS: StudentListFilter = {
  page: 1,
  pageSize: 20,
  search: undefined,
  status: undefined,
  sortBy: "name",
  sortDirection: "asc",
};
type FilterInput =
  | Partial<Record<keyof StudentListFilter, unknown>>
  | { get(name: string): string | null };
function readFilter(input: FilterInput, name: keyof StudentListFilter) {
  return "get" in input ? input.get(name) : input[name];
}
export function normalizeStudentListFilter(input: FilterInput): StudentListFilter {
  const pageInput = readFilter(input, "page");
  const page =
    typeof pageInput === "string" || typeof pageInput === "number"
      ? Number(pageInput)
      : NaN;
  const searchInput = readFilter(input, "search");
  const search = typeof searchInput === "string" ? searchInput.trim().slice(0, 100) : "";
  const status = readFilter(input, "status");
  return {
    page: isStudentPage(page) ? page : 1,
    pageSize: 20,
    search: search || undefined,
    status: isStudentStatus(status) ? status : undefined,
    sortBy: readFilter(input, "sortBy") === "linkedAt" ? "linkedAt" : "name",
    sortDirection: readFilter(input, "sortDirection") === "desc" ? "desc" : "asc",
  };
}
export function studentFiltersToSearchParams(filter: StudentListFilter) {
  const params = new URLSearchParams({
    page: String(filter.page),
    pageSize: String(filter.pageSize),
  });
  if (filter.search) params.set("search", filter.search);
  if (filter.status) params.set("status", filter.status);
  params.set("sortBy", filter.sortBy);
  params.set("sortDirection", filter.sortDirection);
  return params;
}
export function hasActiveStudentFilters(filter: StudentListFilter) {
  return Boolean(filter.search || filter.status);
}
export const studentQueryKeys = {
  all: ["students"] as const,
  list: (filter: StudentListFilter) => ["students", "list", filter] as const,
  detail: (studentId: string) => ["students", "detail", studentId] as const,
};
