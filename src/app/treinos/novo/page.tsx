import type { Metadata } from "next";

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
    <iframe
      className="block h-dvh w-full border-0 bg-[#07100D]"
      src="/mockups/Personal_workout_builder.html"
      title="Cadastro de Treino"
    />
  );
}
