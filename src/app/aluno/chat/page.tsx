import type { Metadata } from "next";
import { StudentChat } from "../_components/student-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Chat do aluno | Nodus Fit",
  },
  description: "Preview aberto do chat entre aluno e personal.",
  alternates: {
    canonical: "/aluno/chat",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentChatPage() {
  return <StudentChat />;
}
