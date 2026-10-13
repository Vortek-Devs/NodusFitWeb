import { Suspense } from "react";
import { TrainingContentEditorClient } from "@/components/training/training-content-editor-client";
import { isUuid } from "@/lib/contracts/students";

export default async function TrainingContentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ tipo?: string; studentId?: string; publicacao?: string }>;
}) {
  const { planId } = await params;
  const { tipo, studentId, publicacao } = await searchParams;
  const kind = tipo === "modelo" ? "modelo" : "plano";
  const initialStudentId = kind === "plano" && isUuid(studentId) ? studentId : undefined;

  return (
    <Suspense fallback={<p role="status">Carregando conteúdo de treino…</p>}>
      <TrainingContentEditorClient
        initialStudentId={initialStudentId}
        kind={kind}
        publishPending={publicacao === "pendente"}
        resourceId={planId}
      />
    </Suspense>
  );
}
