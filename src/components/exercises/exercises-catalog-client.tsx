"use client";

import {
  IconArchive,
  IconBarbell,
  IconChevronLeft,
  IconChevronRight,
  IconPencil,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type ColumnDef,
  columnFilteringFeature,
  flexRender,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEFAULT_EXERCISE_FILTERS,
  exerciseFiltersToSearchParams,
  hasActiveExerciseFilters,
  normalizeExerciseListFilter,
} from "@/features/exercises/exercise-query-keys";
import {
  archiveExerciseMutationOptions,
  exerciseListQueryOptions,
  exerciseOptionsQueryOptions,
} from "@/features/exercises/exercises-api";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { NodusApiError } from "@/lib/api/nodus-api-client";
import type {
  ExerciseCatalogItem,
  ExerciseCatalogOptions,
  ExerciseListFilter,
  ExerciseModality,
} from "@/lib/contracts/exercises";
import { ExerciseLoading, ExerciseQueryError } from "./exercise-query-state";

const features = tableFeatures({
  columnFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
});
const EMPTY_EXERCISES: ExerciseCatalogItem[] = [];
const selectClass =
  "min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";

export function ExercisesCatalogClient() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = normalizeExerciseListFilter(params);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const query = useQuery({
    ...exerciseListQueryOptions(filters),
    placeholderData: keepPreviousData,
  });
  const optionsQuery = useQuery(exerciseOptionsQueryOptions());
  const announceArchived = useCallback((name: string) => {
    setAnnouncement(`${name} foi arquivado.`);
  }, []);
  const columns = useMemo(() => createColumns(announceArchived), [announceArchived]);
  const table = useTable({
    features,
    data: query.data?.items ?? EMPTY_EXERCISES,
    columns,
    getRowId: (exercise) => exercise.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: query.data?.totalCount ?? 0,
    state: {
      pagination: { pageIndex: filters.page - 1, pageSize: 20 },
      sorting: [{ id: filters.sortBy, desc: filters.sortDirection === "DESC" }],
    },
  });

  function update(patch: Partial<ExerciseListFilter>) {
    const next = exerciseFiltersToSearchParams(
      normalizeExerciseListFilter({ ...filters, ...patch }),
    );
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  const data = query.data;
  const routeAnnouncement =
    params.get("saved") === "archived" ? "Exercício arquivado." : null;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-brand">Biblioteca de treino</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-ink-primary">
            <IconBarbell aria-hidden="true" size={28} />
            Exercícios
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            {data && !query.isError
              ? query.isPlaceholderData
                ? "Atualizando catálogo…"
                : `${data.totalCount} ${data.totalCount === 1 ? "exercício encontrado" : "exercícios encontrados"}`
              : "Consulte o catálogo do sistema e seus exercícios."}
          </p>
        </div>
        <Button asChild>
          <Link href="/exercicios/novo">
            <IconPlus aria-hidden="true" size={18} />
            Novo exercício
          </Link>
        </Button>
      </header>

      {(announcement || routeAnnouncement) && (
        <p
          role="status"
          className="rounded-lg border border-border bg-success-bg p-3 text-sm text-success-text"
        >
          {announcement ?? routeAnnouncement}
        </p>
      )}

      <ExerciseFilterEditor
        filters={filters}
        options={optionsQuery.data}
        optionsPending={!optionsQuery.data}
        update={update}
      />

      {optionsQuery.isError && !query.isError && (
        <section role="alert" className="rounded-lg border border-border bg-surface p-4">
          <p className="font-semibold text-ink-primary">
            Não foi possível carregar equipamentos e grupos musculares.
          </p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => {
              void optionsQuery.refetch();
            }}
          >
            Tentar filtros novamente
          </Button>
        </section>
      )}

      {query.isPending ? (
        <ExerciseLoading />
      ) : query.isError ? (
        <ExerciseQueryError
          error={query.error}
          retry={() => {
            void query.refetch();
          }}
        />
      ) : (
        data && (
          <>
            {query.isFetching && (
              <p role="status" className="text-sm text-ink-secondary">
                Atualizando exercícios…
              </p>
            )}
            {data.totalCount === 0 ? (
              <CatalogEmpty
                filters={filters}
                clear={() => update(DEFAULT_EXERCISE_FILTERS)}
              />
            ) : (
              <>
                {data.items.length === 0 ? (
                  <section className="rounded-lg border border-border bg-surface p-6">
                    <h2 className="font-bold text-ink-primary">
                      Nenhum exercício nesta página
                    </h2>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => update({ page: 1 })}
                    >
                      Primeira página
                    </Button>
                  </section>
                ) : (
                  <ExerciseResults
                    table={table}
                    items={data.items}
                    fetching={query.isFetching}
                    onArchived={announceArchived}
                  />
                )}
                <nav
                  aria-label="Paginação dos exercícios"
                  className="flex items-center justify-between gap-2"
                >
                  <Button
                    aria-label="Página anterior"
                    variant="outline"
                    disabled={filters.page === 1 || query.isFetching}
                    onClick={() => update({ page: filters.page - 1 })}
                  >
                    <IconChevronLeft size={18} aria-hidden="true" />
                    Anterior
                  </Button>
                  <span className="text-sm text-ink-secondary">
                    Página {filters.page}
                  </span>
                  <Button
                    aria-label="Próxima página"
                    variant="outline"
                    disabled={filters.page * 20 >= data.totalCount || query.isFetching}
                    onClick={() => update({ page: filters.page + 1 })}
                  >
                    Próxima
                    <IconChevronRight size={18} aria-hidden="true" />
                  </Button>
                </nav>
              </>
            )}
          </>
        )
      )}
    </div>
  );
}

function ExerciseResults({
  table,
  items,
  fetching,
  onArchived,
}: {
  table: ReturnType<typeof useTable<typeof features, ExerciseCatalogItem>>;
  items: ExerciseCatalogItem[];
  fetching: boolean;
  onArchived: (name: string) => void;
}) {
  return (
    <>
      <div
        className="hidden overflow-hidden rounded-lg border border-border bg-surface xl:block"
        aria-busy={fetching}
      >
        <Table aria-label="Catálogo de exercícios">
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id} scope="col">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell className="break-words" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul
        className="grid gap-3 xl:hidden"
        aria-label="Catálogo de exercícios"
        aria-busy={fetching}
      >
        {items.map((exercise) => (
          <li
            key={exercise.id}
            className="min-w-0 rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="break-words font-semibold text-ink-primary">
                {exercise.name}
              </h2>
              <OwnershipBadge exercise={exercise} />
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <CompactDetail
                label="Modalidade"
                value={modalityLabel(exercise.modality)}
              />
              <CompactDetail
                label="Equipamentos"
                value={optionNames(exercise.equipment)}
              />
              <CompactDetail label="Criado em" value={formatDate(exercise.createdAt)} />
            </dl>
            <div className="mt-4 border-t border-border-muted pt-3">
              <ExerciseActions
                exercise={exercise}
                presentation="card"
                onArchived={onArchived}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function createColumns(
  onArchived: (name: string) => void,
): ColumnDef<typeof features, ExerciseCatalogItem>[] {
  return [
    { id: "NAME", accessorKey: "name", header: "Exercício" },
    {
      id: "origin",
      header: "Origem",
      enableSorting: false,
      cell: ({ row }) => <OwnershipBadge exercise={row.original} />,
    },
    {
      id: "modality",
      header: "Modalidade",
      enableSorting: false,
      cell: ({ row }) => modalityLabel(row.original.modality),
    },
    {
      id: "equipment",
      header: "Equipamentos",
      enableSorting: false,
      cell: ({ row }) => optionNames(row.original.equipment),
    },
    {
      id: "CREATED_AT",
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Ações",
      enableSorting: false,
      cell: ({ row }) => (
        <ExerciseActions
          exercise={row.original}
          presentation="table"
          onArchived={onArchived}
        />
      ),
    },
  ];
}

function OwnershipBadge({ exercise }: { exercise: ExerciseCatalogItem }) {
  const mine = exercise.ownerPersonalId !== null;
  return (
    <Badge variant={mine ? "success" : "outline"}>
      {mine ? "Meu exercício" : "Sistema"}
    </Badge>
  );
}

function ExerciseActions({
  exercise,
  presentation,
  onArchived,
}: {
  exercise: ExerciseCatalogItem;
  presentation: "table" | "card";
  onArchived: (name: string) => void;
}) {
  const mine = exercise.ownerPersonalId !== null;
  const mutable = mine && exercise.status === "ACTIVE";
  const [confirming, setConfirming] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const archiveOperationId = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const archive = useMutation(archiveExerciseMutationOptions(queryClient, exercise.id));
  const confirmationId = `archive-${presentation}-${exercise.id}`;
  const titleId = `${confirmationId}-title`;

  function cancel() {
    setConfirming(false);
    trigger.current?.focus();
  }

  async function confirmArchive() {
    archiveOperationId.current ??= globalThis.crypto.randomUUID();
    try {
      const result = await archive.mutateAsync({
        operationId: archiveOperationId.current,
        expectedVersion: exercise.version,
      });
      archiveOperationId.current = null;
      setConfirming(false);
      onArchived(result.name);
    } catch {
      // The mutation error stays visible inside the confirmation region.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" asChild>
        <Link
          href={`/exercicios/${exercise.id}`}
          aria-label={
            mutable ? `Editar ${exercise.name}` : `Ver detalhes de ${exercise.name}`
          }
        >
          {mutable ? <IconPencil aria-hidden="true" size={17} /> : null}
          {mutable ? "Editar" : "Ver detalhes"}
        </Link>
      </Button>
      {mutable && (
        <Button
          ref={trigger}
          variant="ghost"
          aria-expanded={confirming}
          aria-controls={confirmationId}
          aria-label={`Arquivar ${exercise.name}`}
          onClick={() => setConfirming(true)}
        >
          <IconArchive aria-hidden="true" size={17} />
          Arquivar
        </Button>
      )}
      {confirming && (
        <div
          id={confirmationId}
          role="alertdialog"
          aria-labelledby={titleId}
          className="w-full min-w-56 rounded-lg border border-border bg-elevated p-3 shadow-card"
          onKeyDown={(event) => {
            if (event.key === "Escape") cancel();
          }}
        >
          <p id={titleId} className="font-semibold text-ink-primary">
            Arquivar {exercise.name}?
          </p>
          <p className="mt-1 text-sm text-ink-secondary">
            O exercício deixa de aparecer no catálogo ativo.
          </p>
          {archive.isError && (
            <p role="alert" className="mt-2 text-sm text-danger-text">
              {mutationErrorMessage(archive.error)}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              autoFocus
              disabled={archive.isPending}
              onClick={cancel}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={archive.isPending}
              aria-label={`Confirmar arquivamento de ${exercise.name}`}
              onClick={() => {
                void confirmArchive();
              }}
            >
              {archive.isPending ? "Arquivando…" : "Confirmar arquivamento"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseFilterEditor({
  filters,
  options,
  optionsPending,
  update,
}: {
  filters: ExerciseListFilter;
  options: ExerciseCatalogOptions | undefined;
  optionsPending: boolean;
  update: (patch: Partial<ExerciseListFilter>) => void;
}) {
  const urlKey = exerciseFiltersToSearchParams(filters).toString();
  const [editor, setEditor] = useState({
    urlKey,
    draft: filters.search ?? "",
    pending: [] as string[],
    navigation: 0,
  });

  if (editor.urlKey !== urlKey) {
    const acknowledged = editor.pending.indexOf(urlKey);
    setEditor({
      urlKey,
      draft: acknowledged >= 0 ? editor.draft : (filters.search ?? ""),
      pending: acknowledged >= 0 ? editor.pending.slice(acknowledged + 1) : [],
      navigation: editor.navigation + (acknowledged >= 0 ? 0 : 1),
    });
  }

  const draft = editor.draft;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function cancel() {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }
  function submit(patch: Partial<ExerciseListFilter>) {
    const target = exerciseFiltersToSearchParams(
      normalizeExerciseListFilter({ ...filters, ...patch }),
    ).toString();
    if (target !== urlKey)
      setEditor((current) => ({
        ...current,
        pending: [...current.pending, target],
      }));
    update(patch);
  }
  function submitSelect(patch: Partial<ExerciseListFilter>) {
    cancel();
    submit({ ...patch, page: 1, search: draft });
  }
  const latestSubmit = useRef(submit);
  useLayoutEffect(() => {
    latestSubmit.current = submit;
  });

  return (
    <section aria-label="Filtros do catálogo" className="space-y-3">
      <FilterTimerBoundary key={editor.navigation} cancel={cancel} />
      <div className="relative">
        <IconSearch
          className="pointer-events-none absolute left-3 top-3 text-ink-tertiary"
          size={20}
          aria-hidden="true"
        />
        <Input
          className="pl-10 placeholder:text-ink-secondary"
          aria-label="Buscar exercício"
          placeholder="Buscar exercício por nome"
          value={draft}
          maxLength={100}
          onChange={(event) => {
            const value = event.target.value;
            setEditor((current) => ({ ...current, draft: value }));
            cancel();
            timer.current = setTimeout(
              () => latestSubmit.current({ search: value, page: 1 }),
              300,
            );
          }}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <select
          className={selectClass}
          aria-label="Filtrar por status"
          value={filters.status}
          onChange={(event) =>
            submitSelect({
              status: event.target.value === "ARCHIVED" ? "ARCHIVED" : "ACTIVE",
            })
          }
        >
          <option value="ACTIVE">Ativos</option>
          <option value="ARCHIVED">Arquivados</option>
        </select>
        <select
          className={selectClass}
          aria-label="Filtrar por origem"
          value={filters.ownership}
          onChange={(event) =>
            submitSelect({
              ownership:
                event.target.value === "SYSTEM" || event.target.value === "MINE"
                  ? event.target.value
                  : "ALL",
            })
          }
        >
          <option value="ALL">Todas as origens</option>
          <option value="SYSTEM">Sistema</option>
          <option value="MINE">Meus exercícios</option>
        </select>
        <select
          className={selectClass}
          aria-label="Filtrar por equipamento"
          value={filters.equipmentId ?? ""}
          disabled={optionsPending}
          onChange={(event) =>
            submitSelect({ equipmentId: event.target.value || undefined })
          }
        >
          <option value="">Todos os equipamentos</option>
          {options?.equipment.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          aria-label="Filtrar por grupo muscular"
          value={filters.muscleGroupId ?? ""}
          disabled={optionsPending}
          onChange={(event) =>
            submitSelect({ muscleGroupId: event.target.value || undefined })
          }
        >
          <option value="">Todos os grupos musculares</option>
          {options?.muscleGroups.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          aria-label="Ordenar exercícios"
          value={`${filters.sortBy}:${filters.sortDirection}`}
          onChange={(event) => {
            const [sortBy, sortDirection] = event.target.value.split(":");
            submitSelect({
              sortBy: sortBy === "CREATED_AT" ? "CREATED_AT" : "NAME",
              sortDirection: sortDirection === "DESC" ? "DESC" : "ASC",
            });
          }}
        >
          <option value="NAME:ASC">Nome A–Z</option>
          <option value="NAME:DESC">Nome Z–A</option>
          <option value="CREATED_AT:DESC">Mais recentes</option>
          <option value="CREATED_AT:ASC">Mais antigos</option>
        </select>
      </div>
    </section>
  );
}

function CatalogEmpty({
  filters,
  clear,
}: {
  filters: ExerciseListFilter;
  clear: () => void;
}) {
  const filtered = hasActiveExerciseFilters(filters);
  return (
    <section className="rounded-lg border border-border bg-surface p-6 text-center">
      <h2 className="font-bold text-ink-primary">
        {filtered
          ? "Nenhum exercício corresponde aos filtros"
          : "Nenhum exercício disponível"}
      </h2>
      <p className="mt-2 text-sm text-ink-secondary">
        {filtered
          ? "Ajuste a busca ou limpe os filtros."
          : "Crie seu primeiro exercício para começar o catálogo."}
      </p>
      {filtered ? (
        <Button variant="outline" className="mt-4" onClick={clear}>
          Limpar filtros
        </Button>
      ) : (
        <Button className="mt-4" asChild>
          <Link href="/exercicios/novo">Criar exercício</Link>
        </Button>
      )}
    </section>
  );
}

function CompactDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
        {label}
      </dt>
      <dd className="mt-1 break-words text-ink-primary">{value}</dd>
    </div>
  );
}

function FilterTimerBoundary({ cancel }: { cancel: () => void }) {
  useMountEffect(() => cancel);
  return null;
}

function modalityLabel(modality: ExerciseModality) {
  return {
    STRENGTH: "Força",
    CARDIO: "Cardio",
    MOBILITY: "Mobilidade",
  }[modality];
}

function optionNames(options: { name: string }[]) {
  return options.length > 0 ? options.map((item) => item.name).join(", ") : "Nenhum";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(value));
}

function mutationErrorMessage(error: Error) {
  if (!(error instanceof NodusApiError))
    return "Não foi possível arquivar. Tente novamente.";
  const guidance =
    error.code === "EXERCISE_VERSION_CONFLICT"
      ? "O exercício mudou. Atualize a página antes de tentar novamente."
      : error.code === "EXERCISE_SYSTEM_READ_ONLY"
        ? "Exercícios do sistema são somente leitura."
        : error.message;
  return `${guidance} Código: ${error.code}${error.traceId ? ` · Correlação: ${error.traceId}` : ""}`;
}
