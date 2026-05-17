import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public/public-page-shell";

export const metadata: Metadata = {
  title: "Politica de Privacidade | Nodus Fit",
  description: "Politica de privacidade do Nodus Fit para personal trainers e alunos.",
};

export default function PrivacyPage() {
  return (
    <PublicPageShell
      eyebrow="Politica de Privacidade"
      title="Como o Nodus Fit trata dados pessoais"
      description="Esta pagina sera detalhada na tarefa dedicada de privacidade. Por enquanto, ela garante que a navegacao publica e os links institucionais ja estejam prontos para evoluir."
    >
      <p>
        O conteudo final deve cobrir dados coletados, finalidade de uso, base legal,
        compartilhamento, retencao, direitos dos titulares e canais de contato.
      </p>
      <p>
        Ate a versao final, nenhuma informacao sensivel deve ser considerada politica
        juridica publicada.
      </p>
    </PublicPageShell>
  );
}
