import { notFound } from "next/navigation";
import { ExerciseForm } from "@/components/exercises/exercise-form";
import { isUuid } from "@/lib/contracts/students";

export default async function ExercisePage({
  params,
  searchParams,
}: {
  params: Promise<{ exerciseId: string }>;
  searchParams: Promise<{ saved?: string | string[] }>;
}) {
  const [{ exerciseId }, query] = await Promise.all([params, searchParams]);
  if (!isUuid(exerciseId)) notFound();

  return (
    <ExerciseForm
      exerciseId={exerciseId}
      initialAnnouncement={
        query.saved === "created" ? "Exercício criado com sucesso." : undefined
      }
    />
  );
}
