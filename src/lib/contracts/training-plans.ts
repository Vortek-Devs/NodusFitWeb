import { isRecord, isTimestamp, isUuid } from "./students";

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

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 1;
}

function isNullablePositiveInteger(value: unknown): value is number | null {
  return value === null || isPositiveInteger(value);
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

function isPlanSet(value: unknown): value is TrainingPlanSet {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isPositiveInteger(value.number) &&
    isNullablePositiveInteger(value.targetRepetitions) &&
    isValidLoadKg(value.loadKg) &&
    typeof value.restSeconds === "number" &&
    Number.isSafeInteger(value.restSeconds) &&
    value.restSeconds >= 0 &&
    isNullablePositiveInteger(value.targetDurationSeconds)
  );
}

function isPlanExercise(value: unknown): value is TrainingPlanExercise {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isUuid(value.exerciseId) &&
    isNullableString(value.exerciseName) &&
    isPositiveInteger(value.position) &&
    isNullableString(value.supersetGroup) &&
    Array.isArray(value.sets) &&
    value.sets.every(isPlanSet)
  );
}

function isPlanDay(value: unknown): value is TrainingPlanDay {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    typeof value.code === "string" &&
    typeof value.name === "string" &&
    isPositiveInteger(value.position) &&
    Array.isArray(value.exercises) &&
    value.exercises.every(isPlanExercise)
  );
}

function isTrainingPlanListItem(value: unknown): value is TrainingPlanListItem {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isUuid(value.studentProfileId) &&
    typeof value.name === "string" &&
    isStatus(value.status) &&
    isPositiveInteger(value.version) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt) &&
    (value.publishedAt === null || isTimestamp(value.publishedAt)) &&
    typeof value.dayCount === "number" &&
    Number.isSafeInteger(value.dayCount) &&
    value.dayCount >= 0 &&
    typeof value.exerciseCount === "number" &&
    Number.isSafeInteger(value.exerciseCount) &&
    value.exerciseCount >= 0
  );
}

export function isTrainingPlanResponse(value: unknown): value is TrainingPlanResponse {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isUuid(value.personalProfileId) &&
    isUuid(value.studentProfileId) &&
    typeof value.name === "string" &&
    isNullableString(value.notes) &&
    isStatus(value.status) &&
    isPositiveInteger(value.version) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt) &&
    (value.publishedAt === null || isTimestamp(value.publishedAt)) &&
    Array.isArray(value.days) &&
    value.days.every(isPlanDay)
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
