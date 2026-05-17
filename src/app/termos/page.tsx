import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public/public-page-shell";

export const metadata: Metadata = {
  title: "Termos de Uso | Nodus Fit",
  description: "Termos de uso do Nodus Fit para personal trainers e alunos.",
};

export default function TermsPage() {
  return (
    <PublicPageShell
      eyebrow="Termos de Uso"
      title="Regras de uso da plataforma"
      description="Esta pagina prepara o espaco publico para os termos oficiais do Nodus Fit, mantendo a navegacao institucional consistente desde agora."
    >
      <p>
        A versao final deve explicar responsabilidades do personal, experiencia do aluno,
        limites de uso, pagamentos, cancelamentos, disponibilidade e suporte.
      </p>
      <p>
        O texto atual e um placeholder tecnico e sera substituido na tarefa especifica de
        termos.
      </p>
    </PublicPageShell>
  );
}
