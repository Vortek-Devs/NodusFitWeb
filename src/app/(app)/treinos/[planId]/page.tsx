import { Suspense } from "react";
import { TrainingPlanBuilderClient } from "@/components/training-plans/training-plan-builder-client";

export default async function TrainingPlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  return (
    <Suspense fallback={<p role="status">Carregando plano…</p>}>
      <TrainingPlanBuilderClient planId={planId} />
    </Suspense>
  );
}
