import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public/public-page-shell";

export const metadata: Metadata = {
  title: "Contato | Nodus Fit",
  description:
    "Fale com o Nodus Fit para dúvidas comerciais, suporte inicial e orientações para personal trainers e alunos.",
};

const contactEmail = "contato@vortek.dev";

const contactOptions = [
  {
    title: "Personal interessado",
    description:
      "Quer entender se o Nodus Fit encaixa na sua rotina de atendimento? Conte como você acompanha seus alunos hoje e o que precisa organizar primeiro.",
    href: `mailto:${contactEmail}?subject=Quero%20conhecer%20o%20Nodus%20Fit`,
    label: "Falar sobre o produto",
  },
  {
    title: "Aluno com dúvida",
    description:
      "Se você recebeu acesso de um personal ou tem dúvidas sobre treinos, registros e acompanhamento, envie o contexto para direcionarmos o atendimento.",
    href: `mailto:${contactEmail}?subject=D%C3%BAvida%20de%20aluno%20no%20Nodus%20Fit`,
    label: "Enviar dúvida",
  },
  {
    title: "Suporte geral",
    description:
      "Use este canal para relatar problema de acesso, comportamento inesperado, solicitação institucional ou qualquer assunto que não se encaixe nas opções acima.",
    href: `mailto:${contactEmail}?subject=Suporte%20Nodus%20Fit`,
    label: "Pedir suporte",
  },
];

const messageChecklist = [
  "Seu nome e melhor email para retorno.",
  "Se você está falando como personal, aluno ou visitante.",
  "Uma descrição objetiva do que aconteceu ou do que você quer resolver.",
  "Prints, links ou dados de contexto quando isso ajudar no diagnóstico.",
];

export default function ContactPage() {
  return (
    <PublicPageShell
      eyebrow="Contato"
      title="Fale com o Nodus Fit"
      description="Use este canal para falar sobre o produto, tirar dúvidas iniciais ou pedir suporte. Nesta primeira versão, o atendimento acontece por email."
    >
      <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-ink-brand">
          Canal provisório
        </p>
        <h2 className="mt-3">Atendimento por email</h2>
        <p className="mt-3">
          Enquanto os canais oficiais de suporte e WhatsApp não estão configurados, use o
          email abaixo para falar com o time do Nodus Fit. Respondemos pelo mesmo canal
          assim que possível.
        </p>
        <a
          className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-400 px-5 text-sm font-extrabold !text-on-brand !no-underline shadow-brand transition hover:bg-brand-500 hover:!no-underline"
          href={`mailto:${contactEmail}`}
        >
          {contactEmail}
        </a>
      </section>

      <section className="space-y-4">
        <h2>Escolha o melhor caminho</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {contactOptions.map((option) => (
            <article
              className="flex flex-col rounded-lg border border-border bg-surface p-5 shadow-card"
              key={option.title}
            >
              <h3 className="text-lg font-extrabold text-brand-50">{option.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-ink-secondary">
                {option.description}
              </p>
              <a
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-400 px-4 text-center text-sm font-extrabold !text-brand-300 !no-underline transition hover:bg-brand-400 hover:!text-on-brand hover:!no-underline"
                href={option.href}
              >
                {option.label}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2>O que enviar na mensagem</h2>
        <p>
          Para acelerar o retorno, inclua as informações mais importantes logo no primeiro
          email:
        </p>
        <ul>
          {messageChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2>Antes de enviar</h2>
        <p>
          Pedidos relacionados a dados pessoais e LGPD devem ser enviados pelo canal de
          privacidade indicado na <a href="/privacidade">Política de Privacidade</a>.
          Dúvidas sobre regras de uso, assinatura e responsabilidades ficam descritas nos{" "}
          <a href="/termos">Termos de Uso</a>.
        </p>
      </section>
    </PublicPageShell>
  );
}
