import { isRecord, isTimestamp, isUuid } from "./students";

const MAX_PLAN_NAME_LENGTH = 120;
const MAX_PLAN_NOTES_LENGTH = 2_000;
const MAX_PLAN_DAYS = 12;
const MAX_EXERCISES_PER_DAY = 30;
const MAX_SETS_PER_EXERCISE = 20;

export type TrainingPlanStatus = "DRAFT" | "PUBLISHED";

export interface TrainingPlanSet {
  id: string;
  number: number;
  targetRepetitions: number | null;
  loadKg: number | null;
  restSeconds: number;
  targetDurationSeconds: number | null;
}

export interface TrainingPlanExercise {
  id: string;
  exerciseId: string;
  exerciseName: string | null;
  position: number;
  supersetGroup: string | null;
  sets: TrainingPlanSet[];
}

export interface TrainingPlanDay {
  id: string;
  code: string;
  name: string;
  position: number;
  exercises: TrainingPlanExercise[];
}

export interface TrainingPlanResponse {
  id: string;
  personalProfileId: string;
  studentProfileId: string;
  name: string;
  notes: string | null;
  status: TrainingPlanStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  days: TrainingPlanDay[];
}

export interface TrainingPlanListItem {
  id: string;
  studentProfileId: string;
  name: string;
  status: TrainingPlanStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  dayCount: number;
  exerciseCount: number;
}

export interface PagedTrainingPlans {
  items: TrainingPlanListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface TrainingPlanSetInput {
  number: number;
  targetRepetitions: number | null;
  loadKg: number | null;
  restSeconds: number;
  targetDurationSeconds: number | null;
}

export interface TrainingPlanExerciseInput {
  exerciseId: string;
  position: number;
  supersetGroup: string | null;
  sets: TrainingPlanSetInput[];
}

export interface TrainingPlanDayInput {
  code: string;
  name: string;
  position: number;
  exercises: TrainingPlanExerciseInput[];
}

export interface TrainingPlanDraftInput {
  name: string;
  notes: string | null;
  days: TrainingPlanDayInput[];
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNonEmptyStringWithinLength(
  value: unknown,
  maxLength: number,
): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= maxLength
  );
}

function isCodeWithinLength(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= maxLength &&
    /^[A-Za-z0-9_-]+$/.test(value)
  );
}

function hasUniqueValues<T>(
  items: readonly T[],
  getValue: (item: T) => string | number,
): boolean {
  const values = items.map(getValue);
  return new Set(values).size === values.length;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 1;
}

function isNullablePositiveInteger(
  value: unknown,
  maximum: number,
): value is number | null {
  return value === null || (isPositiveInteger(value) && value <= maximum);
}

function isValidLoadKg(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 0 &&
      value <= 9_999.99 &&
      Number(value.toFixed(2)) === value)
  );
}

function isStatus(value: unknown): value is TrainingPlanStatus {
  return value === "DRAFT" || value === "PUBLISHED";
}

function hasValidPublicationTimestamp(
  status: TrainingPlanStatus,
  publishedAt: unknown,
): boolean {
  return status === "DRAFT" ? publishedAt === null : isTimestamp(publishedAt);
}

function isPlanSet(value: unknown): value is TrainingPlanSet {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isPositiveInteger(value.number) &&
    value.number <= MAX_SETS_PER_EXERCISE &&
    isNullablePositiveInteger(value.targetRepetitions, 100) &&
    isValidLoadKg(value.loadKg) &&
    typeof value.restSeconds === "number" &&
    Number.isSafeInteger(value.restSeconds) &&
    value.restSeconds >= 0 &&
    value.restSeconds <= 3_600 &&
    isNullablePositiveInteger(value.targetDurationSeconds, 7_200) &&
    (value.targetRepetitions === null || value.targetDurationSeconds === null) &&
    (value.loadKg === null || value.targetRepetitions !== null)
  );
}

function isPlanExercise(value: unknown): value is TrainingPlanExercise {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isUuid(value.exerciseId) &&
    isNullableString(value.exerciseName) &&
    isPositiveInteger(value.position) &&
    value.position <= MAX_EXERCISES_PER_DAY &&
    (value.supersetGroup === null || isCodeWithinLength(value.supersetGroup, 20)) &&
    Array.isArray(value.sets) &&
    value.sets.length <= MAX_SETS_PER_EXERCISE &&
    value.sets.every(isPlanSet) &&
    hasUniqueValues(value.sets, (set) => set.number)
  );
}

function isPlanDay(value: unknown): value is TrainingPlanDay {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isCodeWithinLength(value.code, 8) &&
    isNonEmptyStringWithinLength(value.name, MAX_PLAN_NAME_LENGTH) &&
    isPositiveInteger(value.position) &&
    value.position <= MAX_PLAN_DAYS &&
    Array.isArray(value.exercises) &&
    value.exercises.length <= MAX_EXERCISES_PER_DAY &&
    value.exercises.every(isPlanExercise) &&
    hasUniqueValues(value.exercises, (exercise) => exercise.position)
  );
}

function hasPairedSupersets(exercises: TrainingPlanExercise[]): boolean {
  const groupCounts = new Map<string, number>();

  for (const exercise of exercises) {
    if (exercise.supersetGroup === null) continue;

    const group = exercise.supersetGroup.toUpperCase();
    groupCounts.set(group, (groupCounts.get(group) ?? 0) + 1);
  }

  return Array.from(groupCounts.values()).every((count) => count >= 2);
}

function isPublishablePlanDays(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (day) =>
        isPlanDay(day) &&
        day.exercises.length > 0 &&
        day.exercises.every(
          (exercise) =>
            exercise.sets.length > 0 &&
            exercise.sets.every(
              (set) =>
                set.targetRepetitions !== null || set.targetDurationSeconds !== null,
            ),
        ) &&
        hasPairedSupersets(day.exercises),
    )
  );
}

function isTrainingPlanListItem(value: unknown): value is TrainingPlanListItem {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isUuid(value.studentProfileId) &&
    isNonEmptyStringWithinLength(value.name, MAX_PLAN_NAME_LENGTH) &&
    isStatus(value.status) &&
    isPositiveInteger(value.version) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt) &&
    hasValidPublicationTimestamp(value.status, value.publishedAt) &&
    typeof value.dayCount === "number" &&
    Number.isSafeInteger(value.dayCount) &&
    value.dayCount >= 0 &&
    value.dayCount <= MAX_PLAN_DAYS &&
    typeof value.exerciseCount === "number" &&
    Number.isSafeInteger(value.exerciseCount) &&
    value.exerciseCount >= 0 &&
    value.exerciseCount <= MAX_PLAN_DAYS * MAX_EXERCISES_PER_DAY
  );
}

export function isTrainingPlanResponse(value: unknown): value is TrainingPlanResponse {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isUuid(value.personalProfileId) &&
    isUuid(value.studentProfileId) &&
    isNonEmptyStringWithinLength(value.name, MAX_PLAN_NAME_LENGTH) &&
    (value.notes === null ||
      (typeof value.notes === "string" && value.notes.length <= MAX_PLAN_NOTES_LENGTH)) &&
    isStatus(value.status) &&
    hasValidPublicationTimestamp(value.status, value.publishedAt) &&
    isPositiveInteger(value.version) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt) &&
    Array.isArray(value.days) &&
    value.days.length <= MAX_PLAN_DAYS &&
    value.days.every(isPlanDay) &&
    hasUniqueValues(value.days, (day) => day.position) &&
    hasUniqueValues(value.days, (day) => day.code.toUpperCase()) &&
    (value.status === "DRAFT" || isPublishablePlanDays(value.days))
  );
}

export function isPagedTrainingPlans(value: unknown): value is PagedTrainingPlans {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isTrainingPlanListItem) &&
    isPositiveInteger(value.page) &&
    typeof value.pageSize === "number" &&
    Number.isSafeInteger(value.pageSize) &&
    value.pageSize >= 1 &&
    value.pageSize <= 100 &&
    typeof value.totalCount === "number" &&
    Number.isSafeInteger(value.totalCount) &&
    value.totalCount >= 0
  );
}
