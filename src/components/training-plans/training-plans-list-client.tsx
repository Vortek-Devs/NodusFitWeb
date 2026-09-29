"use client";

import {
  IconBarbell,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
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
  trainingPlanListOptions,
  workoutTemplateListOptions,
} from "@/features/training/training-api";
import { DEFAULT_TRAINING_FILTER } from "@/features/training/training-query-keys";
import { NodusApiError } from "@/lib/api/nodus-api-client";
import type { TrainingListItem, TrainingStatus } from "@/lib/contracts/training";

const EMPTY_ITEMS: TrainingListItem[] = [];

export function TrainingPlansListClient() {
  const [templatePage, setTemplatePage] = useState(1);
  const [planPage, setPlanPage] = useState(1);
  const templateFilter = { ...DEFAULT_TRAINING_FILTER, page: templatePage };
  const planFilter = { ...DEFAULT_TRAINING_FILTER, page: planPage };
  const templates = useQuery({
    ...workoutTemplateListOptions(templateFilter),
    placeholderData: keepPreviousData,
  });
  const plans = useQuery({
    ...trainingPlanListOptions(planFilter),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-brand">Prescrição de treino</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-ink-primary">
            <IconBarbell aria-hidden="true" size={28} />
            Treinos
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Organize modelos de treino e monte planos semanais para sua carteira.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/treinos/novo?tipo=modelo">
              <IconPlus aria-hidden="true" size={18} />
              Novo treino
            </Link>
          </Button>
          <Button asChild>
            <Link href="/treinos/novo?tipo=plano">
              <IconPlus aria-hidden="true" size={18} />
              Novo plano
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard
          label="Biblioteca de treinos"
          value={templates.data?.totalCount}
          detail="Modelos reutilizáveis"
        />
        <SummaryCard
          label="Planos semanais"
          value={plans.data?.totalCount}
          detail="Distribuições por dia da semana"
        />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <TrainingCollection
          title="Biblioteca de treinos"
          description="Modelos versionados que podem compor diferentes planos."
          createHref="/treinos/novo?tipo=modelo"
          items={templates.data?.items ?? EMPTY_ITEMS}
          totalCount={templates.data?.totalCount ?? 0}
          page={templatePage}
          isPending={templates.isPending}
          isFetching={templates.isFetching}
          error={templates.isError ? templates.error : null}
          onRetry={() => void templates.refetch()}
          onPageChange={setTemplatePage}
          kind="modelo"
        />
        <TrainingCollection
          title="Planos semanais"
          description="Sequências de treinos organizadas por dia da semana."
          createHref="/treinos/novo?tipo=plano"
          items={plans.data?.items ?? EMPTY_ITEMS}
          totalCount={plans.data?.totalCount ?? 0}
          page={planPage}
          isPending={plans.isPending}
          isFetching={plans.isFetching}
          error={plans.isError ? plans.error : null}
          onRetry={() => void plans.refetch()}
          onPageChange={setPlanPage}
          kind="plano"
        />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | undefined;
  detail: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-ink-secondary">{label}</p>
      <p className="mt-2 font-[var(--font-syne)] text-3xl font-extrabold text-ink-primary">
        {value ?? "—"}
      </p>
      <p className="mt-1 text-xs text-ink-tertiary">{detail}</p>
    </section>
  );
}

function TrainingCollection({
  title,
  description,
  createHref,
  items,
  totalCount,
  page,
  isPending,
  isFetching,
  error,
  onRetry,
  onPageChange,
  kind,
}: {
  title: string;
  description: string;
  createHref: string;
  items: TrainingListItem[];
  totalCount: number;
  page: number;
  isPending: boolean;
  isFetching: boolean;
  error: Error | null;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  kind: "modelo" | "plano";
}) {
  const pageCount = Math.max(1, Math.ceil(totalCount / DEFAULT_TRAINING_FILTER.pageSize));

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-[var(--font-syne)] text-xl font-extrabold text-ink-primary">
            {title}
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">{description}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={createHref} aria-label={`Criar ${kind}`}>
            <IconPlus aria-hidden="true" size={16} />
            Criar
          </Link>
        </Button>
      </header>

      {isPending ? (
        <p role="status" className="p-5 text-sm text-ink-secondary">
          Carregando…
        </p>
      ) : error ? (
        <CollectionError error={error} onRetry={onRetry} />
      ) : items.length === 0 ? (
        <div className="p-6 text-center">
          <IconBarbell aria-hidden="true" className="mx-auto text-ink-brand" size={28} />
          <h3 className="mt-3 font-semibold text-ink-primary">
            {kind === "modelo"
              ? "Sua biblioteca está vazia"
              : "Nenhum plano semanal ainda"}
          </h3>
          <p className="mt-1 text-sm text-ink-secondary">
            {kind === "modelo"
              ? "Crie seu primeiro treino para reutilizar em diferentes planos."
              : "Combine treinos publicados em uma sequência semanal."}
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href={createHref}>
              {kind === "modelo" ? "Criar primeiro treino" : "Criar primeiro plano"}
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <Table aria-label={title}>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Nome</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Versão</TableHead>
                  <TableHead scope="col">Atualizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        className="font-semibold text-ink-primary underline-offset-4 hover:text-ink-brand hover:underline"
                        href={`/treinos/${item.id}?tipo=${kind}`}
                      >
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <TrainingStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>v{item.version}</TableCell>
                    <TableCell>{formatDate(item.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="space-y-3 p-4 md:hidden" aria-label={title}>
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  className="block rounded-lg border border-border p-4 focus-visible:outline-2 focus-visible:outline-brand-400"
                  href={`/treinos/${item.id}?tipo=${kind}`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-ink-primary">{item.name}</span>
                    <TrainingStatusBadge status={item.status} />
                  </span>
                  <span className="mt-2 block text-sm text-ink-secondary">
                    Versão {item.version} · Atualizado {formatDate(item.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {pageCount > 1 ? (
            <nav
              aria-label={`Paginação: ${title}`}
              className="flex items-center justify-between border-t border-border p-3"
            >
              <Button
                variant="outline"
                disabled={page <= 1 || isFetching}
                onClick={() => onPageChange(page - 1)}
              >
                <IconChevronLeft aria-hidden="true" size={16} /> Anterior
              </Button>
              <span className="text-xs text-ink-secondary">
                Página {page} de {pageCount}
              </span>
              <Button
                variant="outline"
                disabled={page >= pageCount || isFetching}
                onClick={() => onPageChange(page + 1)}
              >
                Próxima <IconChevronRight aria-hidden="true" size={16} />
              </Button>
            </nav>
          ) : null}
        </>
      )}
      {!isPending && !error ? (
        <p className="border-t border-border px-5 py-3 text-xs text-ink-tertiary">
          {totalCount} {totalCount === 1 ? "item" : "itens"}
        </p>
      ) : null}
    </section>
  );
}

function TrainingStatusBadge({ status }: { status: TrainingStatus }) {
  const label =
    status === "PUBLISHED"
      ? "Publicado"
      : status === "ARCHIVED"
        ? "Arquivado"
        : "Rascunho";
  const className =
    status === "PUBLISHED"
      ? "inline-flex rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text"
      : status === "ARCHIVED"
        ? "inline-flex rounded-full bg-page px-2.5 py-1 text-xs font-semibold text-ink-tertiary"
        : "inline-flex rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-ink-secondary";
  return <span className={className}>{label}</span>;
}

function CollectionError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const api = error instanceof NodusApiError ? error : null;
  return (
    <div role="alert" className="p-5">
      <p className="font-semibold text-ink-primary">
        Não foi possível carregar esta lista
      </p>
      <p className="mt-1 text-sm text-ink-secondary">
        {api?.message ?? "Tente novamente."}
      </p>
      {api?.status === 401 ? (
        <Button asChild className="mt-3">
          <Link href="/acesso?perfil=personal">Entrar novamente</Link>
        </Button>
      ) : (
        <Button className="mt-3" variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}
