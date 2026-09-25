import type { Metadata } from "next";
import { StudentWelcome } from "../_components/student-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Boas-vindas do aluno | Nodus Fit",
  },
  description: "Preview aberto do onboarding do aluno apos aceite do convite.",
  alternates: {
    canonical: "/aluno/bem-vindo",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentWelcomePage() {
  return <StudentWelcome />;
}
