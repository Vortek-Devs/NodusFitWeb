import { Suspense } from "react";
import { TrainingPlanBuilderClient } from "@/components/training-plans/training-plan-builder-client";

export default function NewTrainingPlanPage() {
  return (
    <Suspense fallback={<p role="status">Carregando construtor de treino…</p>}>
      <TrainingPlanBuilderClient />
    </Suspense>
  );
}
