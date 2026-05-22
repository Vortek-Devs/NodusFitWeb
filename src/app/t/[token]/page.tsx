import type { Metadata } from "next";
import { PublicWorkoutLink } from "../../aluno/_components/student-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Link publico de treino | Nodus Fit",
  },
  description: "Preview aberto do link publico de treino compartilhado com aluno.",
  alternates: {
    canonical: "/t/demo-token",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicWorkoutLinkPage() {
  return <PublicWorkoutLink />;
}
