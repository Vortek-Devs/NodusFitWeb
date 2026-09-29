"use client";

import {
  IconArrowLeft,
  IconBarbell,
  IconDeviceFloppy,
  IconPlus,
  IconSearch,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_EXERCISE_FILTERS } from "@/features/exercises/exercise-query-keys";
import {
  exerciseDetailQueryOptions,
  exerciseListQueryOptions,
} from "@/features/exercises/exercises-api";
import {
  DEFAULT_STUDENT_FILTERS,
  studentQueryKeys,
} from "@/features/students/student-query-keys";
import { listStudents } from "@/features/students/students-api";
import {
  createTrainingPlan,
  createWorkoutAssignment,
  createWorkoutTemplate,
  publishTrainingPlan,
  publishWorkoutTemplate,
  trainingPlanDetailOptions,
  updateTrainingPlan,
  updateWorkoutTemplate,
  workoutTemplateDetailOptions,
  workoutTemplateListOptions,
} from "@/features/training/training-api";
import { DEFAULT_TRAINING_FILTER } from "@/features/training/training-query-keys";
import { NodusApiError } from "@/lib/api/nodus-api-client";
import { isUuid } from "@/lib/contracts/students";
import type {
  CreateTrainingPlanInput,
  CreateWorkoutTemplateInput,
  TrainingPlan,
  TrainingPlanDraft,
  TrainingStatus,
  WorkoutBlockInput,
  WorkoutExerciseInput,
  WorkoutTemplate,
  WorkoutTemplateDraft,
} from "@/lib/contracts/training";

type TrainingEditorKind = "modelo" | "plano";

interface TrainingContentEditorClientProps {
  kind: TrainingEditorKind;
  resourceId?: string;
}

const inputClass =
  "min-h-11 rounded-lg border border-border bg-page px-3 text-sm text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";

export function TrainingContentEditorClient({
  kind,
  resourceId,
}: TrainingContentEditorClientProps) {
  const validId = resourceId && isUuid(resourceId) ? resourceId : undefined;
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const template = useQuery({
    ...workoutTemplateDetailOptions(validId ?? ""),
    enabled: kind === "modelo" && Boolean(validId),
  });
  const plan = useQuery({
    ...trainingPlanDetailOptions(validId ?? ""),
    enabled: kind === "plano" && Boolean(validId),
  });
  const exerciseFilter = {
    ...DEFAULT_EXERCISE_FILTERS,
    page: 1,
    search: exerciseSearch.trim() || undefined,
  };
  const exercises = useQuery({
    ...exerciseListQueryOptions(exerciseFilter),
    enabled: kind === "modelo",
  });
  const templateExerciseIds =
    kind === "modelo" && template.data
      ? [
          ...new Set(
            template.data.blocks.flatMap((block) =>
              block.exercises.map((exercise) => exercise.exerciseId),
            ),
          ),
        ]
      : [];
  const listedExerciseIds = new Set(
    exercises.data?.items.map((exercise) => exercise.id) ?? [],
  );
  const unresolvedExerciseIds = exercises.isSuccess
    ? templateExerciseIds.filter((id) => !listedExerciseIds.has(id))
    : [];
  const exerciseDetails = useQueries({
    queries: unresolvedExerciseIds.map((id) => exerciseDetailQueryOptions(id)),
  });
  const exerciseNames = new Map(
    exercises.data?.items.map((exercise) => [exercise.id, exercise.name]) ?? [],
  );
  exerciseDetails.forEach((query, index) => {
    if (query.data) exerciseNames.set(unresolvedExerciseIds[index], query.data.name);
  });
  const publishedTemplateFilter = {
    ...DEFAULT_TRAINING_FILTER,
    status: "PUBLISHED" as const,
    search: templateSearch.trim() || undefined,
  };
  const publishedTemplates = useQuery({
    ...workoutTemplateListOptions(publishedTemplateFilter),
    enabled: kind === "plano",
  });

  if (resourceId && !validId) {
    return (
      <EditorError title="Conteúdo não encontrado" detail="O identificador é inválido." />
    );
  }

  const detail = kind === "modelo" ? template : plan;
  if (resourceId && detail.isPending) return <EditorLoading />;
  if (resourceId && detail.isError) {
    return (
      <EditorError
        title={`Não foi possível carregar ${kind === "modelo" ? "este treino" : "este plano"}`}
        detail={errorMessage(detail.error)}
        retry={() => void detail.refetch()}
      />
    );
  }
  if (
    resourceId &&
    kind === "modelo" &&
    exerciseDetails.some((query) => query.isPending)
  ) {
    return <EditorLoading />;
  }

  if (kind === "modelo") {
    return (
      <WorkoutTemplateEditor
        key={
          template.data ? `${template.data.id}:${template.data.version}` : "novo-modelo"
        }
        initial={template.data}
        exerciseNames={exerciseNames}
        search={exerciseSearch}
        onSearchChange={setExerciseSearch}
        exerciseItems={exercises.data?.items ?? []}
        exercisesPending={exercises.isPending}
        exercisesError={exercises.isError ? exercises.error : null}
        retryExercises={() => void exercises.refetch()}
      />
    );
  }

  return (
    <TrainingPlanEditor
      key={plan.data ? `${plan.data.id}:${plan.data.version}` : "novo-plano"}
      initial={plan.data}
      templateSearch={templateSearch}
      onTemplateSearchChange={setTemplateSearch}
      templates={publishedTemplates.data?.items ?? []}
      templatesPending={publishedTemplates.isPending}
      templatesError={publishedTemplates.isError ? publishedTemplates.error : null}
      retryTemplates={() => void publishedTemplates.refetch()}
    />
  );
}

interface TemplateExerciseDraft {
  entityId: string;
  prescriptionEntityId: string;
  exerciseId: string;
  exerciseName: string;
  notes: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  suggestedLoadKg: string;
  restSeconds: number;
}

interface TemplateBlockDraft {
  entityId: string;
  label: string;
  exercises: TemplateExerciseDraft[];
}

function WorkoutTemplateEditor({
  initial,
  exerciseNames,
  search,
  onSearchChange,
  exerciseItems,
  exercisesPending,
  exercisesError,
  retryExercises,
}: {
  initial?: WorkoutTemplate;
  exerciseNames: Map<string, string>;
  search: string;
  onSearchChange: (value: string) => void;
  exerciseItems: { id: string; name: string; modality: string }[];
  exercisesPending: boolean;
  exercisesError: Error | null;
  retryExercises: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState(initial?.name ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [blocks, setBlocks] = useState<TemplateBlockDraft[]>(() =>
    initial
      ? initial.blocks.map((block) => ({
          entityId: globalThis.crypto.randomUUID(),
          label: block.label ?? "",
          exercises: block.exercises.map((exercise) => ({
            entityId: globalThis.crypto.randomUUID(),
            prescriptionEntityId: globalThis.crypto.randomUUID(),
            exerciseId: exercise.exerciseId,
            exerciseName:
              exerciseNames.get(exercise.exerciseId) ?? "Exercício do catálogo",
            notes: exercise.notes ?? "",
            sets: exercise.prescription.sets,
            repsMin: exercise.prescription.repsMin,
            repsMax: exercise.prescription.repsMax,
            suggestedLoadKg:
              exercise.prescription.suggestedLoadKg === null
                ? ""
                : String(exercise.prescription.suggestedLoadKg),
            restSeconds: exercise.prescription.restSeconds,
          })),
        }))
      : [],
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const operationRef = useRef<{
    key: string;
    operationId: string;
    clientEntityId: string;
  } | null>(null);
  const publishOperationRef = useRef<{ key: string; operationId: string } | null>(null);
  const isReadOnly = Boolean(initial && initial.status !== "DRAFT");
  const visibleExercises = exerciseItems;
  const exerciseCount = blocks.reduce(
    (total, block) => total + block.exercises.length,
    0,
  );
  const setCount = blocks.reduce(
    (total, block) =>
      total + block.exercises.reduce((sum, exercise) => sum + exercise.sets, 0),
    0,
  );
  const canSave = Boolean(
    name.trim() &&
      blocks.every((block) => block.exercises.every(isValidTemplateExercise)),
  );
  const canPublish = Boolean(
    canSave && blocks.length > 0 && blocks.every((block) => block.exercises.length > 0),
  );

  function addExercise(exercise: { id: string; name: string }) {
    setError(null);
    setNotice(null);
    setBlocks((current) => [
      ...current,
      {
        entityId: globalThis.crypto.randomUUID(),
        label: "",
        exercises: [
          {
            entityId: globalThis.crypto.randomUUID(),
            prescriptionEntityId: globalThis.crypto.randomUUID(),
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            notes: "",
            sets: 3,
            repsMin: 8,
            repsMax: 12,
            suggestedLoadKg: "",
            restSeconds: 90,
          },
        ],
      },
    ]);
  }

  function updateExercise(
    entityId: string,
    update: (exercise: TemplateExerciseDraft) => TemplateExerciseDraft,
  ) {
    setNotice(null);
    setBlocks((current) =>
      current.map((block) => ({
        ...block,
        exercises: block.exercises.map((exercise) =>
          exercise.entityId === entityId ? update(exercise) : exercise,
        ),
      })),
    );
  }

  function removeBlock(entityId: string) {
    setBlocks((current) => current.filter((block) => block.entityId !== entityId));
    setNotice(null);
  }

  function createDraft() {
    return {
      name: name.trim(),
      notes: notes.trim() || null,
      blocks: blocks.map(
        (block, blockIndex): WorkoutBlockInput => ({
          clientEntityId: block.entityId,
          position: blockIndex + 1,
          label: block.label.trim() || null,
          exercises: block.exercises.map(
            (exercise, exerciseIndex): WorkoutExerciseInput => ({
              clientEntityId: exercise.entityId,
              position: exerciseIndex + 1,
              exerciseId: exercise.exerciseId,
              notes: exercise.notes.trim() || null,
              prescription: {
                clientEntityId: exercise.prescriptionEntityId,
                sets: exercise.sets,
                repsMin: exercise.repsMin,
                repsMax: exercise.repsMax,
                suggestedLoadKg:
                  exercise.suggestedLoadKg.trim() === ""
                    ? null
                    : Number(exercise.suggestedLoadKg),
                restSeconds: exercise.restSeconds,
              },
            }),
          ),
        }),
      ),
    } satisfies WorkoutTemplateDraft;
  }

  function operationIds(draft: WorkoutTemplateDraft) {
    const key = JSON.stringify({
      templateId: initial?.id ?? null,
      version: initial?.version ?? null,
      draft,
    });
    if (operationRef.current?.key !== key) {
      operationRef.current = {
        key,
        operationId: globalThis.crypto.randomUUID(),
        clientEntityId: globalThis.crypto.randomUUID(),
      };
    }
    return operationRef.current;
  }

  async function saveDraft(navigate = true) {
    if (!canSave) {
      setError("Informe um nome e confira séries, repetições, carga e descanso.");
      return null;
    }
    if (isReadOnly) return initial ?? null;
    const draft = createDraft();
    const ids = operationIds(draft);
    setBusy(true);
    setError(null);
    try {
      const saved = initial
        ? await updateWorkoutTemplate(initial.id, {
            operationId: ids.operationId,
            expectedVersion: initial.version,
            ...draft,
          })
        : await createWorkoutTemplate({
            operationId: ids.operationId,
            clientEntityId: ids.clientEntityId,
            ...draft,
          } satisfies CreateWorkoutTemplateInput);
      operationRef.current = null;
      await invalidateTrainingQueries(queryClient, "modelo", saved.id);
      setNotice("Rascunho salvo.");
      if (navigate) router.replace(`/treinos/${saved.id}?tipo=modelo`);
      return saved;
    } catch (cause) {
      setError(errorMessage(cause));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!canPublish || busy || isReadOnly) return;
    const saved = await saveDraft(false);
    if (!saved) return;
    const key = `${saved.id}:${saved.version}`;
    if (publishOperationRef.current?.key !== key) {
      publishOperationRef.current = {
        key,
        operationId: globalThis.crypto.randomUUID(),
      };
    }
    setBusy(true);
    setError(null);
    try {
      const published = await publishWorkoutTemplate(saved.id, {
        operationId: publishOperationRef.current.operationId,
        expectedVersion: saved.version,
      });
      publishOperationRef.current = null;
      await invalidateTrainingQueries(queryClient, "modelo", published.id);
      router.replace(`/treinos/${published.id}?tipo=modelo`);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  if (isReadOnly && initial) {
    return <PublishedContent kind="modelo" name={initial.name} status={initial.status} />;
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void saveDraft();
      }}
    >
      <EditorHeader
        title={initial ? "Editar treino" : "Novo treino"}
        subtitle={
          initial ? `Rascunho · versão ${initial.version}` : "Biblioteca de treinos"
        }
        busy={busy}
        saveLabel="Salvar rascunho"
        saveDisabled={!canSave || busy}
        onPublish={publish}
        publishDisabled={!canPublish || busy}
      />
      {error ? <EditorAlert>{error}</EditorAlert> : null}
      {notice ? <EditorNotice>{notice}</EditorNotice> : null}

      <div className="grid items-start gap-4 xl:grid-cols-[17rem_minmax(22rem,1fr)_18rem]">
        <aside className="space-y-4 rounded-xl border border-border bg-surface p-4">
          <h2 className="font-[var(--font-syne)] text-lg font-bold text-ink-primary">
            Configurar
          </h2>
          <label
            htmlFor="training-template-name"
            className="block space-y-2 text-sm font-semibold text-ink-primary"
          >
            <span>Nome do treino</span>
            <Input
              id="training-template-name"
              aria-label="Nome do treino"
              value={name}
              maxLength={120}
              required
              onChange={(event) => setName(event.currentTarget.value)}
              placeholder="Ex.: Peito + tríceps"
            />
          </label>
          <label
            htmlFor="training-template-notes"
            className="block space-y-2 text-sm font-semibold text-ink-primary"
          >
            <span>Orientações</span>
            <textarea
              id="training-template-notes"
              aria-label="Orientações do treino"
              className={`${inputClass} min-h-28 w-full py-3`}
              value={notes}
              maxLength={2_000}
              onChange={(event) => setNotes(event.currentTarget.value)}
              placeholder="Orientações gerais para este treino…"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Exercícios" value={exerciseCount} />
            <Metric label="Séries" value={setCount} />
          </div>
        </aside>

        <main className="space-y-4">
          <section className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-brand">
                  Modelo versionado
                </p>
                <h2 className="mt-1 font-[var(--font-syne)] text-xl font-extrabold text-ink-primary">
                  {name.trim() || "Novo treino"}
                </h2>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-ink-secondary">
                Rascunho
              </span>
            </div>
          </section>

          {blocks.length === 0 ? (
            <section className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
              <IconBarbell
                aria-hidden="true"
                className="mx-auto text-ink-brand"
                size={30}
              />
              <h2 className="mt-3 font-semibold text-ink-primary">
                Comece pela biblioteca
              </h2>
              <p className="mt-1 text-sm text-ink-secondary">
                Adicione exercícios e ajuste séries, repetições, carga e descanso.
              </p>
            </section>
          ) : (
            blocks.map((block, blockIndex) => (
              <section
                className="overflow-hidden rounded-xl border border-border bg-surface"
                key={block.entityId}
              >
                <header className="flex items-center justify-between gap-3 border-b border-border p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full border border-border text-xs font-semibold text-ink-brand">
                      {String(blockIndex + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold text-ink-primary">
                        {block.exercises[0]?.exerciseName ?? "Bloco de exercícios"}
                      </p>
                      <p className="text-xs text-ink-secondary">
                        {block.exercises.length} exercício(s)
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label={`Remover bloco ${blockIndex + 1}`}
                    onClick={() => removeBlock(block.entityId)}
                  >
                    <IconTrash aria-hidden="true" size={17} />
                  </Button>
                </header>
                <div className="space-y-4 p-4">
                  {block.exercises.map((exercise) => (
                    <article className="space-y-3" key={exercise.entityId}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-ink-primary">
                          {exercise.exerciseName}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          aria-label={`Remover ${exercise.exerciseName}`}
                          onClick={() => removeBlock(block.entityId)}
                        >
                          <IconTrash aria-hidden="true" size={17} />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                        <NumberField
                          label={`Séries ${exercise.exerciseName}`}
                          value={exercise.sets}
                          min={1}
                          max={20}
                          onChange={(sets) =>
                            updateExercise(exercise.entityId, (item) => ({
                              ...item,
                              sets,
                            }))
                          }
                        />
                        <NumberField
                          label={`Repetições mínimas ${exercise.exerciseName}`}
                          value={exercise.repsMin}
                          min={1}
                          max={1_000}
                          onChange={(repsMin) =>
                            updateExercise(exercise.entityId, (item) => ({
                              ...item,
                              repsMin,
                            }))
                          }
                        />
                        <NumberField
                          label={`Repetições máximas ${exercise.exerciseName}`}
                          value={exercise.repsMax}
                          min={1}
                          max={1_000}
                          onChange={(repsMax) =>
                            updateExercise(exercise.entityId, (item) => ({
                              ...item,
                              repsMax,
                            }))
                          }
                        />
                        <NumberField
                          label={`Descanso em segundos ${exercise.exerciseName}`}
                          value={exercise.restSeconds}
                          min={0}
                          max={3_600}
                          onChange={(restSeconds) =>
                            updateExercise(exercise.entityId, (item) => ({
                              ...item,
                              restSeconds,
                            }))
                          }
                        />
                      </div>
                      <label
                        htmlFor={`suggested-load-${exercise.entityId}`}
                        className="block space-y-2 text-sm font-medium text-ink-secondary"
                      >
                        <span>Carga sugerida (kg)</span>
                        <Input
                          id={`suggested-load-${exercise.entityId}`}
                          type="number"
                          min={0}
                          max={10_000}
                          step="0.25"
                          value={exercise.suggestedLoadKg}
                          onChange={(event) => {
                            const suggestedLoadKg = event.currentTarget.value;
                            updateExercise(exercise.entityId, (item) => ({
                              ...item,
                              suggestedLoadKg,
                            }));
                          }}
                        />
                      </label>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </main>

        <aside className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="space-y-3 border-b border-border p-4">
            <h2 className="font-[var(--font-syne)] text-lg font-bold text-ink-primary">
              Biblioteca
            </h2>
            <label htmlFor="exercise-search" className="relative block">
              <IconSearch
                aria-hidden="true"
                className="absolute left-3 top-3 text-ink-tertiary"
                size={17}
              />
              <Input
                id="exercise-search"
                aria-label="Buscar exercício"
                className="pl-9"
                value={search}
                onChange={(event) => onSearchChange(event.currentTarget.value)}
                placeholder="Buscar exercício…"
              />
            </label>
          </div>
          {exercisesPending ? (
            <p role="status" className="p-4 text-sm text-ink-secondary">
              Carregando exercícios…
            </p>
          ) : exercisesError ? (
            <EditorQueryError error={exercisesError} retry={retryExercises} />
          ) : visibleExercises.length === 0 ? (
            <p className="p-4 text-sm text-ink-secondary">
              {search.trim()
                ? "Nenhum exercício corresponde à busca."
                : "Nenhum exercício ativo no catálogo."}
            </p>
          ) : (
            <ul className="max-h-[34rem] divide-y divide-border overflow-y-auto">
              {visibleExercises.map((exercise) => (
                <li
                  className="flex items-center justify-between gap-3 p-3"
                  key={exercise.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-primary">
                      {exercise.name}
                    </p>
                    <p className="text-xs text-ink-tertiary">
                      {modalityLabel(exercise.modality)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label={`Adicionar ${exercise.name}`}
                    onClick={() => addExercise(exercise)}
                  >
                    <IconPlus aria-hidden="true" size={17} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </form>
  );
}

interface PlanWorkoutDraft {
  entityId: string;
  weekday: number;
  label: string;
  workoutTemplateVersionId: string;
}

function TrainingPlanEditor({
  initial,
  templateSearch,
  onTemplateSearchChange,
  templates,
  templatesPending,
  templatesError,
  retryTemplates,
}: {
  initial?: TrainingPlan;
  templateSearch: string;
  onTemplateSearchChange: (value: string) => void;
  templates: {
    id: string;
    name: string;
    currentPublishedVersionId: string | null;
    version: number;
  }[];
  templatesPending: boolean;
  templatesError: Error | null;
  retryTemplates: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState(initial?.name ?? "");
  const [workouts, setWorkouts] = useState<PlanWorkoutDraft[]>(() =>
    initial
      ? initial.workouts.map((workout) => ({
          entityId: globalThis.crypto.randomUUID(),
          weekday: workout.weekday,
          label: workout.label ?? "",
          workoutTemplateVersionId: workout.workoutTemplateVersionId,
        }))
      : [newPlanWorkout(1)],
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const operationRef = useRef<{
    key: string;
    operationId: string;
    clientEntityId: string;
  } | null>(null);
  const publishOperationRef = useRef<{ key: string; operationId: string } | null>(null);
  const isReadOnly = Boolean(initial && initial.status !== "DRAFT");
  const selectedWorkouts = workouts.filter((workout) =>
    isUuid(workout.workoutTemplateVersionId),
  );
  const canSave = Boolean(name.trim());
  const canPublish = Boolean(canSave && selectedWorkouts.length > 0);

  function addWorkout() {
    if (workouts.length >= 7) return;
    const usedWeekdays = new Set(workouts.map((workout) => workout.weekday));
    const weekday = [1, 2, 3, 4, 5, 6, 7].find((day) => !usedWeekdays.has(day));
    if (!weekday) return;
    setWorkouts((current) => [...current, newPlanWorkout(weekday)]);
    setNotice(null);
  }

  function updateWorkout(
    entityId: string,
    update: (workout: PlanWorkoutDraft) => PlanWorkoutDraft,
  ) {
    setWorkouts((current) =>
      current.map((workout) =>
        workout.entityId === entityId ? update(workout) : workout,
      ),
    );
    setNotice(null);
  }

  function moveWorkout(entityId: string, direction: -1 | 1) {
    setWorkouts((current) => {
      const index = current.findIndex((workout) => workout.entityId === entityId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setNotice(null);
  }

  function createDraft() {
    return {
      name: name.trim(),
      workouts: selectedWorkouts.map((workout, index) => ({
        clientEntityId: workout.entityId,
        position: index + 1,
        weekday: workout.weekday,
        label: workout.label.trim() || null,
        workoutTemplateVersionId: workout.workoutTemplateVersionId,
      })),
    } satisfies TrainingPlanDraft;
  }

  function operationIds(draft: TrainingPlanDraft) {
    const key = JSON.stringify({
      planId: initial?.id ?? null,
      version: initial?.version ?? null,
      draft,
    });
    if (operationRef.current?.key !== key) {
      operationRef.current = {
        key,
        operationId: globalThis.crypto.randomUUID(),
        clientEntityId: globalThis.crypto.randomUUID(),
      };
    }
    return operationRef.current;
  }

  async function saveDraft(navigate = true) {
    if (!canSave) {
      setError("Informe o nome do plano.");
      return null;
    }
    if (isReadOnly) return initial ?? null;
    const draft = createDraft();
    const ids = operationIds(draft);
    setBusy(true);
    setError(null);
    try {
      const saved = initial
        ? await updateTrainingPlan(initial.id, {
            operationId: ids.operationId,
            expectedVersion: initial.version,
            ...draft,
          })
        : await createTrainingPlan({
            operationId: ids.operationId,
            clientEntityId: ids.clientEntityId,
            ...draft,
          } satisfies CreateTrainingPlanInput);
      operationRef.current = null;
      await invalidateTrainingQueries(queryClient, "plano", saved.id);
      setNotice("Rascunho salvo.");
      if (navigate) router.replace(`/treinos/${saved.id}?tipo=plano`);
      return saved;
    } catch (cause) {
      setError(errorMessage(cause));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!canPublish || busy || isReadOnly) return;
    const saved = await saveDraft(false);
    if (!saved) return;
    const key = `${saved.id}:${saved.version}`;
    if (publishOperationRef.current?.key !== key) {
      publishOperationRef.current = {
        key,
        operationId: globalThis.crypto.randomUUID(),
      };
    }
    setBusy(true);
    setError(null);
    try {
      const published = await publishTrainingPlan(saved.id, {
        operationId: publishOperationRef.current.operationId,
        expectedVersion: saved.version,
      });
      publishOperationRef.current = null;
      await invalidateTrainingQueries(queryClient, "plano", published.id);
      router.replace(`/treinos/${published.id}?tipo=plano`);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  if (isReadOnly && initial) {
    return (
      <div className="space-y-5">
        <PublishedContent kind="plano" name={initial.name} status={initial.status} />
        {initial.status === "PUBLISHED" && initial.currentPublishedVersionId ? (
          <WorkoutAssignmentForm planVersionId={initial.currentPublishedVersionId} />
        ) : null}
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void saveDraft();
      }}
    >
      <EditorHeader
        title={initial ? "Editar plano" : "Novo plano"}
        subtitle={
          initial ? `Rascunho · versão ${initial.version}` : "Distribuição semanal"
        }
        busy={busy}
        saveLabel="Salvar rascunho"
        saveDisabled={!canSave || busy}
        onPublish={publish}
        publishDisabled={!canPublish || busy}
      />
      {error ? <EditorAlert>{error}</EditorAlert> : null}
      {notice ? <EditorNotice>{notice}</EditorNotice> : null}

      <div className="grid items-start gap-4 xl:grid-cols-[17rem_minmax(22rem,1fr)_20rem]">
        <aside className="space-y-4 rounded-xl border border-border bg-surface p-4">
          <h2 className="font-[var(--font-syne)] text-lg font-bold text-ink-primary">
            Configurar
          </h2>
          <label
            htmlFor="training-plan-name"
            className="block space-y-2 text-sm font-semibold text-ink-primary"
          >
            <span>Nome do plano</span>
            <Input
              id="training-plan-name"
              aria-label="Nome do plano"
              value={name}
              maxLength={120}
              required
              onChange={(event) => setName(event.currentTarget.value)}
              placeholder="Ex.: Hipertrofia — Fase 1"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Treinos" value={selectedWorkouts.length} />
            <Metric
              label="Dias livres"
              value={Math.max(0, 7 - selectedWorkouts.length)}
            />
          </div>
          <p className="text-xs leading-5 text-ink-secondary">
            Planos usam versões publicadas dos treinos. Alterações futuras nos modelos não
            mudam este plano.
          </p>
        </aside>

        <main className="space-y-4">
          <section className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-brand">
              Semana de treino
            </p>
            <h2 className="mt-1 font-[var(--font-syne)] text-xl font-extrabold text-ink-primary">
              {name.trim() || "Novo plano semanal"}
            </h2>
          </section>

          {workouts.length === 0 ? (
            <section className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
              <IconBarbell
                aria-hidden="true"
                className="mx-auto text-ink-brand"
                size={30}
              />
              <h2 className="mt-3 font-semibold text-ink-primary">
                Adicione o primeiro dia
              </h2>
              <p className="mt-1 text-sm text-ink-secondary">
                Escolha um treino publicado na biblioteca à direita.
              </p>
            </section>
          ) : (
            workouts.map((workout, index) => (
              <section
                className="rounded-xl border border-border bg-surface p-4"
                key={workout.entityId}
              >
                <header className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-brand">
                      Treino {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 font-semibold text-ink-primary">
                      {weekdayName(workout.weekday)}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      aria-label={`Mover treino ${index + 1} para cima`}
                      disabled={index === 0}
                      onClick={() => moveWorkout(workout.entityId, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      aria-label={`Remover treino ${index + 1}`}
                      onClick={() =>
                        setWorkouts((current) =>
                          current.filter((item) => item.entityId !== workout.entityId),
                        )
                      }
                    >
                      <IconTrash aria-hidden="true" size={17} />
                    </Button>
                  </div>
                </header>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-2 text-sm font-semibold text-ink-primary">
                    <span>Dia da semana</span>
                    <select
                      className={`${inputClass} w-full`}
                      value={workout.weekday}
                      onChange={(event) => {
                        const weekday = Number(event.currentTarget.value);
                        updateWorkout(workout.entityId, (item) => ({ ...item, weekday }));
                      }}
                    >
                      {Array.from({ length: 7 }, (_, index) => index + 1).map(
                        (weekday) => (
                          <option
                            key={weekday}
                            value={weekday}
                            disabled={workouts.some(
                              (item) =>
                                item.entityId !== workout.entityId &&
                                item.weekday === weekday,
                            )}
                          >
                            {weekdayName(weekday)}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="block space-y-2 text-sm font-semibold text-ink-primary">
                    <span>
                      Treino de {weekdayName(workout.weekday).toLocaleLowerCase("pt-BR")}
                    </span>
                    <select
                      aria-label={`Treino de ${weekdayName(workout.weekday).toLocaleLowerCase("pt-BR")}`}
                      className={`${inputClass} w-full`}
                      value={workout.workoutTemplateVersionId}
                      onChange={(event) => {
                        const workoutTemplateVersionId = event.currentTarget.value;
                        updateWorkout(workout.entityId, (item) => ({
                          ...item,
                          workoutTemplateVersionId,
                        }));
                      }}
                    >
                      <option value="">Selecione um treino publicado</option>
                      {templates.map((template) =>
                        template.currentPublishedVersionId ? (
                          <option
                            key={template.id}
                            value={template.currentPublishedVersionId}
                          >
                            {template.name} · v{template.version}
                          </option>
                        ) : null,
                      )}
                    </select>
                  </label>
                </div>
                <label
                  htmlFor={`workout-label-${workout.entityId}`}
                  className="mt-3 block space-y-2 text-sm font-medium text-ink-secondary"
                >
                  <span>Observação opcional</span>
                  <Input
                    id={`workout-label-${workout.entityId}`}
                    value={workout.label}
                    maxLength={120}
                    onChange={(event) => {
                      const label = event.currentTarget.value;
                      updateWorkout(workout.entityId, (item) => ({ ...item, label }));
                    }}
                    placeholder="Ex.: foco em técnica"
                  />
                </label>
              </section>
            ))
          )}

          <Button
            type="button"
            variant="outline"
            disabled={workouts.length >= 7}
            onClick={addWorkout}
          >
            <IconPlus aria-hidden="true" size={18} />
            Adicionar treino
          </Button>
        </main>

        <aside className="overflow-hidden rounded-xl border border-border bg-surface">
          <header className="border-b border-border p-4">
            <h2 className="font-[var(--font-syne)] text-lg font-bold text-ink-primary">
              Biblioteca
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Treinos publicados disponíveis para este plano.
            </p>
            <label htmlFor="published-template-search" className="mt-3 block">
              <Input
                id="published-template-search"
                aria-label="Buscar treino publicado"
                value={templateSearch}
                onChange={(event) => onTemplateSearchChange(event.currentTarget.value)}
                placeholder="Buscar treino…"
              />
            </label>
          </header>
          {templatesPending ? (
            <p role="status" className="p-4 text-sm text-ink-secondary">
              Carregando biblioteca…
            </p>
          ) : templatesError ? (
            <EditorQueryError error={templatesError} retry={retryTemplates} />
          ) : templates.length === 0 ? (
            <div className="p-4">
              <p className="text-sm text-ink-secondary">
                Publique um treino antes de montar o plano semanal.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/treinos/novo?tipo=modelo">Criar treino</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {templates.map((template) => (
                <li className="p-4" key={template.id}>
                  <p className="font-semibold text-ink-primary">{template.name}</p>
                  <p className="mt-1 text-xs text-ink-secondary">
                    Versão {template.version}
                  </p>
                  <Button
                    className="mt-3 w-full"
                    type="button"
                    variant="outline"
                    disabled={!template.currentPublishedVersionId || workouts.length >= 7}
                    onClick={() => {
                      const workoutTemplateVersionId = template.currentPublishedVersionId;
                      const day = [1, 2, 3, 4, 5, 6, 7].find(
                        (value) => !workouts.some((workout) => workout.weekday === value),
                      );
                      if (!day || !workoutTemplateVersionId) return;
                      setWorkouts((current) => [
                        ...current,
                        {
                          ...newPlanWorkout(day),
                          workoutTemplateVersionId,
                        },
                      ]);
                    }}
                  >
                    <IconPlus aria-hidden="true" size={16} />
                    Adicionar à semana
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </form>
  );
}

function EditorHeader({
  title,
  subtitle,
  busy,
  saveLabel,
  saveDisabled,
  onPublish,
  publishDisabled,
}: {
  title: string;
  subtitle: string;
  busy: boolean;
  saveLabel: string;
  saveDisabled: boolean;
  onPublish: () => void;
  publishDisabled: boolean;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          asChild
          variant="outline"
          className="size-11 shrink-0 px-0"
          aria-label="Voltar aos treinos"
        >
          <Link href="/treinos">
            <IconArrowLeft aria-hidden="true" size={18} />
          </Link>
        </Button>
        <div className="min-w-0">
          <p className="text-sm text-ink-secondary">{subtitle}</p>
          <h1 className="truncate font-[var(--font-syne)] text-2xl font-extrabold text-ink-primary">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="outline" disabled={saveDisabled}>
          <IconDeviceFloppy aria-hidden="true" size={17} />
          {busy ? "Salvando…" : saveLabel}
        </Button>
        <Button type="button" disabled={publishDisabled || busy} onClick={onPublish}>
          <IconSend aria-hidden="true" size={17} />
          {busy ? "Publicando…" : "Publicar"}
        </Button>
      </div>
    </header>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const inputId = useId();
  return (
    <label
      htmlFor={inputId}
      className="block space-y-2 text-sm font-medium text-ink-secondary"
    >
      <span>{label}</span>
      <Input
        id={inputId}
        type="number"
        value={value}
        min={min}
        max={max}
        step={1}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-page p-3">
      <p className="font-[var(--font-syne)] text-2xl font-extrabold text-ink-brand">
        {value}
      </p>
      <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-ink-tertiary">
        {label}
      </p>
    </div>
  );
}

function isValidTemplateExercise(exercise: TemplateExerciseDraft) {
  const load =
    exercise.suggestedLoadKg.trim() === "" ? null : Number(exercise.suggestedLoadKg);
  return (
    isUuid(exercise.exerciseId) &&
    Number.isSafeInteger(exercise.sets) &&
    exercise.sets >= 1 &&
    exercise.sets <= 20 &&
    Number.isSafeInteger(exercise.repsMin) &&
    exercise.repsMin >= 1 &&
    Number.isSafeInteger(exercise.repsMax) &&
    exercise.repsMax >= exercise.repsMin &&
    exercise.repsMax <= 1_000 &&
    (load === null ||
      (Number.isFinite(load) &&
        load >= 0 &&
        load <= 10_000 &&
        Number(load.toFixed(2)) === load)) &&
    Number.isSafeInteger(exercise.restSeconds) &&
    exercise.restSeconds >= 0 &&
    exercise.restSeconds <= 3_600
  );
}

function PublishedContent({
  kind,
  name,
  status,
}: {
  kind: TrainingEditorKind;
  name: string;
  status: TrainingStatus;
}) {
  return (
    <section className="mx-auto max-w-3xl space-y-4 rounded-xl border border-border bg-surface p-6">
      <p className="text-sm font-semibold text-ink-brand">
        {status === "PUBLISHED" ? "Conteúdo publicado" : "Conteúdo arquivado"}
      </p>
      <h1 className="font-[var(--font-syne)] text-3xl font-extrabold text-ink-primary">
        {name}
      </h1>
      <p className="text-sm text-ink-secondary">
        Versões publicadas são imutáveis. Crie um novo rascunho para fazer alterações sem
        modificar os planos existentes.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/treinos">Voltar aos treinos</Link>
        </Button>
        <Button asChild>
          <Link href={`/treinos/novo?tipo=${kind}`}>
            Criar outro {kind === "modelo" ? "treino" : "plano"}
          </Link>
        </Button>
      </div>
    </section>
  );
}

function WorkoutAssignmentForm({ planVersionId }: { planVersionId: string }) {
  const [studentSearch, setStudentSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [startsOn, setStartsOn] = useState(localCalendarDate);
  const [endsOn, setEndsOn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [completedPayloadKey, setCompletedPayloadKey] = useState<string | null>(null);
  const operationRef = useRef<{
    key: string;
    operationId: string;
    clientEntityId: string;
  } | null>(null);
  const filter = {
    ...DEFAULT_STUDENT_FILTERS,
    status: "ACTIVE" as const,
    search: studentSearch.trim() || undefined,
  };
  const students = useQuery({
    queryKey: studentQueryKeys.list(filter),
    queryFn: ({ signal }) => listStudents(filter, signal),
  });
  const payloadKey = JSON.stringify({ studentId, planVersionId, startsOn, endsOn });
  const activeStudents = students.data?.items ?? [];

  async function assign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isUuid(studentId) || !isUuid(planVersionId) || !startsOn) {
      setError("Selecione um aluno ativo e uma data de início.");
      return;
    }
    if (endsOn && endsOn < startsOn) {
      setError("A data final não pode ser anterior à data de início.");
      return;
    }
    if (completedPayloadKey === payloadKey) return;
    if (operationRef.current?.key !== payloadKey) {
      operationRef.current = {
        key: payloadKey,
        operationId: globalThis.crypto.randomUUID(),
        clientEntityId: globalThis.crypto.randomUUID(),
      };
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const assignment = await createWorkoutAssignment({
        operationId: operationRef.current.operationId,
        clientEntityId: operationRef.current.clientEntityId,
        studentId,
        trainingPlanVersionId: planVersionId,
        startsOn,
        endsOn: endsOn || null,
        replacesAssignmentId: null,
        replacementReason: null,
      });
      const student = activeStudents.find((item) => item.id === studentId);
      setCompletedPayloadKey(payloadKey);
      operationRef.current = null;
      setNotice(
        `Plano atribuído a ${student?.name ?? "aluno"} · ${assignment.status === "ACTIVE" ? "ativo" : "agendado"}.`,
      );
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-brand">
          Carteira de alunos
        </p>
        <h2 className="mt-1 font-[var(--font-syne)] text-xl font-extrabold text-ink-primary">
          Atribuir este plano
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Cada aluno recebe uma cópia imutável da versão publicada.
        </p>
      </header>

      {error ? <EditorAlert>{error}</EditorAlert> : null}
      {notice ? <EditorNotice>{notice}</EditorNotice> : null}
      {students.isError ? (
        <EditorQueryError error={students.error} retry={() => void students.refetch()} />
      ) : students.isPending ? (
        <p role="status" className="text-sm text-ink-secondary">
          Carregando alunos ativos…
        </p>
      ) : students.data.totalCount === 0 && !studentSearch ? (
        <div className="rounded-lg border border-dashed border-border p-5 text-center">
          <p className="text-sm text-ink-secondary">
            Nenhum aluno ativo para receber este plano.
          </p>
          <Button asChild className="mt-3" variant="outline">
            <Link href="/alunos">Gerenciar alunos</Link>
          </Button>
        </div>
      ) : (
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={assign}>
          <label
            htmlFor="assignment-student-search"
            className="block space-y-2 text-sm font-semibold text-ink-primary"
          >
            <span>Buscar aluno ativo</span>
            <Input
              id="assignment-student-search"
              value={studentSearch}
              onChange={(event) => {
                setStudentSearch(event.currentTarget.value);
                setStudentId("");
                setNotice(null);
              }}
              placeholder="Nome do aluno…"
            />
          </label>
          <label
            htmlFor="assignment-student"
            className="block space-y-2 text-sm font-semibold text-ink-primary"
          >
            <span>Aluno</span>
            <select
              id="assignment-student"
              className={`${inputClass} w-full`}
              value={studentId}
              required
              onChange={(event) => {
                setStudentId(event.currentTarget.value);
                setNotice(null);
              }}
            >
              <option value="">Selecione um aluno</option>
              {activeStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            {activeStudents.length === 0 ? (
              <span className="block text-xs font-normal text-ink-tertiary">
                Nenhum resultado nesta página de busca.
              </span>
            ) : null}
          </label>
          <label
            htmlFor="assignment-starts-on"
            className="block space-y-2 text-sm font-semibold text-ink-primary"
          >
            <span>Início</span>
            <Input
              id="assignment-starts-on"
              type="date"
              value={startsOn}
              required
              onChange={(event) => {
                setStartsOn(event.currentTarget.value);
                setNotice(null);
              }}
            />
          </label>
          <label
            htmlFor="assignment-ends-on"
            className="block space-y-2 text-sm font-semibold text-ink-primary"
          >
            <span>Término opcional</span>
            <Input
              id="assignment-ends-on"
              type="date"
              min={startsOn}
              value={endsOn}
              onChange={(event) => {
                setEndsOn(event.currentTarget.value);
                setNotice(null);
              }}
            />
          </label>
          <div className="md:col-span-2 xl:col-span-4">
            <Button
              type="submit"
              disabled={
                busy || !studentId || !startsOn || completedPayloadKey === payloadKey
              }
            >
              <IconSend aria-hidden="true" size={17} />
              {busy ? "Atribuindo…" : "Atribuir plano"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

function EditorLoading() {
  return (
    <p
      role="status"
      className="rounded-lg border border-border bg-surface p-5 text-sm text-ink-secondary"
    >
      Carregando treino…
    </p>
  );
}

function EditorError({
  title,
  detail,
  retry,
}: {
  title: string;
  detail: string;
  retry?: () => void;
}) {
  return (
    <section
      role="alert"
      className="rounded-lg border border-danger-text/30 bg-surface p-5"
    >
      <h1 className="font-bold text-ink-primary">{title}</h1>
      <p className="mt-2 text-sm text-ink-secondary">{detail}</p>
      {retry ? (
        <Button className="mt-4" variant="outline" onClick={retry}>
          Tentar novamente
        </Button>
      ) : null}
      <Button asChild className="mt-4" variant="ghost">
        <Link href="/treinos">Voltar aos treinos</Link>
      </Button>
    </section>
  );
}

function EditorQueryError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div role="alert" className="p-4">
      <p className="text-sm text-ink-secondary">{errorMessage(error)}</p>
      {error instanceof NodusApiError && error.status === 401 ? (
        <Button asChild className="mt-3" variant="outline">
          <Link href="/acesso?perfil=personal">Entrar novamente</Link>
        </Button>
      ) : (
        <Button className="mt-3" variant="outline" onClick={retry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

function EditorAlert({ children }: { children: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-danger-text/30 bg-surface p-4 text-sm text-ink-primary"
    >
      {children}
    </p>
  );
}

function EditorNotice({ children }: { children: string }) {
  return (
    <p
      role="status"
      className="rounded-lg border border-brand-400/30 bg-success-bg p-4 text-sm text-success-text"
    >
      {children}
    </p>
  );
}

function errorMessage(error: unknown) {
  if (error instanceof NodusApiError) {
    if (error.status === 401) return "Sessão encerrada. Entre novamente para continuar.";
    return `${error.message}${error.code ? ` · ${error.code}` : ""}`;
  }
  return error instanceof Error ? error.message : "Tente novamente.";
}

async function invalidateTrainingQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  kind: TrainingEditorKind,
  id: string,
) {
  const listKey = kind === "modelo" ? ["workout-templates"] : ["training-plans"];
  const detailOptions =
    kind === "modelo" ? workoutTemplateDetailOptions(id) : trainingPlanDetailOptions(id);
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: listKey }),
    queryClient.invalidateQueries({ queryKey: detailOptions.queryKey }),
  ]);
}

function newPlanWorkout(weekday: number): PlanWorkoutDraft {
  return {
    entityId: globalThis.crypto.randomUUID(),
    weekday,
    label: "",
    workoutTemplateVersionId: "",
  };
}

function weekdayName(weekday: number) {
  return (
    [
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
      "Domingo",
    ][weekday - 1] ?? "Dia inválido"
  );
}

function localCalendarDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function modalityLabel(modality: string) {
  return modality === "STRENGTH"
    ? "Força"
    : modality === "CARDIO"
      ? "Cardio"
      : "Mobilidade";
}
