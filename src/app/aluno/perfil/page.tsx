import type { Metadata } from "next";
import { StudentProfile } from "../_components/student-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Perfil do aluno | Nodus Fit",
  },
  description: "Preview aberto do perfil do aluno com dados mockados.",
  alternates: {
    canonical: "/aluno/perfil",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentProfilePage() {
  return <StudentProfile />;
}
