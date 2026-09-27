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
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_EXERCISE_FILTERS } from "@/features/exercises/exercise-query-keys";
import { exerciseListQueryOptions } from "@/features/exercises/exercises-api";
import {
  DEFAULT_STUDENT_FILTERS,
  studentQueryKeys,
} from "@/features/students/student-query-keys";
import { listStudents } from "@/features/students/students-api";
import {
  publishTrainingPlanMutationOptions,
  saveTrainingPlanMutationOptions,
  trainingPlanDetailQueryOptions,
} from "@/features/training-plans/training-plans-api";
import { NodusApiError } from "@/lib/api/nodus-api-client";
import type { ExerciseCatalogItem } from "@/lib/contracts/exercises";
import { isUuid } from "@/lib/contracts/students";
import type {
  TrainingPlanDay,
  TrainingPlanDraftInput,
  TrainingPlanResponse,
  TrainingPlanSetInput,
} from "@/lib/contracts/training-plans";

interface TrainingPlanBuilderClientProps {
  planId?: string;
}

interface EditorSet {
  localId: string;
  targetRepetitions: number | null;
  loadKg: number | null;
  restSeconds: number;
  targetDurationSeconds: number | null;
}

interface EditorExercise {
  localId: string;
  exerciseId: string;
  exerciseName: string;
  supersetGroup: string | null;
  sets: EditorSet[];
}

interface EditorDay {
  localId: string;
  code: string;
  name: string;
  exercises: EditorExercise[];
}

const inputClass =
  "min-h-11 rounded-lg border border-border bg-page px-3 text-sm text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";

export function TrainingPlanBuilderClient({ planId }: TrainingPlanBuilderClientProps) {
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const students = useQuery({
    queryKey: studentQueryKeys.list(DEFAULT_STUDENT_FILTERS),
    queryFn: ({ signal }) => listStudents(DEFAULT_STUDENT_FILTERS, signal),
  });
  const validPlanId = planId && isUuid(planId) ? planId : "";
  const planQuery = useQuery({
    ...trainingPlanDetailQueryOptions(validPlanId),
    enabled: Boolean(validPlanId),
  });

  if (planId && !validPlanId) {
    return (
      <BuilderError
        title="Plano não encontrado"
        detail="O identificador do plano é inválido."
      />
    );
  }
  if (planId && planQuery.isPending) return <BuilderLoading />;
  if (planId && planQuery.isError) {
    return (
      <BuilderError
        title="Não foi possível carregar este plano"
        detail={getErrorMessage(planQuery.error)}
        retry={() => void planQuery.refetch()}
      />
    );
  }
  if (planQuery.data?.status === "PUBLISHED") {
    return (
      <section className="mx-auto max-w-3xl space-y-4 rounded-xl border border-border bg-surface p-6">
        <p className="text-sm font-semibold text-ink-brand">Plano publicado</p>
        <h1 className="font-[var(--font-syne)] text-3xl font-extrabold">
          {planQuery.data.name}
        </h1>
        <p className="text-sm text-ink-secondary">
          Este plano já foi publicado e não pode ser editado. Para alterar o treino, crie
          um novo rascunho.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/treinos?studentId=${planQuery.data.studentProfileId}`}>
              <IconArrowLeft aria-hidden="true" size={18} />
              Voltar aos treinos
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/treinos/novo?studentId=${planQuery.data.studentProfileId}`}>
              <IconPlus aria-hidden="true" size={18} />
              Criar outro plano
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  if (students.isPending) return <BuilderLoading />;
  if (students.isError) {
    return (
      <BuilderError
        title="Não foi possível carregar os alunos"
        detail={getErrorMessage(students.error)}
        retry={() => void students.refetch()}
      />
    );
  }
  if (students.data.totalCount === 0) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-border bg-surface p-6 text-center">
        <IconBarbell aria-hidden="true" className="mx-auto text-ink-brand" size={32} />
        <h1 className="mt-3 font-[var(--font-syne)] text-2xl font-extrabold">
          Vincule um aluno antes de criar um treino
        </h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Os planos são vinculados a um aluno e só ficam disponíveis dentro desse vínculo.
        </p>
        <Button asChild className="mt-5">
          <Link href="/alunos">Ir para alunos</Link>
        </Button>
      </section>
    );
  }

  return (
    <TrainingPlanEditor
      key={planQuery.data ? `${planQuery.data.id}:${planQuery.data.version}` : "new-plan"}
      plan={planQuery.data}
      initialStudentId={params.get("studentId") ?? ""}
      studentItems={students.data.items}
      queryClient={queryClient}
    />
  );
}

function TrainingPlanEditor({
  plan,
  initialStudentId,
  studentItems,
  queryClient,
}: {
  plan?: TrainingPlanResponse;
  initialStudentId: string;
  studentItems: { id: string; name: string; status: string; email: string }[];
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(
    plan?.studentProfileId ?? (isUuid(initialStudentId) ? initialStudentId : ""),
  );
  const [name, setName] = useState(plan?.name ?? "");
  const [notes, setNotes] = useState(plan?.notes ?? "");
  const [days, setDays] = useState<EditorDay[]>(() =>
    plan ? editorDaysFromPlan(plan.days) : [emptyDay("A", "Treino A")],
  );
  const [activeDay, setActiveDay] = useState(days[0]?.code ?? "");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);
  const operationRef = useRef<string | null>(null);
  const entityRef = useRef<string | null>(null);
  const publishOperationRef = useRef<{ key: string; operationId: string } | null>(null);
  const priorSubmissionRef = useRef<string | null>(null);
  const saveMutation = useMutation(saveTrainingPlanMutationOptions(queryClient));
  const publishMutation = useMutation(publishTrainingPlanMutationOptions(queryClient));
  const exerciseFilter = {
    ...DEFAULT_EXERCISE_FILTERS,
    search: exerciseSearch.trim() || undefined,
  };
  const exercises = useQuery({
    ...exerciseListQueryOptions(exerciseFilter),
    placeholderData: keepPreviousData,
  });
  const currentDay = days.find((day) => day.code === activeDay) ?? days[0];
  const selectedStudent = studentItems.find((student) => student.id === studentId);
  const draft = createDraft(name, notes, days);
  const originalDraft = plan ? draftFromPlan(plan) : null;
  const isDirty =
    !originalDraft || JSON.stringify(draft) !== JSON.stringify(originalDraft);
  const exerciseCount = days.reduce((total, day) => total + day.exercises.length, 0);
  const setCount = days.reduce(
    (total, day) =>
      total + day.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0),
    0,
  );
  const canPublish = Boolean(
    studentId &&
      name.trim() &&
      days.length > 0 &&
      days.every(
        (day) =>
          day.exercises.length > 0 &&
          day.exercises.every(
            (exercise) =>
              exercise.sets.length > 0 &&
              exercise.sets.every(
                (set) =>
                  set.targetRepetitions !== null || set.targetDurationSeconds !== null,
              ),
          ),
      ) &&
      days.every((day) => {
        const groups = new Map<string, number>();
        for (const exercise of day.exercises) {
          if (exercise.supersetGroup)
            groups.set(
              exercise.supersetGroup,
              (groups.get(exercise.supersetGroup) ?? 0) + 1,
            );
        }
        return [...groups.values()].every((count) => count >= 2);
      }),
  );

  function changeDays(update: (current: EditorDay[]) => EditorDay[]) {
    setSavedNotice(false);
    setDays(update);
  }

  function saveDraftPayload() {
    if (!studentId) throw new Error("Selecione um aluno antes de salvar.");
    if (draft.name.trim().length === 0) throw new Error("Informe o nome do plano.");
    const submission = JSON.stringify({
      studentId,
      planId: plan?.id ?? null,
      expectedVersion: plan?.version ?? null,
      draft,
    });
    if (priorSubmissionRef.current !== submission) {
      operationRef.current = crypto.randomUUID();
      if (!plan) entityRef.current = crypto.randomUUID();
      priorSubmissionRef.current = submission;
    }
    operationRef.current ??= crypto.randomUUID();
    entityRef.current ??= crypto.randomUUID();
    return saveMutation.mutateAsync({
      studentId,
      planId: plan?.id ?? null,
      expectedVersion: plan?.version ?? null,
      draft,
      operationId: operationRef.current,
      clientEntityId: plan?.id ?? entityRef.current,
    });
  }

  async function saveDraft() {
    try {
      const saved = await saveDraftPayload();
      operationRef.current = null;
      priorSubmissionRef.current = null;
      setSavedNotice(true);
      if (!plan) {
        entityRef.current = null;
        router.replace(`/treinos/${saved.id}`);
      }
      return saved;
    } catch {
      setSavedNotice(false);
      return null;
    }
  }

  async function publish() {
    if (!canPublish || !studentId) return;
    setSavedNotice(false);
    try {
      const saved = plan && !isDirty ? plan : await saveDraftPayload();
      const publishKey = `${saved.id}:${saved.version}`;
      if (publishOperationRef.current?.key !== publishKey) {
        publishOperationRef.current = {
          key: publishKey,
          operationId: crypto.randomUUID(),
        };
      }
      const published = await publishMutation.mutateAsync({
        planId: saved.id,
        expectedVersion: saved.version,
        operationId: publishOperationRef.current.operationId,
      });
      publishOperationRef.current = null;
      setSavedNotice(true);
      router.replace(`/treinos/${published.id}`);
    } catch {
      setSavedNotice(false);
    }
  }

  function addDay() {
    if (days.length >= 12) return;
    const codes = "ABCDEFGHIJKL";
    const code = [...codes].find((item) => !days.some((day) => day.code === item));
    if (!code) return;
    changeDays((current) => [...current, emptyDay(code, `Treino ${code}`)]);
    setActiveDay(code);
  }

  function removeDay(code: string) {
    const nextDays = days.filter((day) => day.code !== code);
    changeDays(() => nextDays);
    if (activeDay === code) setActiveDay(nextDays[0]?.code ?? "");
  }

  function addExercise(exercise: ExerciseCatalogItem) {
    if (!currentDay || currentDay.exercises.length >= 30) return;
    changeDays((current) =>
      current.map((day) =>
        day.code !== currentDay.code
          ? day
          : {
              ...day,
              exercises: [
                ...day.exercises,
                {
                  localId: crypto.randomUUID(),
                  exerciseId: exercise.id,
                  exerciseName: exercise.name,
                  supersetGroup: null,
                  sets: [emptySet()],
                },
              ],
            },
      ),
    );
  }

  function updateExercise(
    localId: string,
    update: (exercise: EditorExercise) => EditorExercise,
  ) {
    if (!currentDay) return;
    changeDays((current) =>
      current.map((day) =>
        day.code !== currentDay.code
          ? day
          : {
              ...day,
              exercises: day.exercises.map((exercise) =>
                exercise.localId === localId ? update(exercise) : exercise,
              ),
            },
      ),
    );
  }

  function removeExercise(localId: string) {
    if (!currentDay) return;
    changeDays((current) =>
      current.map((day) =>
        day.code !== currentDay.code
          ? day
          : {
              ...day,
              exercises: day.exercises.filter((exercise) => exercise.localId !== localId),
            },
      ),
    );
  }

  function toggleSuperset(index: number) {
    if (!currentDay || index >= currentDay.exercises.length - 1) return;
    const first = currentDay.exercises[index];
    const second = currentDay.exercises[index + 1];
    const isPair = first.supersetGroup && first.supersetGroup === second.supersetGroup;
    const group = isPair ? null : `SS${index + 1}`;
    changeDays((current) =>
      current.map((day) =>
        day.code !== currentDay.code
          ? day
          : {
              ...day,
              exercises: day.exercises.map((exercise) =>
                exercise.localId === first.localId || exercise.localId === second.localId
                  ? { ...exercise, supersetGroup: group }
                  : exercise,
              ),
            },
      ),
    );
  }

  function updateDayName(value: string) {
    if (!currentDay) return;
    changeDays((current) =>
      current.map((day) =>
        day.code === currentDay.code ? { ...day, name: value } : day,
      ),
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
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="size-11 shrink-0 px-0"
            aria-label="Voltar aos treinos"
          >
            <Link
              href={
                studentId
                  ? `/treinos?studentId=${encodeURIComponent(studentId)}`
                  : "/treinos"
              }
            >
              <IconArrowLeft aria-hidden="true" size={18} />
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-sm text-ink-secondary">
              {plan ? "Editar rascunho" : "Novo plano de treino"}
            </p>
            <h1 className="truncate font-[var(--font-syne)] text-xl font-extrabold text-ink-primary sm:text-2xl">
              {name || "Treino sem título"}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {plan ? (
            <Button asChild variant="outline">
              <Link href={`/treinos?studentId=${plan.studentProfileId}`}>
                Cancelar edição
              </Link>
            </Button>
          ) : null}
          <Button
            type="submit"
            variant="outline"
            disabled={
              saveMutation.isPending ||
              publishMutation.isPending ||
              !studentId ||
              !name.trim()
            }
          >
            <IconDeviceFloppy aria-hidden="true" size={17} />
            {saveMutation.isPending ? "Salvando…" : "Salvar rascunho"}
          </Button>
          <Button
            type="button"
            disabled={!canPublish || saveMutation.isPending || publishMutation.isPending}
            onClick={() => void publish()}
          >
            <IconSend aria-hidden="true" size={17} />
            {publishMutation.isPending ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </div>

      {saveMutation.isError || publishMutation.isError ? (
        <section
          role="alert"
          className="rounded-lg border border-danger-text/30 bg-surface p-4"
        >
          <h2 className="font-semibold text-ink-primary">
            Não foi possível concluir esta ação
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">
            {getErrorMessage(saveMutation.error ?? publishMutation.error)}
          </p>
          <p className="mt-2 text-xs text-ink-tertiary">
            Se o problema persistir, confira sua conexão e tente novamente.
          </p>
        </section>
      ) : null}
      {savedNotice ? (
        <p
          role="status"
          className="rounded-lg border border-brand-400/30 bg-success-bg p-3 text-sm text-success-text"
        >
          {plan?.status === "PUBLISHED" ? "Plano publicado." : "Rascunho salvo."}
        </p>
      ) : null}

      <div className="grid items-start gap-4 xl:grid-cols-[17.5rem_minmax(22rem,1fr)_18rem]">
        <aside className="space-y-4 rounded-xl border border-border bg-surface p-4">
          <div>
            <h2 className="font-[var(--font-syne)] text-lg font-bold">Configurar</h2>
            <label className="mt-4 block space-y-2 text-sm font-semibold text-ink-primary">
              <span>Aluno</span>
              <select
                aria-label="Aluno do plano"
                className={`${inputClass} w-full`}
                value={studentId}
                disabled={Boolean(plan)}
                onChange={(event) => setStudentId(event.currentTarget.value)}
              >
                <option value="">Selecione um aluno</option>
                {studentItems.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} · {student.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </option>
                ))}
              </select>
            </label>
            {selectedStudent ? (
              <p className="mt-2 truncate text-xs text-ink-secondary">
                {selectedStudent.email}
              </p>
            ) : null}
            <label
              htmlFor="training-plan-name"
              className="mt-4 block space-y-2 text-sm font-semibold text-ink-primary"
            >
              <span>Nome do plano</span>
              <Input
                id="training-plan-name"
                value={name}
                maxLength={120}
                required
                onChange={(event) => setName(event.currentTarget.value)}
                placeholder="Ex.: Hipertrofia — Fase 1"
              />
            </label>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink-primary">Dias de treino</h3>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={days.length >= 12}
                  onClick={addDay}
                >
                  <IconPlus aria-hidden="true" size={17} />
                  Adicionar dia
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <span className="inline-flex items-center" key={day.localId}>
                    <button
                      type="button"
                      aria-pressed={activeDay === day.code}
                      className={`min-h-11 rounded-l-lg border px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-brand-400 ${activeDay === day.code ? "border-brand-400 bg-brand-400/10 text-ink-brand" : "border-border text-ink-secondary hover:bg-hover"}`}
                      onClick={() => setActiveDay(day.code)}
                    >
                      {day.code}
                    </button>
                    <button
                      type="button"
                      aria-label={`Remover dia ${day.code}`}
                      className={`min-h-11 rounded-r-lg border border-l-0 px-2 focus-visible:outline-2 focus-visible:outline-brand-400 ${activeDay === day.code ? "border-brand-400 bg-brand-400/10 text-ink-brand" : "border-border text-ink-secondary hover:bg-hover"}`}
                      onClick={() => removeDay(day.code)}
                    >
                      <IconTrash aria-hidden="true" size={14} />
                    </button>
                  </span>
                ))}
                {days.length === 0 ? (
                  <p className="text-xs text-ink-tertiary">
                    Adicione um dia para começar.
                  </p>
                ) : null}
              </div>
            </div>
            {currentDay ? (
              <label
                htmlFor="training-day-name"
                className="mt-4 block space-y-2 text-sm font-semibold text-ink-primary"
              >
                <span>Nome do dia {currentDay.code}</span>
                <Input
                  id="training-day-name"
                  value={currentDay.name}
                  maxLength={120}
                  onChange={(event) => updateDayName(event.currentTarget.value)}
                />
              </label>
            ) : null}
            <label className="mt-4 block space-y-2 text-sm font-semibold text-ink-primary">
              <span>Observações</span>
              <textarea
                className="min-h-28 w-full rounded-lg border border-border bg-page px-3 py-2 text-sm text-ink-primary placeholder:text-ink-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                value={notes}
                maxLength={2000}
                placeholder="Orientações para este plano…"
                onChange={(event) => setNotes(event.currentTarget.value)}
              />
            </label>
          </div>
          <fieldset className="grid min-w-0 grid-cols-2 gap-2">
            <legend className="sr-only">Resumo do plano</legend>
            <Summary label="Exercícios" value={exerciseCount} />
            <Summary label="Séries" value={setCount} />
            <Summary label="Dias" value={days.length} />
            <Summary
              label="Status"
              value={plan?.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
            />
          </fieldset>
          <p className="text-xs text-ink-tertiary">
            Salvar mantém o plano privado como rascunho. Publicar libera a versão atual
            para o aluno selecionado.
          </p>
        </aside>

        <section className="min-w-0 space-y-4" aria-label="Editor do plano">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-brand">
                {currentDay ? `Treino ${currentDay.code}` : "Plano"}
              </p>
              <h2 className="mt-1 truncate font-[var(--font-syne)] text-xl font-bold">
                {currentDay?.name ?? "Adicione o primeiro dia"}
              </h2>
            </div>
            <span className="text-sm text-ink-secondary">
              {currentDay?.exercises.length ?? 0} exercícios
            </span>
          </div>
          {currentDay && currentDay.exercises.length > 0 ? (
            currentDay.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.localId}
                exercise={exercise}
                index={index}
                total={currentDay.exercises.length}
                onRemove={() => removeExercise(exercise.localId)}
                onAddSet={() =>
                  updateExercise(exercise.localId, (item) =>
                    item.sets.length >= 20
                      ? item
                      : { ...item, sets: [...item.sets, emptySet()] },
                  )
                }
                onUpdateSet={(setIndex, value) =>
                  updateExercise(exercise.localId, (item) => ({
                    ...item,
                    sets: item.sets.map((set, position) =>
                      position === setIndex ? { ...set, ...value } : set,
                    ),
                  }))
                }
                onRemoveSet={(setIndex) =>
                  updateExercise(exercise.localId, (item) => ({
                    ...item,
                    sets: item.sets.filter((_, position) => position !== setIndex),
                  }))
                }
                onToggleSuperset={() => toggleSuperset(index)}
              />
            ))
          ) : (
            <section className="rounded-xl border border-dashed border-border bg-surface p-7 text-center">
              <IconBarbell
                aria-hidden="true"
                className="mx-auto text-ink-brand"
                size={30}
              />
              <h3 className="mt-3 font-semibold text-ink-primary">
                Adicione exercícios a este dia
              </h3>
              <p className="mt-1 text-sm text-ink-secondary">
                Escolha movimentos da biblioteca. As séries e os alvos ficam editáveis
                abaixo.
              </p>
            </section>
          )}
        </section>

        <aside className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="space-y-3 border-b border-border p-4">
            <div>
              <h2 className="font-[var(--font-syne)] text-lg font-bold">Biblioteca</h2>
              <p className="mt-1 text-xs text-ink-secondary">
                Catálogo oficial e exercícios do seu espaço.
              </p>
            </div>
            <div className="relative block">
              <label htmlFor="exercise-search" className="sr-only">
                Buscar exercício
              </label>
              <IconSearch
                aria-hidden="true"
                className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-tertiary"
                size={17}
              />
              <Input
                id="exercise-search"
                aria-label="Buscar exercício"
                className="pl-10"
                value={exerciseSearch}
                onChange={(event) => setExerciseSearch(event.currentTarget.value)}
                placeholder="Buscar exercício…"
              />
            </div>
          </div>
          {exercises.isPending ? (
            <p role="status" className="p-4 text-sm text-ink-secondary">
              Carregando exercícios…
            </p>
          ) : null}
          {exercises.isError ? (
            <div role="alert" className="p-4 text-sm">
              <p className="text-ink-primary">Não foi possível carregar o catálogo.</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => void exercises.refetch()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : null}
          {exercises.data ? (
            exercises.data.items.length > 0 ? (
              <ul className="max-h-[40rem] divide-y divide-border overflow-y-auto">
                {exercises.data.items.map((exercise) => (
                  <li key={exercise.id} className="flex items-center gap-3 p-3">
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-lg border border-brand-400/20 bg-brand-400/10 text-ink-brand"
                    >
                      <IconBarbell size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink-primary">
                        {exercise.name}
                      </span>
                      <span className="mt-1 block truncate text-xs text-ink-tertiary">
                        {exercise.primaryMuscleGroups
                          .map((group) => group.name)
                          .join(" · ") || modalityLabel(exercise.modality)}
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="size-11 shrink-0 px-0 text-ink-brand"
                      aria-label={`Adicionar ${exercise.name}`}
                      disabled={!currentDay || currentDay.exercises.length >= 30}
                      onClick={() => addExercise(exercise)}
                    >
                      <IconPlus aria-hidden="true" size={19} />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-sm text-ink-secondary">
                Nenhum exercício encontrado. Ajuste a busca ou cadastre um exercício no
                catálogo.
              </p>
            )
          ) : null}
          {exercises.data && exercises.data.totalCount > exercises.data.items.length ? (
            <p className="border-t border-border p-3 text-xs text-ink-tertiary">
              Mostrando {exercises.data.items.length} de {exercises.data.totalCount}.
              Refine a busca para encontrar outros movimentos.
            </p>
          ) : null}
        </aside>
      </div>
    </form>
  );
}

function ExerciseCard({
  exercise,
  index,
  total,
  onRemove,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onToggleSuperset,
}: {
  exercise: EditorExercise;
  index: number;
  total: number;
  onRemove: () => void;
  onAddSet: () => void;
  onUpdateSet: (index: number, value: Partial<Omit<EditorSet, "localId">>) => void;
  onRemoveSet: (index: number) => void;
  onToggleSuperset: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface">
      <header className="flex flex-wrap items-center gap-3 p-4">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-brand-400/25 bg-brand-400/10 text-xs font-bold text-ink-brand"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink-primary">
            {exercise.exerciseName}
          </span>
          <span className="mt-1 block text-xs text-ink-secondary">
            {exercise.sets.length} {exercise.sets.length === 1 ? "série" : "séries"}
            {exercise.supersetGroup ? ` · Superset ${exercise.supersetGroup}` : ""}
          </span>
        </span>
        {index < total - 1 ? (
          <Button type="button" variant="outline" onClick={onToggleSuperset}>
            {exercise.supersetGroup ? "Desfazer superset" : "Superset com próximo"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="size-11 shrink-0 px-0 text-danger-text"
          aria-label={`Remover ${exercise.exerciseName}`}
          onClick={onRemove}
        >
          <IconTrash aria-hidden="true" size={17} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="size-11 shrink-0 px-0"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Recolher" : "Editar"}
        </Button>
      </header>
      {expanded ? (
        <div className="space-y-3 border-t border-border p-4">
          <div className="hidden grid-cols-[3rem_repeat(4,minmax(4rem,1fr))_2.75rem] gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-ink-tertiary sm:grid">
            <span>Série</span>
            <span>Repetições</span>
            <span>Carga (kg)</span>
            <span>Duração (s)</span>
            <span>Descanso (s)</span>
            <span />
          </div>
          {exercise.sets.map((set, setIndex) => (
            <div
              className="grid grid-cols-2 gap-2 rounded-lg border border-border-muted bg-page p-3 sm:grid-cols-[3rem_repeat(4,minmax(4rem,1fr))_2.75rem] sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
              key={set.localId}
            >
              <span className="col-span-2 flex items-center justify-between text-xs font-semibold text-ink-secondary sm:col-span-1 sm:justify-center">
                Série {setIndex + 1}
                <Button
                  type="button"
                  variant="ghost"
                  className="size-9 px-0 text-danger-text sm:hidden"
                  aria-label={`Remover série ${setIndex + 1}`}
                  onClick={() => onRemoveSet(setIndex)}
                >
                  <IconTrash aria-hidden="true" size={15} />
                </Button>
              </span>
              <NumberField
                label={`Repetições da série ${setIndex + 1}`}
                compactLabel="Repetições"
                value={set.targetRepetitions}
                min={1}
                max={100}
                onChange={(value) =>
                  onUpdateSet(setIndex, {
                    targetRepetitions: value,
                    targetDurationSeconds:
                      value === null ? set.targetDurationSeconds : null,
                    loadKg: value === null ? null : set.loadKg,
                  })
                }
              />
              <NumberField
                label={`Carga em kg da série ${setIndex + 1}`}
                compactLabel="Carga (kg)"
                value={set.loadKg}
                min={0}
                max={9999.99}
                step="0.01"
                onChange={(value) => onUpdateSet(setIndex, { loadKg: value })}
              />
              <NumberField
                label={`Duração em segundos da série ${setIndex + 1}`}
                compactLabel="Duração (s)"
                value={set.targetDurationSeconds}
                min={1}
                max={7200}
                onChange={(value) =>
                  onUpdateSet(setIndex, {
                    targetDurationSeconds: value,
                    targetRepetitions: value === null ? set.targetRepetitions : null,
                    loadKg: value === null ? set.loadKg : null,
                  })
                }
              />
              <NumberField
                label={`Descanso em segundos da série ${setIndex + 1}`}
                compactLabel="Descanso (s)"
                value={set.restSeconds}
                min={0}
                max={3600}
                onChange={(value) => onUpdateSet(setIndex, { restSeconds: value ?? 0 })}
              />
              <Button
                type="button"
                variant="ghost"
                className="hidden size-11 px-0 text-danger-text sm:inline-flex"
                aria-label={`Remover série ${setIndex + 1}`}
                onClick={() => onRemoveSet(setIndex)}
              >
                <IconTrash aria-hidden="true" size={15} />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            disabled={exercise.sets.length >= 20}
            onClick={onAddSet}
          >
            <IconPlus aria-hidden="true" size={17} />
            Adicionar série
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function NumberField({
  label,
  compactLabel,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  compactLabel: string;
  value: number | null;
  min: number;
  max: number;
  step?: string;
  onChange: (value: number | null) => void;
}) {
  const inputId = `training-set-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <label
      htmlFor={inputId}
      className="block space-y-1 text-[11px] text-ink-secondary sm:space-y-0"
    >
      <span className="sm:sr-only">{label}</span>
      <span className="sm:hidden">{compactLabel}</span>
      <Input
        id={inputId}
        aria-label={label}
        className="min-h-11 px-2 text-center text-sm"
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step ?? 1}
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            event.currentTarget.value === "" ? null : Number(event.currentTarget.value),
          )
        }
      />
    </label>
  );
}

function Summary({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border-muted bg-page p-3">
      <span className="block text-lg font-bold text-ink-brand">{value}</span>
      <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-tertiary">
        {label}
      </span>
    </div>
  );
}

function BuilderLoading() {
  return (
    <div
      role="status"
      aria-label="Carregando treino"
      className="grid gap-4 xl:grid-cols-3"
    >
      <Skeleton className="h-[28rem]" />
      <Skeleton className="h-[28rem]" />
      <Skeleton className="h-[28rem]" />
    </div>
  );
}

function BuilderError({
  title,
  detail,
  retry,
}: {
  title: string;
  detail: string;
  retry?: () => void;
}) {
  const router = useRouter();
  const isUnauthenticated = detail.startsWith("Sessão encerrada.");
  return (
    <section
      role="alert"
      className="mx-auto max-w-3xl rounded-xl border border-border bg-surface p-6"
    >
      <h1 className="font-[var(--font-syne)] text-2xl font-extrabold text-ink-primary">
        {title}
      </h1>
      <p className="mt-2 text-sm text-ink-secondary">{detail}</p>
      {isUnauthenticated ? (
        <Button className="mt-4" asChild>
          <Link href="/acesso?perfil=personal">Entrar novamente</Link>
        </Button>
      ) : retry ? (
        <Button className="mt-4" variant="outline" onClick={retry}>
          Tentar novamente
        </Button>
      ) : null}
      <Button
        className="mt-4 ml-2"
        variant="ghost"
        onClick={() => router.push("/treinos")}
      >
        Voltar aos treinos
      </Button>
    </section>
  );
}

function emptySet(): EditorSet {
  return {
    localId: crypto.randomUUID(),
    targetRepetitions: null,
    loadKg: null,
    restSeconds: 60,
    targetDurationSeconds: null,
  };
}

function emptyDay(code: string, name: string): EditorDay {
  return { localId: crypto.randomUUID(), code, name, exercises: [] };
}

function editorDaysFromPlan(planDays: TrainingPlanDay[]): EditorDay[] {
  return planDays.map((day) => ({
    localId: day.id,
    code: day.code,
    name: day.name,
    exercises: day.exercises.map((exercise) => ({
      localId: exercise.id,
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName ?? "Exercício do catálogo",
      supersetGroup: exercise.supersetGroup,
      sets: exercise.sets.map((set) => ({
        localId: set.id,
        targetRepetitions: set.targetRepetitions,
        loadKg: set.loadKg,
        restSeconds: set.restSeconds,
        targetDurationSeconds: set.targetDurationSeconds,
      })),
    })),
  }));
}

function draftFromPlan(plan: TrainingPlanResponse): TrainingPlanDraftInput {
  return createDraft(plan.name, plan.notes ?? "", editorDaysFromPlan(plan.days));
}

function createDraft(
  name: string,
  notes: string,
  days: EditorDay[],
): TrainingPlanDraftInput {
  return {
    name: name.trim(),
    notes: notes.trim() || null,
    days: days.map((day, dayIndex) => ({
      code: day.code,
      name: day.name.trim(),
      position: dayIndex + 1,
      exercises: day.exercises.map((exercise, exerciseIndex) => ({
        exerciseId: exercise.exerciseId,
        position: exerciseIndex + 1,
        supersetGroup: exercise.supersetGroup,
        sets: exercise.sets.map(
          (set, setIndex): TrainingPlanSetInput => ({
            number: setIndex + 1,
            targetRepetitions: set.targetRepetitions,
            loadKg: set.loadKg,
            restSeconds: set.restSeconds,
            targetDurationSeconds: set.targetDurationSeconds,
          }),
        ),
      })),
    })),
  };
}

function getErrorMessage(error: Error | null | undefined) {
  if (!error) return "Tente novamente.";
  if (error instanceof NodusApiError) {
    if (error.status === 401) return "Sessão encerrada. Entre novamente para continuar.";
    return `${error.message}${error.code ? ` · ${error.code}` : ""}`;
  }
  return error.message || "Tente novamente.";
}

function modalityLabel(modality: ExerciseCatalogItem["modality"]) {
  return modality === "STRENGTH"
    ? "Força"
    : modality === "CARDIO"
      ? "Cardio"
      : "Mobilidade";
}
