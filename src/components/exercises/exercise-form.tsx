"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type RefObject, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  archiveExerciseMutationOptions,
  createExerciseMutationOptions,
  exerciseDetailQueryOptions,
  exerciseOptionsQueryOptions,
  updateExerciseMutationOptions,
} from "@/features/exercises/exercises-api";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { NodusApiError } from "@/lib/api/nodus-api-client";
import type {
  ExerciseCatalogDetail,
  ExerciseCatalogOptions,
  ExerciseEditableInput,
  ExerciseModality,
} from "@/lib/contracts/exercises";
import { ExerciseLoading, ExerciseQueryError } from "./exercise-query-state";

const EMPTY_EXERCISE_ID = "00000000-0000-4000-8000-000000000000";
const NAME_MAX_LENGTH = 120;
const INSTRUCTIONS_MAX_LENGTH = 2_000;

const modalityLabels: Record<ExerciseModality, string> = {
  STRENGTH: "Força",
  CARDIO: "Cardio",
  MOBILITY: "Mobilidade",
};

type ExerciseFormProps = {
  exerciseId?: string;
  initialAnnouncement?: string;
};

export function ExerciseForm({ exerciseId, initialAnnouncement }: ExerciseFormProps) {
  const router = useRouter();
  const isCreate = exerciseId === undefined;
  const optionsQuery = useQuery(exerciseOptionsQueryOptions());
  const detailQuery = useQuery({
    ...exerciseDetailQueryOptions(exerciseId ?? EMPTY_EXERCISE_ID),
    enabled: !isCreate,
  });
  const [announcement, setAnnouncement] = useState<string | null>(
    initialAnnouncement ?? null,
  );

  useMountEffect(() => {
    if (exerciseId && initialAnnouncement) {
      router.replace(`/exercicios/${exerciseId}`, { scroll: false });
    }
  });

  const readOnly =
    detailQuery.data !== undefined &&
    (detailQuery.data.ownerPersonalId === null || detailQuery.data.status === "ARCHIVED");
  const loading =
    (!isCreate && detailQuery.isPending) || (!readOnly && optionsQuery.isPending);
  const error =
    (!isCreate ? detailQuery.error : null) ?? (!readOnly ? optionsQuery.error : null);

  function retry() {
    void optionsQuery.refetch();
    if (!isCreate) void detailQuery.refetch();
  }

  return (
    <div className="space-y-5">
      <Button variant="outline" asChild>
        <Link href="/exercicios">Voltar para exercícios</Link>
      </Button>

      {announcement ? (
        <p
          role="status"
          aria-live="polite"
          className="rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-success-text"
        >
          {announcement}
        </p>
      ) : null}

      {loading ? (
        <ExerciseLoading detail />
      ) : error ? (
        <ExerciseQueryError detail error={error} retry={retry} />
      ) : readOnly && detailQuery.data ? (
        <ReadOnlyExercise exercise={detailQuery.data} />
      ) : isCreate && optionsQuery.data ? (
        <ExerciseEditor
          key="create"
          options={optionsQuery.data}
          onAnnouncement={setAnnouncement}
        />
      ) : detailQuery.data && optionsQuery.data ? (
        <ExerciseEditor
          key={`${detailQuery.data.id}:${detailQuery.data.version}`}
          exercise={detailQuery.data}
          options={optionsQuery.data}
          onAnnouncement={setAnnouncement}
        />
      ) : null}
    </div>
  );
}

type ExerciseEditorProps = {
  exercise?: ExerciseCatalogDetail;
  options: ExerciseCatalogOptions;
  onAnnouncement: (message: string) => void;
};

type FieldErrors = {
  name?: string;
  instructions?: string;
  modality?: string;
  equipment?: string;
  muscles?: string;
};

function ExerciseEditor({ exercise, options, onAnnouncement }: ExerciseEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ExerciseEditableInput>(() =>
    exerciseToDraft(exercise),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [archiveError, setArchiveError] = useState<Error | null>(null);
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [clientEntityId] = useState(() =>
    exercise ? null : globalThis.crypto.randomUUID(),
  );
  const operationId = useRef<string | null>(null);
  const archiveOperationId = useRef<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const archiveTriggerRef = useRef<HTMLButtonElement>(null);

  const createMutation = useMutation(createExerciseMutationOptions(queryClient));
  const updateMutation = useMutation(
    updateExerciseMutationOptions(queryClient, exercise?.id ?? EMPTY_EXERCISE_ID),
  );
  const archiveMutation = useMutation(
    archiveExerciseMutationOptions(queryClient, exercise?.id ?? EMPTY_EXERCISE_ID),
  );
  const submitting = createMutation.isPending || updateMutation.isPending;

  function updateDraft(
    change: (current: ExerciseEditableInput) => ExerciseEditableInput,
  ) {
    operationId.current = null;
    setSubmitError(null);
    setFieldErrors({});
    setDraft(change);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    const errors = validateDraft(draft);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      if (errors.name) nameRef.current?.focus();
      return;
    }

    const editable = normalizedDraft(draft);
    operationId.current ??= globalThis.crypto.randomUUID();
    try {
      if (!exercise) {
        const response = await createMutation.mutateAsync({
          ...editable,
          operationId: operationId.current,
          clientEntityId: clientEntityId ?? globalThis.crypto.randomUUID(),
        });
        onAnnouncement("Exercício criado com sucesso.");
        router.replace(`/exercicios/${response.id}?saved=created`);
        return;
      }

      await updateMutation.mutateAsync({
        ...editable,
        operationId: operationId.current,
        expectedVersion: exercise.version,
      });
      operationId.current = null;
      onAnnouncement("Exercício atualizado com sucesso.");
    } catch (error) {
      const normalized = asError(error);
      setSubmitError(normalized);
      setFieldErrors(fieldErrorsFromApi(normalized));
    }
  }

  async function archive() {
    if (!exercise) return;
    setArchiveError(null);
    archiveOperationId.current ??= globalThis.crypto.randomUUID();
    try {
      await archiveMutation.mutateAsync({
        operationId: archiveOperationId.current,
        expectedVersion: exercise.version,
      });
      archiveOperationId.current = null;
      setConfirmingArchive(false);
      onAnnouncement("Exercício arquivado com sucesso.");
    } catch (error) {
      setArchiveError(asError(error));
    }
  }

  function cancelArchive() {
    setConfirmingArchive(false);
    setArchiveError(null);
    archiveTriggerRef.current?.focus();
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold text-ink-brand">
          {exercise ? "Meu exercício" : "Catálogo personalizado"}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink-primary">
          {exercise ? "Editar exercício" : "Novo exercício"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
          {exercise
            ? "Atualize as informações usadas na montagem dos treinos."
            : "Cadastre um exercício próprio para reutilizá-lo nos seus treinos."}
        </p>
      </header>

      <form noValidate onSubmit={submit} className="space-y-5">
        <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="exercise-name"
                className="text-sm font-semibold text-ink-primary"
              >
                Nome do exercício
              </label>
              <Input
                ref={nameRef}
                id="exercise-name"
                className="mt-2"
                value={draft.name}
                maxLength={NAME_MAX_LENGTH}
                required
                aria-invalid={fieldErrors.name ? true : undefined}
                aria-describedby={fieldErrors.name ? "exercise-name-error" : undefined}
                onChange={(event) =>
                  updateDraft((current) => ({ ...current, name: event.target.value }))
                }
              />
              <FieldError id="exercise-name-error" message={fieldErrors.name} />
            </div>

            <div>
              <label
                htmlFor="exercise-modality"
                className="text-sm font-semibold text-ink-primary"
              >
                Modalidade
              </label>
              <select
                id="exercise-modality"
                value={draft.modality}
                aria-invalid={fieldErrors.modality ? true : undefined}
                aria-describedby={
                  fieldErrors.modality ? "exercise-modality-error" : undefined
                }
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    modality: event.target.value as ExerciseModality,
                  }))
                }
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 aria-invalid:border-danger"
              >
                {Object.entries(modalityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <FieldError id="exercise-modality-error" message={fieldErrors.modality} />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="exercise-instructions"
                className="text-sm font-semibold text-ink-primary"
              >
                Instruções
              </label>
              <textarea
                id="exercise-instructions"
                value={draft.instructions ?? ""}
                rows={5}
                maxLength={INSTRUCTIONS_MAX_LENGTH}
                aria-invalid={fieldErrors.instructions ? true : undefined}
                aria-describedby={
                  fieldErrors.instructions
                    ? "exercise-instructions-error"
                    : "exercise-instructions-help"
                }
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    instructions: event.target.value,
                  }))
                }
                className="mt-2 min-h-32 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-base text-ink-primary placeholder:text-ink-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 aria-invalid:border-danger"
              />
              <p
                id="exercise-instructions-help"
                className="mt-1 text-xs text-ink-secondary"
              >
                Opcional. Até {INSTRUCTIONS_MAX_LENGTH.toLocaleString("pt-BR")}{" "}
                caracteres.
              </p>
              <FieldError
                id="exercise-instructions-error"
                message={fieldErrors.instructions}
              />
            </div>
          </div>
        </section>

        <OptionChecklist
          legend="Equipamentos"
          description="Selecione tudo o que é necessário para executar o exercício."
          options={options.equipment}
          selected={draft.equipmentIds}
          error={fieldErrors.equipment}
          labelFor={(name) => `Selecionar ${name}`}
          onChange={(id, selected) =>
            updateDraft((current) => ({
              ...current,
              equipmentIds: toggleId(current.equipmentIds, id, selected),
            }))
          }
        />

        <fieldset
          aria-describedby={fieldErrors.muscles ? "exercise-muscles-error" : undefined}
          className="rounded-lg border border-border bg-surface p-5 sm:p-6"
        >
          <legend className="px-1 text-base font-bold text-ink-primary">
            Grupos musculares
          </legend>
          <p className="mt-1 text-sm text-ink-secondary">
            Um grupo não pode ser principal e secundário ao mesmo tempo.
          </p>
          <ul className="mt-4 divide-y divide-border-muted">
            {options.muscleGroups.map((option) => {
              const primary = draft.primaryMuscleGroupIds.includes(option.id);
              const secondary = draft.secondaryMuscleGroupIds.includes(option.id);
              return (
                <li
                  key={option.id}
                  className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4"
                >
                  <span className="font-medium text-ink-primary">{option.name}</span>
                  <CheckLabel
                    label={`${option.name} como grupo principal`}
                    text="Principal"
                    checked={primary}
                    disabled={secondary}
                    onChange={(selected) =>
                      updateDraft((current) => ({
                        ...current,
                        primaryMuscleGroupIds: toggleId(
                          current.primaryMuscleGroupIds,
                          option.id,
                          selected,
                        ),
                      }))
                    }
                  />
                  <CheckLabel
                    label={`${option.name} como grupo secundário`}
                    text="Secundário"
                    checked={secondary}
                    disabled={primary}
                    onChange={(selected) =>
                      updateDraft((current) => ({
                        ...current,
                        secondaryMuscleGroupIds: toggleId(
                          current.secondaryMuscleGroupIds,
                          option.id,
                          selected,
                        ),
                      }))
                    }
                  />
                </li>
              );
            })}
          </ul>
          <FieldError id="exercise-muscles-error" message={fieldErrors.muscles} />
        </fieldset>

        {submitError ? <MutationErrorAlert error={submitError} /> : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild>
            <Link href="/exercicios">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Salvando..."
              : exercise
                ? "Salvar alterações"
                : "Criar exercício"}
          </Button>
        </div>
      </form>

      {exercise ? (
        <ArchiveSection
          triggerRef={archiveTriggerRef}
          confirming={confirmingArchive}
          pending={archiveMutation.isPending}
          error={archiveError}
          onOpen={() => {
            setArchiveError(null);
            setConfirmingArchive(true);
          }}
          onCancel={cancelArchive}
          onConfirm={() => {
            void archive();
          }}
        />
      ) : null}
    </div>
  );
}

function ArchiveSection({
  triggerRef,
  confirming,
  pending,
  error,
  onOpen,
  onCancel,
  onConfirm,
}: {
  triggerRef: RefObject<HTMLButtonElement | null>;
  confirming: boolean;
  pending: boolean;
  error: Error | null;
  onOpen: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-base font-bold text-ink-primary">Arquivar exercício</h2>
      <p className="mt-1 text-sm text-ink-secondary">
        O histórico será preservado e o exercício sairá do catálogo ativo.
      </p>
      <Button
        ref={triggerRef}
        variant="destructive"
        className="mt-4"
        aria-expanded={confirming}
        aria-controls="archive-exercise-confirmation"
        aria-disabled={confirming}
        onClick={() => {
          if (!confirming) onOpen();
        }}
      >
        Arquivar exercício
      </Button>
      {confirming ? (
        <div
          id="archive-exercise-confirmation"
          role="alertdialog"
          aria-modal="false"
          aria-labelledby="archive-exercise-title"
          aria-describedby="archive-exercise-description"
          className="mt-4 rounded-lg border border-border bg-elevated p-4"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !pending) onCancel();
          }}
        >
          <h3 id="archive-exercise-title" className="font-bold text-ink-primary">
            Confirmar arquivamento?
          </h3>
          <p
            id="archive-exercise-description"
            className="mt-1 text-sm text-ink-secondary"
          >
            O exercício deixará de aparecer no catálogo ativo.
          </p>
          {error ? <MutationErrorAlert error={error} compact /> : null}
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button autoFocus variant="outline" disabled={pending} onClick={onCancel}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={pending} onClick={onConfirm}>
              {pending ? "Arquivando..." : "Confirmar arquivamento"}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function OptionChecklist({
  legend,
  description,
  options,
  selected,
  error,
  labelFor,
  onChange,
}: {
  legend: string;
  description: string;
  options: ExerciseCatalogOptions["equipment"];
  selected: string[];
  error?: string;
  labelFor: (name: string) => string;
  onChange: (id: string, selected: boolean) => void;
}) {
  return (
    <fieldset
      aria-describedby={error ? "exercise-equipment-error" : undefined}
      className="rounded-lg border border-border bg-surface p-5 sm:p-6"
    >
      <legend className="px-1 text-base font-bold text-ink-primary">{legend}</legend>
      <p className="mt-1 text-sm text-ink-secondary">{description}</p>
      {options.length === 0 ? (
        <p className="mt-4 text-sm text-ink-secondary">Nenhuma opção disponível.</p>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <CheckLabel
              key={option.id}
              label={labelFor(option.name)}
              text={option.name}
              checked={selected.includes(option.id)}
              onChange={(checked) => onChange(option.id, checked)}
            />
          ))}
        </div>
      )}
      <FieldError id="exercise-equipment-error" message={error} />
    </fieldset>
  );
}

function CheckLabel({
  label,
  text,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  text: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm text-ink-primary hover:bg-hover has-disabled:cursor-not-allowed has-disabled:opacity-50">
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 shrink-0 accent-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
      />
      <span>{text}</span>
    </label>
  );
}

function ReadOnlyExercise({ exercise }: { exercise: ExerciseCatalogDetail }) {
  const isSystem = exercise.ownerPersonalId === null;
  return (
    <article className="rounded-lg border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          {isSystem ? "Exercício do sistema" : "Meu exercício"}
        </Badge>
        <Badge variant={exercise.status === "ACTIVE" ? "success" : "warning"}>
          {exercise.status === "ACTIVE" ? "Ativo" : "Arquivado"}
        </Badge>
      </div>
      <h1 className="mt-3 break-words text-2xl font-bold text-ink-primary">
        {exercise.name}
      </h1>
      <p className="mt-2 text-sm text-ink-secondary">
        {isSystem
          ? "Este item é mantido pelo sistema e está disponível somente para visualização."
          : "Este exercício foi arquivado e está disponível somente para visualização."}
      </p>
      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <Detail label="Modalidade" value={modalityLabels[exercise.modality]} />
        <Detail label="Equipamentos" value={joinOptionNames(exercise.equipment)} />
        <Detail
          label="Grupos principais"
          value={joinOptionNames(exercise.primaryMuscleGroups)}
        />
        <Detail
          label="Grupos secundários"
          value={joinOptionNames(exercise.secondaryMuscleGroups)}
        />
        <div className="sm:col-span-2">
          <Detail label="Instruções" value={exercise.instructions ?? "Não informadas"} />
        </div>
      </dl>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-ink-primary">
        {value}
      </dd>
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm font-medium text-danger-text">
      {message}
    </p>
  );
}

function MutationErrorAlert({
  error,
  compact = false,
}: {
  error: Error;
  compact?: boolean;
}) {
  const presentation = mutationErrorPresentation(error);
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`${compact ? "mt-4" : ""} rounded-lg border border-border bg-danger-bg p-4 text-sm text-danger-text`}
    >
      <p className="font-semibold">{presentation.message}</p>
      {presentation.meta ? (
        <p className="mt-1 break-all text-xs">{presentation.meta}</p>
      ) : null}
    </div>
  );
}

function exerciseToDraft(exercise?: ExerciseCatalogDetail): ExerciseEditableInput {
  return {
    name: exercise?.name ?? "",
    instructions: exercise?.instructions ?? "",
    modality: exercise?.modality ?? "STRENGTH",
    equipmentIds: exercise?.equipment.map((item) => item.id) ?? [],
    primaryMuscleGroupIds: exercise?.primaryMuscleGroups.map((item) => item.id) ?? [],
    secondaryMuscleGroupIds: exercise?.secondaryMuscleGroups.map((item) => item.id) ?? [],
  };
}

function normalizedDraft(draft: ExerciseEditableInput): ExerciseEditableInput {
  const instructions = draft.instructions?.trim();
  return {
    ...draft,
    name: draft.name.trim().replace(/\s+/g, " "),
    instructions: instructions ? instructions.replace(/\r\n?/g, "\n") : null,
  };
}

function validateDraft(draft: ExerciseEditableInput): FieldErrors {
  const errors: FieldErrors = {};
  const name = draft.name.trim().replace(/\s+/g, " ");
  if (!name) errors.name = "Informe o nome do exercício.";
  else if (name.length > NAME_MAX_LENGTH)
    errors.name = `Use no máximo ${NAME_MAX_LENGTH} caracteres.`;

  if ((draft.instructions?.trim().length ?? 0) > INSTRUCTIONS_MAX_LENGTH)
    errors.instructions = `Use no máximo ${INSTRUCTIONS_MAX_LENGTH.toLocaleString("pt-BR")} caracteres.`;

  if (!(draft.modality in modalityLabels))
    errors.modality = "Selecione uma modalidade válida.";

  const secondary = new Set(draft.secondaryMuscleGroupIds);
  if (draft.primaryMuscleGroupIds.some((id) => secondary.has(id)))
    errors.muscles =
      "Um grupo muscular não pode ser principal e secundário ao mesmo tempo.";
  return errors;
}

function toggleId(values: string[], id: string, selected: boolean) {
  if (selected) return values.includes(id) ? values : [...values, id];
  return values.filter((value) => value !== id);
}

function asError(error: unknown) {
  return error instanceof Error
    ? error
    : new Error("Não foi possível concluir a solicitação.");
}

function fieldErrorsFromApi(error: Error): FieldErrors {
  if (!(error instanceof NodusApiError)) return {};
  const entries = Object.entries(error.problem.errors ?? {});
  const find = (...names: string[]) =>
    entries.find(([key]) =>
      names.some(
        (name) => key.localeCompare(name, undefined, { sensitivity: "base" }) === 0,
      ),
    )?.[1][0];
  return {
    name: find("name"),
    instructions: find("instructions"),
    modality: find("modality"),
    equipment: find("equipmentIds"),
    muscles: find("primaryMuscleGroupIds", "secondaryMuscleGroupIds"),
  };
}

function mutationErrorPresentation(error: Error) {
  if (!(error instanceof NodusApiError)) {
    return { message: "Não foi possível salvar. Tente novamente.", meta: null };
  }
  const firstFieldError = Object.values(error.problem.errors ?? {}).flat()[0];
  const messages: Record<string, string> = {
    EXERCISE_DUPLICATE: "Já existe um exercício com esse nome no seu catálogo.",
    EXERCISE_VERSION_CONFLICT:
      "Este exercício foi alterado em outra sessão. Recarregue a página antes de tentar novamente.",
    EXERCISE_SYSTEM_READ_ONLY: "Exercícios do sistema são somente leitura.",
    EXERCISE_NOT_FOUND: "O exercício não foi encontrado ou não está mais disponível.",
    EXERCISE_OPERATION_CONFLICT:
      "Esta operação entrou em conflito com uma solicitação anterior.",
  };
  return {
    message:
      firstFieldError ?? messages[error.code] ?? error.message ?? "Tente novamente.",
    meta: `Código: ${error.code}${error.traceId ? ` · Correlação: ${error.traceId}` : ""}`,
  };
}

function joinOptionNames(options: Array<{ name: string }>) {
  return options.length > 0 ? options.map((item) => item.name).join(", ") : "Nenhum";
}
