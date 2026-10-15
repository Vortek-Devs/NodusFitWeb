import { Suspense } from "react";
import { TrainingPlansListClient } from "@/components/training-plans/training-plans-list-client";

export default function TrainingPlansPage() {
  return (
    <Suspense fallback={<p role="status">Carregando planos…</p>}>
      <TrainingPlansListClient />
    </Suspense>
  );
}
