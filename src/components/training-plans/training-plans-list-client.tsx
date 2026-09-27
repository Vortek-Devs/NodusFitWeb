"use client";

import {
  IconBarbell,
  IconChevronLeft,
  IconChevronRight,
  IconUsers,
} from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEFAULT_STUDENT_FILTERS,
  studentQueryKeys,
} from "@/features/students/student-query-keys";
import { listStudents } from "@/features/students/students-api";
import { trainingPlanListQueryOptions } from "@/features/training-plans/training-plans-api";
import { NodusApiError } from "@/lib/api/nodus-api-client";
import { isUuid } from "@/lib/contracts/students";
import type { TrainingPlanListItem } from "@/lib/contracts/training-plans";

const tableFeaturesConfig = tableFeatures({
  columnFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
});
const EMPTY_PLANS: TrainingPlanListItem[] = [];
const columns: ColumnDef<typeof tableFeaturesConfig, TrainingPlanListItem>[] = [
  {
    accessorKey: "name",
    header: "Plano",
    cell: ({ row }) => (
      <Link
        className="font-semibold text-ink-primary underline-offset-4 hover:text-ink-brand hover:underline"
        href={`/treinos/${row.original.id}`}
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <PlanStatus status={row.original.status} />,
  },
  { accessorKey: "dayCount", header: "Dias" },
  { accessorKey: "exerciseCount", header: "Exercícios" },
  {
    accessorKey: "updatedAt",
    header: "Atualizado",
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
  {
    id: "actions",
    header: "Ações",
    enableSorting: false,
    cell: ({ row }) => (
      <Button asChild variant="outline">
        <Link href={`/treinos/${row.original.id}`}>
          {row.original.status === "DRAFT" ? "Continuar" : "Ver plano"}
        </Link>
      </Button>
    ),
  },
];

export function TrainingPlansListClient() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const studentId = params.get("studentId") ?? "";
  const page = readPage(params.get("page"));
  const students = useQuery({
    queryKey: studentQueryKeys.list(DEFAULT_STUDENT_FILTERS),
    queryFn: ({ signal }) => listStudents(DEFAULT_STUDENT_FILTERS, signal),
  });
  const plans = useQuery({
    ...trainingPlanListQueryOptions(studentId, page),
    placeholderData: keepPreviousData,
  });
  const table = useTable({
    features: tableFeaturesConfig,
    data: plans.data?.items ?? EMPTY_PLANS,
    columns,
    getRowId: (plan) => plan.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: plans.data?.totalCount ?? 0,
    state: { pagination: { pageIndex: page - 1, pageSize: 20 } },
  });

  function selectStudent(nextStudentId: string) {
    const next = new URLSearchParams();
    if (nextStudentId) next.set("studentId", nextStudentId);
    router.replace(`${pathname}${next.size > 0 ? `?${next}` : ""}`, { scroll: false });
  }

  function selectPage(nextPage: number) {
    const next = new URLSearchParams();
    if (studentId) next.set("studentId", studentId);
    if (nextPage > 1) next.set("page", String(nextPage));
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  const selectedStudent = students.data?.items.find(
    (student) => student.id === studentId,
  );
  const isBadStudentId = studentId.length > 0 && !isUuid(studentId);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-brand">Prescrição de treino</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-ink-primary">
            <IconBarbell aria-hidden="true" size={28} />
            Treinos
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Planos individuais, com rascunhos e publicação para seus alunos.
          </p>
        </div>
      </header>

      <section className="grid gap-4 rounded-lg border border-border bg-surface p-4 md:grid-cols-[minmax(15rem,22rem)_1fr] md:items-end">
        <label className="block space-y-2 text-sm font-semibold text-ink-primary">
          <span>Aluno</span>
          <select
            aria-label="Selecionar aluno"
            className="min-h-11 w-full rounded-lg border border-border bg-page px-3 text-sm text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
            value={studentId}
            onChange={(event) => selectStudent(event.currentTarget.value)}
            disabled={students.isPending || students.isError}
          >
            <option value="">Escolha um aluno</option>
            {students.data?.items.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} · {student.status === "ACTIVE" ? "Ativo" : "Inativo"}
              </option>
            ))}
          </select>
        </label>
        {selectedStudent && isUuid(studentId) ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-secondary">
              {plans.data && !plans.isError
                ? `${plans.data.totalCount} planos para ${selectedStudent.name}`
                : `Consulte os planos de ${selectedStudent.name}.`}
            </p>
            <Button asChild>
              <Link href={`/treinos/novo?studentId=${encodeURIComponent(studentId)}`}>
                <IconBarbell aria-hidden="true" size={18} />
                Criar plano
              </Link>
            </Button>
          </div>
        ) : null}
      </section>

      {students.isPending ? <Loading label="Carregando alunos" /> : null}
      {students.isError ? (
        <QueryError error={students.error} retry={() => void students.refetch()} />
      ) : null}
      {students.isSuccess && students.data.totalCount === 0 ? (
        <section className="rounded-lg border border-border bg-surface p-6 text-center">
          <IconUsers aria-hidden="true" className="mx-auto text-ink-brand" size={30} />
          <h2 className="mt-3 font-bold text-ink-primary">Nenhum aluno vinculado</h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Convide um aluno para criar um plano de treino individual.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/alunos">Ir para alunos</Link>
          </Button>
        </section>
      ) : null}
      {isBadStudentId ? (
        <section
          role="alert"
          className="rounded-lg border border-danger-text/30 bg-surface p-5"
        >
          <h2 className="font-bold text-ink-primary">Selecione um aluno válido</h2>
          <Button className="mt-3" variant="outline" onClick={() => selectStudent("")}>
            Limpar seleção
          </Button>
        </section>
      ) : null}
      {!studentId && students.data && students.data.totalCount > 0 ? (
        <section className="rounded-lg border border-border bg-surface p-6 text-center">
          <IconUsers aria-hidden="true" className="mx-auto text-ink-brand" size={30} />
          <h2 className="mt-3 font-bold text-ink-primary">
            Escolha um aluno para ver os planos
          </h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Cada plano fica vinculado a um aluno específico; assim os dados não se
            misturam.
          </p>
        </section>
      ) : null}
      {studentId && !isBadStudentId ? (
        plans.isPending ? (
          <Loading label="Carregando planos" />
        ) : plans.isError ? (
          <QueryError error={plans.error} retry={() => void plans.refetch()} />
        ) : plans.data ? (
          plans.data.totalCount === 0 ? (
            <section className="rounded-lg border border-border bg-surface p-6 text-center">
              <IconBarbell
                aria-hidden="true"
                className="mx-auto text-ink-brand"
                size={30}
              />
              <h2 className="mt-3 font-bold text-ink-primary">
                Ainda não há planos para este aluno
              </h2>
              <p className="mt-2 text-sm text-ink-secondary">
                Comece com um rascunho e publique quando os dias e exercícios estiverem
                prontos.
              </p>
              <Button asChild className="mt-4">
                <Link href={`/treinos/novo?studentId=${encodeURIComponent(studentId)}`}>
                  Criar primeiro plano
                </Link>
              </Button>
            </section>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
                <Table aria-label="Planos de treino">
                  <TableHeader>
                    {table.getHeaderGroups().map((group) => (
                      <TableRow key={group.id}>
                        {group.headers.map((header) => (
                          <TableHead key={header.id} scope="col">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getAllCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ul className="space-y-3 md:hidden" aria-label="Planos de treino">
                {plans.data.items.map((plan) => (
                  <li key={plan.id}>
                    <Link
                      className="block rounded-lg border border-border bg-surface p-4 focus-visible:outline-2 focus-visible:outline-brand-400"
                      href={`/treinos/${plan.id}`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-ink-primary">
                          {plan.name}
                        </span>
                        <PlanStatus status={plan.status} />
                      </span>
                      <span className="mt-2 block text-sm text-ink-secondary">
                        {plan.dayCount} dias · {plan.exerciseCount} exercícios
                      </span>
                      <span className="mt-1 block text-xs text-ink-tertiary">
                        Atualizado {formatDate(plan.updatedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <nav
                aria-label="Paginação de planos"
                className="flex items-center justify-between gap-2"
              >
                <Button
                  variant="outline"
                  disabled={page <= 1 || plans.isFetching}
                  onClick={() => selectPage(page - 1)}
                >
                  <IconChevronLeft aria-hidden="true" size={18} /> Anterior
                </Button>
                <span className="text-sm text-ink-secondary">Página {page}</span>
                <Button
                  variant="outline"
                  disabled={page * 20 >= plans.data.totalCount || plans.isFetching}
                  onClick={() => selectPage(page + 1)}
                >
                  Próxima <IconChevronRight aria-hidden="true" size={18} />
                </Button>
              </nav>
            </>
          )
        ) : null
      ) : null}
    </div>
  );
}

function PlanStatus({ status }: { status: TrainingPlanListItem["status"] }) {
  return (
    <span
      className={
        status === "PUBLISHED"
          ? "inline-flex rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text"
          : "inline-flex rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-ink-secondary"
      }
    >
      {status === "PUBLISHED" ? "Publicado" : "Rascunho"}
    </span>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <p
      role="status"
      className="rounded-lg border border-border bg-surface p-5 text-sm text-ink-secondary"
    >
      {label}…
    </p>
  );
}

function QueryError({ error, retry }: { error: Error; retry: () => void }) {
  const api = error instanceof NodusApiError ? error : null;
  return (
    <section
      role="alert"
      className="rounded-lg border border-danger-text/30 bg-surface p-5"
    >
      <h2 className="font-bold text-ink-primary">Não foi possível carregar os planos</h2>
      <p className="mt-2 text-sm text-ink-secondary">
        {api?.message ?? "Tente novamente."}
      </p>
      {api ? <p className="mt-2 text-xs text-ink-tertiary">Código: {api.code}</p> : null}
      {api?.status === 401 ? (
        <Button asChild className="mt-4">
          <Link href="/acesso?perfil=personal">Entrar novamente</Link>
        </Button>
      ) : (
        <Button variant="outline" className="mt-4" onClick={retry}>
          Tentar novamente
        </Button>
      )}
    </section>
  );
}

function readPage(value: string | null) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}
