import type { Metadata } from "next";
import { StudentWorkoutHome } from "../_components/student-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Treino do aluno | Nodus Fit",
  },
  description: "Preview aberto da home do aluno com treino do dia e dados mockados.",
  alternates: {
    canonical: "/aluno/treino",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentWorkoutPage() {
  return <StudentWorkoutHome />;
}
