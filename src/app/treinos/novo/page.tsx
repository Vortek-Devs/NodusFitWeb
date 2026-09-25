import type { Metadata } from "next";
import { WorkoutBuilderPreview } from "./_components/workout-builder-preview";

export const metadata: Metadata = {
  title: "Cadastro de Treino",
  description: "Preview aberto da tela de cadastro de treino do personal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewWorkoutPage() {
  return <WorkoutBuilderPreview />;
}
