import { Suspense } from "react";
import { TrainingContentEditorClient } from "@/components/training/training-content-editor-client";
import { isUuid } from "@/lib/contracts/students";

export default async function NewTrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; studentId?: string }>;
}) {
  const { tipo, studentId } = await searchParams;
  const kind = tipo === "plano" ? "plano" : "modelo";
  const initialStudentId = kind === "plano" && isUuid(studentId) ? studentId : undefined;

  return (
    <Suspense fallback={<p role="status">Carregando editor de treino…</p>}>
      <TrainingContentEditorClient kind={kind} initialStudentId={initialStudentId} />
    </Suspense>
  );
}
