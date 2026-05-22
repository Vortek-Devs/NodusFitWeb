import type { Metadata } from "next";
import { StudentEvolution } from "../_components/student-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Evolucao do aluno | Nodus Fit",
  },
  description: "Preview aberto de metricas, grafico e historico de evolucao do aluno.",
  alternates: {
    canonical: "/aluno/evolucao",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentEvolutionPage() {
  return <StudentEvolution />;
}
