import { nodusApiRequest } from "@/lib/api/nodus-api-client";
import {
  isPagedStudents,
  isStudentDetail,
  isUuid,
  type StudentListFilter,
} from "@/lib/contracts/students";
import { studentFiltersToSearchParams } from "./student-query-keys";

export function listStudents(filter: StudentListFilter, signal?: AbortSignal) {
  return nodusApiRequest(
    `v1/students?${studentFiltersToSearchParams(filter)}`,
    isPagedStudents,
    { signal },
  );
}
export function getStudent(studentId: string, signal?: AbortSignal) {
  if (!isUuid(studentId)) return Promise.reject(new Error("STUDENT_ID_INVALID"));
  return nodusApiRequest(
    `v1/students/${encodeURIComponent(studentId)}`,
    isStudentDetail,
    { signal },
  );
}
