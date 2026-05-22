import type { Metadata } from "next";
import { StudentWorkoutExecution } from "../../_components/student-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Execucao de treino | Nodus Fit",
  },
  description: "Preview aberto do estado de execucao de serie do treino do aluno.",
  alternates: {
    canonical: "/aluno/treino/executando",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentWorkoutExecutionPage() {
  return <StudentWorkoutExecution />;
}
