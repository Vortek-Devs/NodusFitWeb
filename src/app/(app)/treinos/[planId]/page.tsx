import { Suspense } from "react";
import { TrainingContentEditorClient } from "@/components/training/training-content-editor-client";

export default async function TrainingContentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { planId } = await params;
  const { tipo } = await searchParams;
  const kind = tipo === "modelo" ? "modelo" : "plano";

  return (
    <Suspense fallback={<p role="status">Carregando conteúdo de treino…</p>}>
      <TrainingContentEditorClient kind={kind} resourceId={planId} />
    </Suspense>
  );
}
