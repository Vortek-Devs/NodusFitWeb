import { Suspense } from "react";
import { TrainingContentEditorClient } from "@/components/training/training-content-editor-client";

export default async function NewTrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const kind = tipo === "plano" ? "plano" : "modelo";

  return (
    <Suspense fallback={<p role="status">Carregando editor de treino…</p>}>
      <TrainingContentEditorClient kind={kind} />
    </Suspense>
  );
}
