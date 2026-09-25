import type { Metadata } from "next";
import { StudentWorkoutSummary } from "../../_components/student-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Resumo do treino | Nodus Fit",
  },
  description: "Preview aberto do resumo pos-treino do aluno.",
  alternates: {
    canonical: "/aluno/treino/resumo",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentWorkoutSummaryPage() {
  return <StudentWorkoutSummary />;
}
