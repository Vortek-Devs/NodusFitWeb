import type { Metadata } from "next";
import {
  MockupContentFrame,
  PersonalPreviewShell,
} from "../../_components/personal-preview-shell";

export const metadata: Metadata = {
  title: "Cadastro de Treino",
  description: "Preview aberto da tela de cadastro de treino do personal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewWorkoutPage() {
  return (
    <PersonalPreviewShell active="treinos">
      <MockupContentFrame
        src="/mockups/Personal_workout_builder.html"
        title="Cadastro de Treino"
      />
    </PersonalPreviewShell>
  );
}
