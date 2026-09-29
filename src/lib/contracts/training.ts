import {
  isCalendarDate,
  isRecord,
  isTimestamp,
  isUuid,
  type PagedResponse,
} from "./students";

export type TrainingStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type TrainingStatusFilter = TrainingStatus | "ALL";
export type TrainingSortBy = "NAME" | "UPDATED_AT";
export type TrainingSortDirection = "ASC" | "DESC";
export type WorkoutAssignmentStatus =
  | "SCHEDULED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "REPLACED";
export type ExerciseModality = "STRENGTH" | "CARDIO" | "MOBILITY";

export interface TrainingListFilter {
  page: number;
  pageSize: number;
  search?: string;
  status: TrainingStatusFilter;
  sortBy: TrainingSortBy;
  sortDirection: TrainingSortDirection;
}

export interface TrainingListItem {
  id: string;
  name: string;
  status: TrainingStatus;
  version: number;
  currentPublishedVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PagedWorkoutTemplates = PagedResponse<TrainingListItem>;
export type PagedTrainingPlans = PagedResponse<TrainingListItem>;

export interface WorkoutPrescription {
  id: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  suggestedLoadKg: number | null;
  restSeconds: number;
}

export interface WorkoutExercise {
  id: string;
  position: number;
  exerciseId: string;
  notes: string | null;
  prescription: WorkoutPrescription;
}

export interface WorkoutBlock {
  id: string;
  position: number;
  label: string | null;
  exercises: WorkoutExercise[];
}

export interface WorkoutTemplate extends TrainingListItem {
  notes: string | null;
  blocks: WorkoutBlock[];
}

export interface PlanWorkout {
  id: string;
  position: number;
  weekday: number;
  label: string | null;
  workoutTemplateVersionId: string;
}

export interface TrainingPlan extends TrainingListItem {
  workouts: PlanWorkout[];
}

export interface WorkoutPrescriptionInput {
  clientEntityId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  suggestedLoadKg: number | null;
  restSeconds: number;
}

export interface WorkoutExerciseInput {
  clientEntityId: string;
  position: number;
  exerciseId: string;
  notes: string | null;
  prescription: WorkoutPrescriptionInput;
}

export interface WorkoutBlockInput {
  clientEntityId: string;
  position: number;
  label: string | null;
  exercises: WorkoutExerciseInput[];
}

export interface WorkoutTemplateDraft {
  name: string;
  notes: string | null;
  blocks: WorkoutBlockInput[];
}

export interface PlanWorkoutInput {
  clientEntityId: string;
  position: number;
  weekday: number;
  label: string | null;
  workoutTemplateVersionId: string;
}

export interface TrainingPlanDraft {
  name: string;
  workouts: PlanWorkoutInput[];
}

export interface CreateWorkoutTemplateInput extends WorkoutTemplateDraft {
  operationId: string;
  clientEntityId: string;
}

export interface UpdateWorkoutTemplateInput extends WorkoutTemplateDraft {
  operationId: string;
  expectedVersion: number;
}

export interface CreateTrainingPlanInput extends TrainingPlanDraft {
  operationId: string;
  clientEntityId: string;
}

export interface UpdateTrainingPlanInput extends TrainingPlanDraft {
  operationId: string;
  expectedVersion: number;
}

export interface PublishTrainingInput {
  operationId: string;
  expectedVersion: number;
}

export interface CreateWorkoutAssignmentInput {
  operationId: string;
  clientEntityId: string;
  studentId: string;
  trainingPlanVersionId: string;
  startsOn: string;
  endsOn: string | null;
  replacesAssignmentId: string | null;
  replacementReason: string | null;
}

export interface WorkoutAssignmentResponse {
  id: string;
  studentId: string;
  trainingPlanVersionId: string;
  status: WorkoutAssignmentStatus;
  startsOn: string;
  endsOn: string | null;
  replacesAssignmentId: string | null;
  replacementReason: string | null;
  version: number;
  assignedAt: string;
}

export interface AssignmentPrescriptionSnapshot {
  id: string;
  measurementKind: "REPS_LOAD";
  sets: number;
  repsMin: number;
  repsMax: number;
  suggestedLoadKg: number | null;
  restSeconds: number;
}

export interface AssignmentExerciseSnapshot {
  id: string;
  sourceExerciseId: string;
  position: number;
  exerciseName: string;
  exerciseInstructions: string | null;
  exerciseModality: ExerciseModality;
  notes: string | null;
  prescription: AssignmentPrescriptionSnapshot;
}

export interface AssignmentBlockSnapshot {
  id: string;
  position: number;
  label: string | null;
  exercises: AssignmentExerciseSnapshot[];
}

export interface AssignmentWorkoutTemplateVersion {
  id: string;
  versionNumber: number;
  name: string;
  notes: string | null;
  blocks: AssignmentBlockSnapshot[];
}

export interface AssignmentPlanWorkoutSnapshot {
  id: string;
  position: number;
  weekday: number;
  label: string | null;
  workoutTemplateVersion: AssignmentWorkoutTemplateVersion;
}

export interface AssignmentTrainingPlanVersion {
  id: string;
  versionNumber: number;
  name: string;
  workouts: AssignmentPlanWorkoutSnapshot[];
}

export interface MyWorkoutAssignment {
  id: string;
  status: WorkoutAssignmentStatus;
  startsOn: string;
  endsOn: string | null;
  version: number;
  planVersion: AssignmentTrainingPlanVersion;
}

export interface MyWorkoutAssignmentsResponse {
  items: MyWorkoutAssignment[];
  page: number;
  pageSize: number;
  total: number;
}

export interface MyWorkoutAssignmentFilter {
  page: number;
  pageSize: number;
  status: WorkoutAssignmentStatus | "ALL";
  sortBy: "STARTS_ON" | "ASSIGNED_AT";
  sortDirection: TrainingSortDirection;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 1;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isNonEmptyString(value: unknown, maximumLength: number): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= maximumLength
  );
}

function isNullableString(value: unknown, maximumLength = 2_000): value is string | null {
  return value === null || (typeof value === "string" && value.length <= maximumLength);
}

function isTrainingStatus(value: unknown): value is TrainingStatus {
  return value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED";
}

export function isWorkoutAssignmentStatus(
  value: unknown,
): value is WorkoutAssignmentStatus {
  return (
    value === "SCHEDULED" ||
    value === "ACTIVE" ||
    value === "COMPLETED" ||
    value === "CANCELLED" ||
    value === "REPLACED"
  );
}

function isExerciseModality(value: unknown): value is ExerciseModality {
  return value === "STRENGTH" || value === "CARDIO" || value === "MOBILITY";
}

function isTrainingListItem(value: unknown): value is TrainingListItem {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isNonEmptyString(value.name, 120) &&
    isTrainingStatus(value.status) &&
    isPositiveInteger(value.version) &&
    (value.currentPublishedVersionId === null ||
      isUuid(value.currentPublishedVersionId)) &&
    (value.status !== "PUBLISHED" || isUuid(value.currentPublishedVersionId)) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  );
}

function isPagedTrainingItems(value: unknown): value is PagedResponse<TrainingListItem> {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isTrainingListItem) &&
    isPositiveInteger(value.page) &&
    isPositiveInteger(value.pageSize) &&
    value.pageSize <= 100 &&
    isNonNegativeInteger(value.totalCount)
  );
}

export function isPagedWorkoutTemplates(value: unknown): value is PagedWorkoutTemplates {
  return isPagedTrainingItems(value);
}

export function isPagedTrainingPlans(value: unknown): value is PagedTrainingPlans {
  return isPagedTrainingItems(value);
}

function isLoad(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 0 &&
      value <= 10_000 &&
      Number(value.toFixed(2)) === value)
  );
}

function isPrescription(value: unknown): value is WorkoutPrescription {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isPositiveInteger(value.sets) &&
    value.sets <= 20 &&
    isPositiveInteger(value.repsMin) &&
    isPositiveInteger(value.repsMax) &&
    value.repsMin <= value.repsMax &&
    value.repsMax <= 1_000 &&
    isLoad(value.suggestedLoadKg) &&
    isNonNegativeInteger(value.restSeconds) &&
    value.restSeconds <= 3_600
  );
}

function isWorkoutExercise(value: unknown): value is WorkoutExercise {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isPositiveInteger(value.position) &&
    isUuid(value.exerciseId) &&
    isNullableString(value.notes, 1_000) &&
    isPrescription(value.prescription)
  );
}

function isWorkoutBlock(value: unknown): value is WorkoutBlock {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isPositiveInteger(value.position) &&
    isNullableString(value.label, 120) &&
    Array.isArray(value.exercises) &&
    value.exercises.every(isWorkoutExercise) &&
    new Set(value.exercises.map((exercise) => (exercise as WorkoutExercise).position))
      .size === value.exercises.length
  );
}

export function isWorkoutTemplate(value: unknown): value is WorkoutTemplate {
  if (!isTrainingListItem(value)) return false;

  const record = value as TrainingListItem & Record<string, unknown>;
  const blocks = record.blocks;
  if (
    !isNullableString(record.notes) ||
    !Array.isArray(blocks) ||
    !blocks.every(isWorkoutBlock)
  ) {
    return false;
  }

  const templateBlocks = blocks as WorkoutBlock[];
  return (
    new Set(templateBlocks.map((block) => block.position)).size ===
      templateBlocks.length &&
    (record.status !== "PUBLISHED" ||
      (templateBlocks.length > 0 &&
        templateBlocks.every((block) => block.exercises.length > 0)))
  );
}

function isPlanWorkout(value: unknown): value is PlanWorkout {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isPositiveInteger(value.position) &&
    isPositiveInteger(value.weekday) &&
    value.weekday <= 7 &&
    isNullableString(value.label, 120) &&
    isUuid(value.workoutTemplateVersionId)
  );
}

export function isTrainingPlan(value: unknown): value is TrainingPlan {
  if (!isTrainingListItem(value)) return false;

  const record = value as TrainingListItem & Record<string, unknown>;
  const workouts = record.workouts;
  if (!Array.isArray(workouts) || !workouts.every(isPlanWorkout)) {
    return false;
  }

  const planWorkouts = workouts as PlanWorkout[];
  return (
    new Set(planWorkouts.map((workout) => workout.position)).size ===
      planWorkouts.length &&
    new Set(planWorkouts.map((workout) => workout.id)).size === planWorkouts.length &&
    (record.status !== "PUBLISHED" || planWorkouts.length > 0)
  );
}

function isAssignmentPrescription(
  value: unknown,
): value is AssignmentPrescriptionSnapshot {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    value.measurementKind === "REPS_LOAD" &&
    isPositiveInteger(value.sets) &&
    value.sets <= 20 &&
    isPositiveInteger(value.repsMin) &&
    isPositiveInteger(value.repsMax) &&
    value.repsMin <= value.repsMax &&
    value.repsMax <= 1_000 &&
    isLoad(value.suggestedLoadKg) &&
    isNonNegativeInteger(value.restSeconds) &&
    value.restSeconds <= 3_600
  );
}

function isAssignmentExercise(value: unknown): value is AssignmentExerciseSnapshot {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isUuid(value.sourceExerciseId) &&
    isPositiveInteger(value.position) &&
    isNonEmptyString(value.exerciseName, 120) &&
    isNullableString(value.exerciseInstructions, 2_000) &&
    isExerciseModality(value.exerciseModality) &&
    isNullableString(value.notes, 1_000) &&
    isAssignmentPrescription(value.prescription)
  );
}

function isAssignmentBlock(value: unknown): value is AssignmentBlockSnapshot {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isPositiveInteger(value.position) &&
    isNullableString(value.label, 120) &&
    Array.isArray(value.exercises) &&
    value.exercises.length > 0 &&
    value.exercises.every(isAssignmentExercise) &&
    new Set(
      value.exercises.map(
        (exercise) => (exercise as AssignmentExerciseSnapshot).position,
      ),
    ).size === value.exercises.length
  );
}

function isAssignmentWorkoutTemplateVersion(
  value: unknown,
): value is AssignmentWorkoutTemplateVersion {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isPositiveInteger(value.versionNumber) &&
    isNonEmptyString(value.name, 120) &&
    isNullableString(value.notes) &&
    Array.isArray(value.blocks) &&
    value.blocks.length > 0 &&
    value.blocks.every(isAssignmentBlock) &&
    new Set(value.blocks.map((block) => (block as AssignmentBlockSnapshot).position))
      .size === value.blocks.length
  );
}

function isAssignmentPlanWorkout(value: unknown): value is AssignmentPlanWorkoutSnapshot {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isPositiveInteger(value.position) &&
    isPositiveInteger(value.weekday) &&
    value.weekday <= 7 &&
    isNullableString(value.label, 120) &&
    isAssignmentWorkoutTemplateVersion(value.workoutTemplateVersion)
  );
}

function isAssignmentPlanVersion(value: unknown): value is AssignmentTrainingPlanVersion {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isPositiveInteger(value.versionNumber) &&
    isNonEmptyString(value.name, 120) &&
    Array.isArray(value.workouts) &&
    value.workouts.length > 0 &&
    value.workouts.every(isAssignmentPlanWorkout) &&
    new Set(
      value.workouts.map(
        (workout) => (workout as AssignmentPlanWorkoutSnapshot).position,
      ),
    ).size === value.workouts.length
  );
}

function isAssignmentWindow(startsOn: unknown, endsOn: unknown): boolean {
  return (
    isCalendarDate(startsOn) &&
    startsOn !== "0001-01-01" &&
    (endsOn === null || (isCalendarDate(endsOn) && endsOn >= startsOn))
  );
}

export function isWorkoutAssignmentResponse(
  value: unknown,
): value is WorkoutAssignmentResponse {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isUuid(value.studentId) &&
    isUuid(value.trainingPlanVersionId) &&
    isWorkoutAssignmentStatus(value.status) &&
    isAssignmentWindow(value.startsOn, value.endsOn) &&
    (value.replacesAssignmentId === null || isUuid(value.replacesAssignmentId)) &&
    (value.replacementReason === null ||
      isNonEmptyString(value.replacementReason, 1_000)) &&
    (value.replacesAssignmentId === null) === (value.replacementReason === null) &&
    isPositiveInteger(value.version) &&
    isTimestamp(value.assignedAt)
  );
}

function isMyWorkoutAssignment(value: unknown): value is MyWorkoutAssignment {
  return (
    isRecord(value) &&
    isUuid(value.id) &&
    isWorkoutAssignmentStatus(value.status) &&
    isAssignmentWindow(value.startsOn, value.endsOn) &&
    isPositiveInteger(value.version) &&
    isAssignmentPlanVersion(value.planVersion)
  );
}

export function isMyWorkoutAssignmentsResponse(
  value: unknown,
): value is MyWorkoutAssignmentsResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isMyWorkoutAssignment) &&
    isPositiveInteger(value.page) &&
    isPositiveInteger(value.pageSize) &&
    value.pageSize <= 100 &&
    isNonNegativeInteger(value.total) &&
    value.items.length <= value.pageSize
  );
}
