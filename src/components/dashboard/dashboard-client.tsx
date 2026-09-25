"use client";

import {
  IconBarbell,
  IconChevronRight,
  IconUserCheck,
  IconUsers,
  IconUserX,
} from "@tabler/icons-react";
import { useQueries, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { StudentQueryError } from "@/components/students/student-query-state";
import { StudentStatusBadge } from "@/components/students/student-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_EXERCISE_FILTERS } from "@/features/exercises/exercise-query-keys";
import { exerciseListQueryOptions } from "@/features/exercises/exercises-api";
import { formatNodusDate } from "@/features/students/format-student-date";
import {
  DEFAULT_STUDENT_FILTERS,
  studentQueryKeys,
} from "@/features/students/student-query-keys";
import { listStudents } from "@/features/students/students-api";
import type { StudentListFilter } from "@/lib/contracts/students";

interface IconProps {
  "aria-hidden"?: boolean | "true" | "false";
  className?: string;
  size?: number;
  stroke?: number;
}

const dashboardFilters: StudentListFilter[] = [
  {
    ...DEFAULT_STUDENT_FILTERS,
    sortBy: "linkedAt",
    sortDirection: "desc",
  },
  { ...DEFAULT_STUDENT_FILTERS, status: "ACTIVE" },
  { ...DEFAULT_STUDENT_FILTERS, status: "INACTIVE" },
];

const quickActions = [
  {
    description: "Encontre movimentos por modalidade e grupo muscular.",
    href: "/exercicios",
    label: "Explorar exercícios",
    number: "01",
  },
  {
    description: "Adicione um movimento ao catálogo do seu espaço.",
    href: "/exercicios/novo",
    label: "Cadastrar exercício",
    number: "02",
  },
];

export function DashboardClient() {
  const studentQueries = useQueries({
    queries: dashboardFilters.map((filter) => ({
      queryKey: studentQueryKeys.list(filter),
      queryFn: ({ signal }: { signal: AbortSignal }) => listStudents(filter, signal),
    })),
  });
  const exercisesQuery = useQuery(exerciseListQueryOptions(DEFAULT_EXERCISE_FILTERS));
  const failedStudentQuery = studentQueries.find((query) => query.isError);

  if (failedStudentQuery) {
    return (
      <StudentQueryError
        error={failedStudentQuery.error}
        retry={() => {
          for (const query of studentQueries) void query.refetch();
        }}
      />
    );
  }

  if (studentQueries.some((query) => query.isPending)) return <DashboardLoading />;

  const [students, activeStudents, inactiveStudents] = studentQueries.map(
    (query) => query.data,
  );
  if (!students || !activeStudents || !inactiveStudents) return <DashboardLoading />;

  const exerciseCount = exercisesQuery.data?.totalCount;
  const exerciseDetail = exercisesQuery.isError
    ? "Não foi possível consultar o catálogo."
    : exercisesQuery.isPending
      ? "Carregando catálogo…"
      : "Exercícios ativos no catálogo";

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-brand">
            Painel do personal
          </p>
          <h1 className="mt-2 font-[var(--font-syne)] text-3xl font-extrabold tracking-tight sm:text-4xl">
            Sua base em foco
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Alunos recentes, status da carteira e ferramentas para o dia a dia.
          </p>
        </div>
        <Button asChild className="shrink-0 self-start sm:self-auto">
          <Link href="/alunos">Gerenciar alunos</Link>
        </Button>
      </header>

      <dl
        aria-label="Resumo do painel"
        className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1.45fr_1fr_1fr_1fr]"
      >
        <DashboardMetric
          detail="alunos vinculados ao seu espaço"
          featured
          icon={IconUsers}
          label="Sua carteira"
          value={students.totalCount}
        >
          <StudentStatusMeter
            activeCount={activeStudents.totalCount}
            inactiveCount={inactiveStudents.totalCount}
            totalCount={students.totalCount}
          />
        </DashboardMetric>
        <DashboardMetric
          detail="com vínculo ativo"
          icon={IconUserCheck}
          label="Alunos ativos"
          value={activeStudents.totalCount}
        >
          <StudentShareMeter
            count={activeStudents.totalCount}
            status="ativos"
            totalCount={students.totalCount}
          />
        </DashboardMetric>
        <DashboardMetric
          detail="com vínculo inativo"
          icon={IconUserX}
          label="Alunos inativos"
          value={inactiveStudents.totalCount}
        >
          <StudentShareMeter
            count={inactiveStudents.totalCount}
            status="inativos"
            totalCount={students.totalCount}
          />
        </DashboardMetric>
        <DashboardMetric
          detail={exerciseDetail}
          icon={IconBarbell}
          label="Biblioteca de exercícios"
          value={
            exerciseCount !== undefined ? (
              exerciseCount
            ) : exercisesQuery.isPending ? (
              <Skeleton aria-label="Carregando exercícios" className="h-9 w-16" />
            ) : (
              "—"
            )
          }
        >
          {exercisesQuery.data?.items.length ? (
            <ul aria-label="Exemplos do catálogo" className="mt-4 space-y-2">
              {exercisesQuery.data.items.slice(0, 2).map((exercise) => (
                <li
                  className="flex min-w-0 items-center gap-2 text-xs font-medium text-ink-secondary"
                  key={exercise.id}
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-brand-400"
                  />
                  <span className="truncate">{exercise.name}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {exercisesQuery.isError && !exercisesQuery.data ? (
            <button
              className="mt-3 min-h-11 text-xs font-semibold text-ink-brand underline decoration-brand-400/50 underline-offset-4 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              onClick={() => void exercisesQuery.refetch()}
              type="button"
            >
              Tentar novamente
            </button>
          ) : null}
          {exercisesQuery.data && exercisesQuery.data.items.length === 0 ? (
            <Link
              className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-ink-brand underline decoration-brand-400/50 underline-offset-4 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              href="/exercicios/novo"
            >
              Cadastrar primeiro exercício
            </Link>
          ) : null}
        </DashboardMetric>
      </dl>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.72fr)]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-card">
          <header className="flex items-start justify-between gap-4 border-b border-border-muted px-5 py-5 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
                Sua carteira
              </p>
              <h2 className="mt-1 font-[var(--font-syne)] text-xl font-extrabold">
                Alunos recentes
              </h2>
              <p className="mt-1 text-sm text-ink-secondary">
                Últimos vínculos registrados.
              </p>
            </div>
            <Button variant="ghost" className="shrink-0" asChild>
              <Link href="/alunos">Ver todos</Link>
            </Button>
          </header>

          {students.items.length === 0 ? (
            <div className="space-y-4 p-6">
              <div>
                <p className="font-semibold text-ink-primary">
                  Sua base ainda está vazia.
                </p>
                <p className="mt-1 max-w-md text-sm text-ink-secondary">
                  Comece pelo cadastro ou convite de um aluno para organizar sua carteira.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/alunos">Cadastrar ou convidar seu primeiro aluno</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border-muted">
              {students.items.slice(0, 5).map((student) => (
                <li key={student.id}>
                  <Link
                    className="group grid min-h-20 min-w-0 gap-3 px-5 py-4 transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-400 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
                    href={`/alunos/${student.id}`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="grid size-11 shrink-0 place-items-center rounded-full border border-brand-400/25 bg-brand-400/10 text-xs font-bold tracking-wide text-ink-brand"
                      >
                        {getInitials(student.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink-primary group-hover:text-ink-brand">
                          {student.name}
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-ink-secondary">
                          {student.email}
                        </span>
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-wrap items-center gap-3 pl-14 sm:justify-end sm:pl-0">
                      <StudentStatusBadge status={student.status} />
                      <time
                        className="text-xs text-ink-secondary"
                        dateTime={student.linkedAt}
                      >
                        Vinculado em {formatNodusDate(student.linkedAt)}
                      </time>
                      <IconChevronRight
                        aria-hidden="true"
                        className="hidden text-ink-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-ink-brand sm:block"
                        size={16}
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
              Continue por aqui
            </p>
            <h2 className="mt-1 font-[var(--font-syne)] text-xl font-extrabold">
              Ferramentas do Nodus
            </h2>
          </div>
          <div className="grid gap-3">
            {quickActions.map((action) => (
              <QuickAction key={action.href} {...action} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DashboardMetric({
  children,
  detail,
  featured = false,
  icon: Icon,
  label,
  value,
}: {
  children?: ReactNode;
  detail: string;
  featured?: boolean;
  icon: ComponentType<IconProps>;
  label: string;
  value: ReactNode;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border p-5 shadow-card ${
        featured ? "border-brand-400/30 bg-brand-400/5" : "border-border bg-surface"
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-lg border ${
            featured
              ? "border-brand-400/30 bg-brand-400/10 text-ink-brand"
              : "border-border-muted bg-page text-ink-brand"
          }`}
        >
          <Icon aria-hidden="true" size={20} stroke={1.8} />
        </span>
        <dt className="pt-2 text-right text-sm font-semibold text-ink-secondary">
          {label}
        </dt>
      </div>
      <dd
        className={`font-[var(--font-syne)] font-extrabold tabular-nums text-ink-primary ${featured ? "text-4xl sm:text-5xl" : "text-3xl"}`}
      >
        {value}
      </dd>
      <p className="mt-1 min-h-5 text-xs text-ink-secondary">{detail}</p>
      {children}
    </div>
  );
}

function StudentStatusMeter({
  activeCount,
  inactiveCount,
  totalCount,
}: {
  activeCount: number;
  inactiveCount: number;
  totalCount: number;
}) {
  const classifiedCount = activeCount + inactiveCount;
  const activePercent =
    classifiedCount > 0 ? Math.round((activeCount / classifiedCount) * 100) : 0;
  const inactivePercent = classifiedCount > 0 ? 100 - activePercent : 0;

  return (
    <div className="mt-4">
      <div
        aria-label={`${activeCount} alunos ativos e ${inactiveCount} inativos, em ${totalCount} no total`}
        className="flex h-2.5 overflow-hidden rounded-full bg-hover"
        role="img"
      >
        <span className="h-full bg-brand-400" style={{ width: `${activePercent}%` }} />
        <span
          className="h-full bg-ink-tertiary/60"
          style={{ width: `${inactivePercent}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] font-medium text-ink-tertiary">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-400" />
          Ativos
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-ink-tertiary" />
          Inativos
        </span>
      </div>
    </div>
  );
}

function StudentShareMeter({
  count,
  status,
  totalCount,
}: {
  count: number;
  status: "ativos" | "inativos";
  totalCount: number;
}) {
  const share = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
  const statusColor = status === "ativos" ? "bg-brand-400" : "bg-ink-tertiary/60";

  return (
    <div className="mt-4">
      <div
        aria-label={`${count} alunos ${status} de ${totalCount}, ${share}% da carteira`}
        className="h-2 overflow-hidden rounded-full bg-hover"
        role="img"
      >
        <span
          className={`block h-full rounded-full ${statusColor}`}
          style={{ width: `${share}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] font-medium text-ink-tertiary">
        {totalCount === 0 ? "Nenhum aluno vinculado" : `${share}% da carteira`}
      </p>
    </div>
  );
}

function QuickAction({
  description,
  href,
  label,
  number,
}: {
  description: string;
  href: string;
  label: string;
  number: string;
}) {
  return (
    <Link
      className="group flex min-h-24 items-start gap-4 rounded-xl border border-border-muted bg-page p-4 transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:border-brand-400/40 hover:bg-hover active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
      href={href}
    >
      <span className="pt-0.5 font-mono text-xs font-semibold text-ink-brand">
        {number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="font-semibold text-ink-primary group-hover:text-ink-brand">
            {label}
          </span>
          <IconChevronRight
            aria-hidden="true"
            className="shrink-0 text-ink-tertiary group-hover:text-ink-brand"
            size={16}
          />
        </span>
        <span className="mt-1 block text-xs leading-5 text-ink-secondary">
          {description}
        </span>
      </span>
    </Link>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("pt-BR");
}

function DashboardLoading() {
  return (
    <div role="status" aria-label="Carregando painel" className="space-y-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-11 w-40" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.72fr)]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
