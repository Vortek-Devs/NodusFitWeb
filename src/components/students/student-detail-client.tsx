"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatNodusDate } from "@/features/students/format-student-date";
import { studentQueryKeys } from "@/features/students/student-query-keys";
import { getStudent } from "@/features/students/students-api";
import { StudentLoading, StudentQueryError } from "./student-query-state";
import { StudentStatusBadge } from "./student-status-badge";

export function StudentDetailClient({ studentId }: { studentId: string }) {
  const query = useQuery({
    queryKey: studentQueryKeys.detail(studentId),
    queryFn: ({ signal }) => getStudent(studentId, signal),
  });
  const student = query.data;
  return (
    <div className="space-y-5">
      <Button variant="outline" asChild>
        <Link href="/alunos">Voltar para alunos</Link>
      </Button>
      {query.isPending ? (
        <StudentLoading detail />
      ) : query.isError ? (
        <StudentQueryError
          detail
          error={query.error}
          retry={() => {
            void query.refetch();
          }}
        />
      ) : (
        student && (
          <article className="rounded-lg border border-border bg-surface p-5 sm:p-6">
            <p className="text-sm font-semibold text-ink-brand">Aluno vinculado</p>
            <h1 className="mt-1 break-words text-2xl font-bold text-ink-primary">
              {student.name}
            </h1>
            <div className="mt-3">
              <StudentStatusBadge status={student.status} />
            </div>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <Detail label="E-mail" value={student.email} />
              <Detail
                label="Status"
                value={student.status === "ACTIVE" ? "Ativo" : "Inativo"}
              />
              <Detail label="Vínculo" value={formatNodusDate(student.linkedAt)} />
              <Detail label="Telefone" value={student.telefone ?? "Não informado"} />
              <Detail
                label="Nascimento"
                value={
                  student.birthDate ? formatNodusDate(student.birthDate) : "Não informado"
                }
              />
            </dl>
          </article>
        )
      )}
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-ink-primary">{value}</dd>
    </div>
  );
}
