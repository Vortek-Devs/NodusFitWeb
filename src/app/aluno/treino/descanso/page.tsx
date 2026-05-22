import type { Metadata } from "next";
import { StudentWorkoutRest } from "../../_components/student-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Descanso do treino | Nodus Fit",
  },
  description: "Preview aberto do timer de descanso do treino do aluno.",
  alternates: {
    canonical: "/aluno/treino/descanso",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentWorkoutRestPage() {
  return <StudentWorkoutRest />;
}
