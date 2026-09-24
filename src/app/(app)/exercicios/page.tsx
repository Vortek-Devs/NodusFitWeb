import { Suspense } from "react";
import { ExerciseLoading } from "@/components/exercises/exercise-query-state";
import { ExercisesCatalogClient } from "@/components/exercises/exercises-catalog-client";

export default function ExercisesPage() {
  return (
    <Suspense fallback={<ExerciseLoading />}>
      <ExercisesCatalogClient />
    </Suspense>
  );
}
