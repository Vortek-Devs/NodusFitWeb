export type StudentStatus = "ACTIVE" | "INACTIVE";
export type StudentSortBy = "name" | "linkedAt";
export type SortDirection = "asc" | "desc";
export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}
export interface StudentListItem {
  id: string;
  name: string;
  email: string;
  status: StudentStatus;
  linkedAt: string;
}
export interface StudentDetail extends StudentListItem {
  telefone: string | null;
  birthDate: string | null;
}
export interface StudentListFilter {
  page: number;
  pageSize: 20;
  search?: string;
  status?: StudentStatus;
  sortBy: StudentSortBy;
  sortDirection: SortDirection;
}

export const NODUS_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && NODUS_UUID_PATTERN.test(value);
}
export function isStudentStatus(value: unknown): value is StudentStatus {
  return value === "ACTIVE" || value === "INACTIVE";
}
export function isStudentPage(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 1 &&
    value <= 2147483647
  );
}
export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1];
}
export function isTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match =
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,7})?(?:Z|([+-])(\d{2}):(\d{2}))$/.exec(
      value,
    );
  return (
    match !== null &&
    isCalendarDate(match[1]) &&
    Number(match[2]) <= 23 &&
    Number(match[3]) <= 59 &&
    Number(match[4]) <= 59 &&
    (!match[5] ||
      (Number(match[6]) <= 14 &&
        Number(match[7]) <= 59 &&
        (Number(match[6]) < 14 || Number(match[7]) === 0)))
  );
}
function isStudentListItem(value: unknown): value is StudentListItem {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    isStudentStatus(value.status) &&
    isTimestamp(value.linkedAt)
  );
}
export function isPagedStudents(value: unknown): value is PagedResponse<StudentListItem> {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isStudentListItem) &&
    isStudentPage(value.page) &&
    typeof value.pageSize === "number" &&
    Number.isInteger(value.pageSize) &&
    value.pageSize >= 1 &&
    value.pageSize <= 100 &&
    typeof value.totalCount === "number" &&
    Number.isSafeInteger(value.totalCount) &&
    value.totalCount >= 0
  );
}
export function isStudentDetail(value: unknown): value is StudentDetail {
  return (
    isRecord(value) &&
    isStudentListItem(value) &&
    (value.telefone === null || typeof value.telefone === "string") &&
    (value.birthDate === null || isCalendarDate(value.birthDate))
  );
}
