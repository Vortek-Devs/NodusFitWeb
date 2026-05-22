import type { Metadata } from "next";
import { StudentInvitePreview } from "../../aluno/_components/student-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Convite do aluno | Nodus Fit",
  },
  description: "Preview aberto do cadastro via convite do aluno, sem integrar auth.",
  alternates: {
    canonical: "/acesso/aluno-preview",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentInvitePreviewPage() {
  return <StudentInvitePreview />;
}
