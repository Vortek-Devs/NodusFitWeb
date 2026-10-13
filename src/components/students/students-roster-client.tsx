"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconSearch,
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
import { type FormEvent, useLayoutEffect, useRef, useState } from "react";
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
import { formatNodusDate } from "@/features/students/format-student-date";
import {
  DEFAULT_STUDENT_FILTERS,
  hasActiveStudentFilters,
  normalizeStudentListFilter,
  studentFiltersToSearchParams,
  studentQueryKeys,
} from "@/features/students/student-query-keys";
import { createStudentInvite, listStudents } from "@/features/students/students-api";
import { useMountEffect } from "@/hooks/use-mount-effect";
import type { CreatedInvite } from "@/lib/contracts/nodus-api";
import type { StudentListFilter, StudentListItem } from "@/lib/contracts/students";
import { cn } from "@/lib/utils";
import { StudentLoading, StudentQueryError } from "./student-query-state";
import { StudentStatusBadge } from "./student-status-badge";

const features = tableFeatures({
  columnFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
});
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";
const EMPTY_STUDENTS: StudentListItem[] = [];
const columns: ColumnDef<typeof features, StudentListItem>[] = [
  { accessorKey: "name", header: "Aluno" },
  { accessorKey: "email", header: "E-mail", enableSorting: false },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => <StudentStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "linkedAt",
    header: "Vínculo",
    cell: ({ row }) => formatNodusDate(row.original.linkedAt),
  },
  {
    id: "actions",
    header: "Ações",
    enableSorting: false,
    cell: ({ row }) => (
      <Button variant="ghost" asChild>
        <Link
          href={`/alunos/${row.original.id}`}
          aria-label={`Ver aluno ${row.original.name}`}
        >
          Ver aluno
        </Link>
      </Button>
    ),
  },
];

export function StudentsRosterClient() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [inviteFormOpen, setInviteFormOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePending, setInvitePending] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteCopyError, setInviteCopyError] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    invite: CreatedInvite;
    email: string;
  } | null>(null);
  const inviteOperation = useRef<{ email: string; id: string } | null>(null);
  const filters = normalizeStudentListFilter(params);
  const query = useQuery({
    queryKey: studentQueryKeys.list(filters),
    queryFn: ({ signal }) => listStudents(filters, signal),
    placeholderData: keepPreviousData,
  });
  const table = useTable({
    features,
    data: query.data?.items ?? EMPTY_STUDENTS,
    columns,
    getRowId: (student) => student.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: query.data?.totalCount ?? 0,
    state: {
      pagination: { pageIndex: filters.page - 1, pageSize: 20 },
      sorting: [{ id: filters.sortBy, desc: filters.sortDirection === "desc" }],
    },
  });

  async function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;

    if (!inviteOperation.current || inviteOperation.current.email !== email) {
      inviteOperation.current = { email, id: crypto.randomUUID() };
    }
    setInvitePending(true);
    setInviteError("");
    setInviteCopyError("");
    setInviteCopied(false);
    try {
      const result = await createStudentInvite({
        email,
        operationId: inviteOperation.current.id,
      });
      setInviteResult({ invite: result, email });
      inviteOperation.current = null;
    } catch {
      setInviteError(
        "Não foi possível gerar o convite. Confira o e-mail e tente novamente.",
      );
    } finally {
      setInvitePending(false);
    }
  }

  async function copyInviteLink() {
    if (!inviteResult) return;
    try {
      await navigator.clipboard.writeText(inviteResult.invite.link);
      setInviteCopied(true);
      setInviteCopyError("");
    } catch {
      setInviteCopied(false);
      setInviteCopyError("Não foi possível copiar. Selecione o link para copiá-lo.");
    }
  }

  function update(patch: Partial<StudentListFilter>) {
    const next = studentFiltersToSearchParams(
      normalizeStudentListFilter({ ...filters, ...patch }),
    );
    router.replace(`${pathname}?${next}`, { scroll: false });
  }
  const data = query.data;
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-sm font-semibold text-ink-brand">Gestão do personal</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-ink-primary">
            <IconUsers aria-hidden="true" size={28} />
            Alunos
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            {data && !query.isError
              ? query.isPlaceholderData
                ? "Atualizando vínculos…"
                : `${data.totalCount} vínculos encontrados`
              : "Consulte seus alunos vinculados."}
          </p>
        </div>
        <Button
          onClick={() => setInviteFormOpen((open) => !open)}
          type="button"
          variant={inviteFormOpen ? "outline" : "default"}
        >
          {inviteFormOpen ? "Fechar convite" : "Convidar aluno"}
        </Button>
      </header>
      {inviteFormOpen ? (
        <section
          aria-labelledby="student-invite-title"
          className="rounded-xl border border-border bg-surface p-4 sm:p-5"
        >
          <h2 className="font-bold text-ink-primary" id="student-invite-title">
            Convite para aluno
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">
            Gere um link individual para o aluno criar a conta e se vincular ao seu
            espaço.
          </p>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
            onSubmit={(event) => void submitInvite(event)}
          >
            <div>
              <label
                className="mb-1 block text-sm font-semibold text-ink-primary"
                htmlFor="student-invite-email"
              >
                E-mail do aluno
              </label>
              <Input
                autoComplete="off"
                disabled={invitePending}
                id="student-invite-email"
                maxLength={254}
                onChange={(event) => {
                  const value = event.target.value;
                  if (inviteOperation.current?.email !== value.trim().toLowerCase())
                    inviteOperation.current = null;
                  setInviteEmail(value);
                  setInviteResult(null);
                  setInviteError("");
                  setInviteCopyError("");
                  setInviteCopied(false);
                }}
                required
                type="email"
                value={inviteEmail}
              />
            </div>
            <Button disabled={invitePending} type="submit">
              {invitePending ? "Gerando convite…" : "Gerar convite"}
            </Button>
          </form>
          {inviteError ? (
            <p className="mt-3 text-sm text-danger-text" role="alert">
              {inviteError}
            </p>
          ) : null}
          {inviteResult ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm font-semibold text-ink-primary" role="status">
                Convite criado para {inviteResult.email}.
              </p>
              <p className="mt-1 text-sm text-ink-secondary">
                Expira em{" "}
                {new Date(inviteResult.invite.expiresAt).toLocaleString("pt-BR")}.
              </p>
              <label
                className="mb-1 mt-3 block text-sm font-semibold text-ink-primary"
                htmlFor="student-invite-link"
              >
                Link do convite
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  className="min-w-0"
                  id="student-invite-link"
                  readOnly
                  value={inviteResult.invite.link}
                />
                <Button
                  onClick={() => void copyInviteLink()}
                  type="button"
                  variant="outline"
                >
                  <IconCopy aria-hidden="true" size={17} />
                  {inviteCopied ? "Copiado" : "Copiar link"}
                </Button>
              </div>
              {inviteCopyError ? (
                <p className="mt-2 text-sm text-danger-text" role="alert">
                  {inviteCopyError}
                </p>
              ) : null}
              <a
                className={cn(
                  "mt-3 inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-ink-brand underline underline-offset-4",
                  focus,
                )}
                href={inviteResult.invite.link}
                rel="noopener noreferrer"
                target="_blank"
              >
                Abrir convite
              </a>
            </div>
          ) : null}
        </section>
      ) : null}
      <FilterEditor filters={filters} update={update} />
      {query.isPending ? (
        <StudentLoading />
      ) : query.isError ? (
        <StudentQueryError
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
                Atualizando alunos…
              </p>
            )}
            {data.totalCount === 0 ? (
              <section className="rounded-lg border border-border bg-surface p-6 text-center">
                <h2 className="font-bold text-ink-primary">
                  {hasActiveStudentFilters(filters)
                    ? "Nenhum aluno corresponde aos filtros"
                    : "Nenhum aluno vinculado"}
                </h2>
                <p className="mt-2 text-sm text-ink-secondary">
                  {hasActiveStudentFilters(filters)
                    ? "Ajuste a busca ou limpe os filtros."
                    : "Os alunos aparecerão aqui depois que um convite for aceito."}
                </p>
                {hasActiveStudentFilters(filters) && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => update(DEFAULT_STUDENT_FILTERS)}
                  >
                    Limpar filtros
                  </Button>
                )}
              </section>
            ) : (
              <>
                {data.items.length === 0 ? (
                  <section className="rounded-lg border border-border bg-surface p-6">
                    <h2 className="font-bold text-ink-primary">
                      Nenhum aluno nesta página
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
                  <>
                    <div
                      className="hidden rounded-lg border border-border bg-surface md:block"
                      aria-busy={query.isFetching}
                    >
                      <Table aria-label="Alunos vinculados">
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
                                <TableCell className="break-words" key={cell.id}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <ul
                      className="grid gap-3 md:hidden"
                      aria-label="Alunos vinculados"
                      aria-busy={query.isFetching}
                    >
                      {data.items.map((student) => (
                        <li
                          key={student.id}
                          className="min-w-0 rounded-lg border border-border bg-surface p-4"
                        >
                          <Link
                            className="block min-h-11 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
                            href={`/alunos/${student.id}`}
                          >
                            <span className="break-words font-semibold text-ink-primary">
                              {student.name}
                            </span>
                            <span className="mt-1 block break-all text-sm text-ink-secondary">
                              {student.email}
                            </span>
                            <span className="mt-3 block">
                              <StudentStatusBadge status={student.status} />
                            </span>
                            <span className="mt-3 block text-sm text-ink-secondary">
                              Vínculo: {formatNodusDate(student.linkedAt)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <nav
                  aria-label="Paginação dos alunos"
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

function FilterEditor({
  filters,
  update,
}: {
  filters: StudentListFilter;
  update: (patch: Partial<StudentListFilter>) => void;
}) {
  const urlKey = studentFiltersToSearchParams(filters).toString();
  const [editor, setEditor] = useState({
    urlKey,
    draft: filters.search ?? "",
    pending: [] as string[],
    navigation: 0,
  });
  // Acknowledging our own request must not replace a newer draft or cancel its timer.
  // External navigation resets the draft, but leaves the actual form controls mounted.
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
  function submit(patch: Partial<StudentListFilter>) {
    const target = studentFiltersToSearchParams(
      normalizeStudentListFilter({ ...filters, ...patch }),
    ).toString();
    if (target !== urlKey)
      setEditor((current) => ({ ...current, pending: [...current.pending, target] }));
    update(patch);
  }
  const latestSubmit = useRef(submit);
  // Synchronize the external timer with the latest committed URL filters.
  useLayoutEffect(() => {
    latestSubmit.current = submit;
  });
  const selectClass =
    "min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_220px]">
      <FilterTimerBoundary key={editor.navigation} cancel={cancel} />
      <div className="relative">
        <IconSearch
          className="pointer-events-none absolute left-3 top-3 text-ink-tertiary"
          size={20}
          aria-hidden="true"
        />
        <Input
          className="pl-10"
          aria-label="Buscar por nome ou e-mail"
          placeholder="Buscar por nome ou e-mail"
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
      <select
        className={selectClass}
        aria-label="Filtrar por status"
        value={filters.status ?? ""}
        onChange={(event) => {
          cancel();
          submit({
            page: 1,
            search: draft,
            status:
              event.target.value === "ACTIVE" || event.target.value === "INACTIVE"
                ? event.target.value
                : undefined,
          });
        }}
      >
        <option value="">Todos os status</option>
        <option value="ACTIVE">Ativos</option>
        <option value="INACTIVE">Inativos</option>
      </select>
      <select
        className={selectClass}
        aria-label="Ordenar alunos"
        value={`${filters.sortBy}:${filters.sortDirection}`}
        onChange={(event) => {
          cancel();
          const [sortBy, sortDirection] = event.target.value.split(":");
          submit({
            page: 1,
            search: draft,
            sortBy: sortBy === "linkedAt" ? "linkedAt" : "name",
            sortDirection: sortDirection === "desc" ? "desc" : "asc",
          });
        }}
      >
        <option value="name:asc">Nome A–Z</option>
        <option value="name:desc">Nome Z–A</option>
        <option value="linkedAt:desc">Vínculo mais recente</option>
        <option value="linkedAt:asc">Vínculo mais antigo</option>
      </select>
    </div>
  );
}

function FilterTimerBoundary({ cancel }: { cancel: () => void }) {
  useMountEffect(() => cancel);
  return null;
}
