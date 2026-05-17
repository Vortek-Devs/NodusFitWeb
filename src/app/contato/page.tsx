import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public/public-page-shell";

export const metadata: Metadata = {
  title: "Contato | Nodus Fit",
  description: "Canal de contato e suporte do Nodus Fit.",
};

export default function ContactPage() {
  return (
    <PublicPageShell
      eyebrow="Contato"
      title="Fale com o Nodus Fit"
      description="Este ponto de contato sera refinado na tarefa de suporte. A rota ja fica disponivel para header, footer e futuras paginas publicas."
    >
      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-ink-brand">
          Atendimento inicial
        </p>
        <a
          className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-400 px-5 text-sm font-extrabold text-on-brand shadow-brand transition hover:bg-brand-500"
          href="mailto:contato@vortek.dev"
        >
          contato@vortek.dev
        </a>
      </div>
    </PublicPageShell>
  );
}
