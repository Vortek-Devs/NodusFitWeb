import {
  IconArrowRight,
  IconBarbell,
  IconBolt,
  IconCalendar,
  IconCheck,
  IconChevronRight,
  IconUsers,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LandingV3Motion } from "@/components/landing/landing-v3-motion";
import { createPublicPageMetadata } from "@/lib/seo";

const personalAccessHref = "/acesso?perfil=personal";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Nodus Fit | Do seu catálogo à semana do aluno",
  description:
    "Organize alunos, exercícios, modelos de treino e planos semanais em um só espaço para personal trainers.",
  path: "",
});

const workflow = [
  {
    number: "01",
    eyebrow: "BASE",
    title: "Alunos",
    detail: "Convites e vínculos no seu espaço.",
    icon: IconUsers,
  },
  {
    number: "02",
    eyebrow: "CATÁLOGO",
    title: "Exercícios",
    detail: "Modalidade, equipamento e grupos musculares.",
    icon: IconBarbell,
  },
  {
    number: "03",
    eyebrow: "PRESCRIÇÃO",
    title: "Modelo de treino",
    detail: "Séries, repetições, carga e descanso.",
    icon: IconCheck,
  },
  {
    number: "04",
    eyebrow: "DISTRIBUIÇÃO",
    title: "Plano semanal",
    detail: "Organize por dia e atribua ao aluno.",
    icon: IconCalendar,
  },
];

const capabilities = [
  {
    number: "01",
    label: "CARTEIRA",
    title: "Alunos no seu espaço",
    body: "Convide e acompanhe vínculos e status a partir da sua carteira de alunos.",
    icon: IconUsers,
  },
  {
    number: "02",
    label: "MOVIMENTOS",
    title: "Uma biblioteca organizada",
    body: "Busque ou cadastre exercícios por modalidade, equipamento e grupos musculares.",
    icon: IconBarbell,
  },
  {
    number: "03",
    label: "PRESCRIÇÃO",
    title: "Seu método, reutilizável",
    body: "Monte modelos com séries, faixa de repetições, carga sugerida, descanso e orientações.",
    icon: IconCheck,
  },
  {
    number: "04",
    label: "SEMANA",
    title: "Do modelo ao aluno",
    body: "Combine modelos publicados por dia da semana e atribua o plano a um aluno ativo.",
    icon: IconCalendar,
  },
];

const questions = [
  {
    question: "O que posso fazer no Nodus hoje?",
    answer:
      "Organizar alunos, pesquisar ou cadastrar exercícios, criar e publicar modelos de treino, montar planos semanais e atribuí-los a alunos ativos.",
  },
  {
    question: "Posso alterar um modelo depois de publicar?",
    answer:
      "A versão publicada fica preservada. Para mudar a prescrição, você cria um novo rascunho e publica outra versão.",
  },
  {
    question: "O plano atribuído muda quando publico uma nova versão?",
    answer:
      "Não. O plano continua ligado à versão que foi atribuída. Uma nova publicação não sobrescreve o histórico existente.",
  },
];

export default function Home() {
  return (
    <div className="landing-v3 home-v4">
      <LandingV3Motion />
      <a className="home-skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Navigation />
      <main id="conteudo">
        <Hero />
        <CapabilityBand />
        <Capabilities />
        <Versioning />
        <WorkflowSection />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

function Navigation() {
  return (
    <nav aria-label="Navegação principal" className="nav">
      <div className="nav-i">
        <Link className="nav-logo" href="/" aria-label="Nodus Fit — início">
          <BrandMark />
          <span className="nav-brand">
            NODUS <em>FIT</em>
          </span>
        </Link>
        <div className="nav-links">
          <a className="nav-a" href="#recursos">
            Recursos
          </a>
          <a className="nav-a" href="#fluxo">
            Como funciona
          </a>
          <a className="nav-a" href="#duvidas">
            Dúvidas
          </a>
          <Link className="nav-cta home-nav-cta" href={personalAccessHref}>
            Entrar
          </Link>
        </div>
      </div>
    </nav>
  );
}

function BrandMark() {
  return (
    <span className="nav-mark" aria-hidden="true">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      >
        <circle cx="10" cy="10" r="3" />
        <path d="M2 10h5M13 10h5M10 2v5M10 13v5" />
      </svg>
    </span>
  );
}

function Hero() {
  return (
    <section className="hero home-hero dot-tex">
      <div className="hero-glow-static" aria-hidden="true" />
      <div className="hero-cursor-glow" aria-hidden="true" />
      <div className="hero-in wrap home-hero-grid">
        <div className="home-hero-copy">
          <div data-r="up">
            <span className="pill">
              <IconBolt size={14} aria-hidden="true" />
              GESTÃO DE TREINOS PARA PERSONAL
            </span>
          </div>
          <h1
            aria-label="Do seu catálogo à semana do aluno."
            className="hero-h1"
            data-d="1"
            data-r="up"
          >
            Do seu catálogo
            <br />
            <span className="grad">à semana do aluno.</span>
          </h1>
          <p className="hero-sub" data-d="2" data-r="up">
            Organize alunos, cadastre exercícios, monte modelos de treino e distribua
            planos semanais no mesmo espaço.
          </p>
          <div className="hero-actions" data-d="3" data-r="up">
            <Link className="btn-p home-hero-primary" href={personalAccessHref}>
              Organizar meu próximo treino <IconArrowRight size={18} aria-hidden="true" />
            </Link>
            <a className="btn-g home-hero-secondary" href="#fluxo">
              Ver o fluxo
            </a>
          </div>
          <ul className="home-hero-points" data-d="4" data-r="up">
            <li>Alunos e vínculos</li>
            <li>Biblioteca de exercícios</li>
            <li>Modelos versionados</li>
          </ul>
        </div>
        <WorkflowPreview />
      </div>
    </section>
  );
}

function WorkflowPreview() {
  return (
    <figure
      aria-labelledby="home-flow-title"
      className="home-flow-panel"
      data-d="2"
      data-r="left"
    >
      <div className="home-flow-top">
        <div className="home-flow-brand">
          <BrandMark />
          <span>
            <strong>NODUS FIT</strong>
            <small>FLUXO DE PRESCRIÇÃO</small>
          </span>
        </div>
        <span className="home-flow-status">DO EXERCÍCIO AO PLANO</span>
      </div>
      <div className="home-flow-heading">
        <p>UM ESPAÇO PARA O SEU MÉTODO</p>
        <h2 id="home-flow-title">Cada etapa deixa a próxima mais clara.</h2>
      </div>
      <ol className="home-flow-list">
        {workflow.map(({ detail, eyebrow, icon: Icon, number, title }) => (
          <li className="home-flow-step" key={number}>
            <span className="home-flow-number">{number}</span>
            <span className="home-flow-step-copy">
              <span className="home-flow-eyebrow">{eyebrow}</span>
              <strong>{title}</strong>
              <span>{detail}</span>
            </span>
            <Icon aria-hidden="true" className="home-flow-icon" size={19} stroke={1.8} />
          </li>
        ))}
      </ol>
      <figcaption className="home-flow-caption">
        <span aria-hidden="true" className="home-flow-caption-mark">
          <IconCheck size={14} stroke={2.4} />
        </span>
        A versão atribuída permanece registrada.
      </figcaption>
    </figure>
  );
}

function CapabilityBand() {
  return (
    <section
      aria-labelledby="home-capability-band-title"
      className="home-capability-band"
    >
      <h2 className="sr-only" id="home-capability-band-title">
        Áreas do fluxo atual
      </h2>
      <div className="home-capability-band-inner">
        <span>ALUNOS</span>
        <i aria-hidden="true" />
        <span>EXERCÍCIOS</span>
        <i aria-hidden="true" />
        <span>MODELOS</span>
        <i aria-hidden="true" />
        <span>PLANOS SEMANAIS</span>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="sec mid home-capabilities" id="recursos">
      <div className="wrap">
        <SectionHeader
          eyebrow="O espaço de trabalho"
          title="Cada parte do treino tem seu lugar."
        >
          Do cadastro dos movimentos à distribuição semanal, cada parte tem um lugar
          próprio.
        </SectionHeader>
        <div className="home-capability-grid">
          {capabilities.map(({ body, icon: Icon, label, number, title }) => (
            <article className="home-capability-card" key={number}>
              <div className="home-capability-card-top">
                <span className="home-capability-number">{number}</span>
                <span className="home-capability-icon">
                  <Icon aria-hidden="true" size={20} stroke={1.8} />
                </span>
              </div>
              <p className="home-capability-label">{label}</p>
              <h3>{title}</h3>
              <p className="home-capability-body">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Versioning() {
  return (
    <section className="sec dark home-version-section" id="versoes">
      <div className="wrap home-version-grid">
        <div className="home-version-copy" data-r="right">
          <span className="pill lt">CONTROLE DE VERSÃO</span>
          <h2 className="home-version-title">
            Publicou? <em>A versão fica preservada.</em>
          </h2>
          <p>
            Quando a prescrição mudar, crie um novo rascunho. A versão que já foi
            atribuída não é sobrescrita.
          </p>
          <a className="home-text-link" href="#fluxo">
            Entenda o fluxo <IconArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <figure
          aria-label="Representação do controle de versão: uma versão publicada e um novo rascunho"
          className="home-version-demo"
          data-r="left"
        >
          <div className="home-version-card is-published">
            <span className="home-version-state">
              <IconCheck size={13} aria-hidden="true" /> VERSÃO PUBLICADA
            </span>
            <strong>Prescrição mantida</strong>
            <span>O plano continua apontando para esta versão.</span>
          </div>
          <div aria-hidden="true" className="home-version-connector">
            <span />
          </div>
          <div className="home-version-card is-draft">
            <span className="home-version-state">NOVO RASCUNHO</span>
            <strong>Ajustes sem sobrescrever</strong>
            <span>Revise e publique quando estiver pronto.</span>
          </div>
          <figcaption className="home-version-caption">
            Representação do fluxo de versão.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function WorkflowSection() {
  const steps = [
    ["01", "Organize sua base", "Convide alunos e mantenha os vínculos no seu espaço."],
    [
      "02",
      "Prepare a prescrição",
      "Escolha exercícios e ajuste séries, repetições, carga e descanso.",
    ],
    [
      "03",
      "Distribua a semana",
      "Combine modelos publicados e atribua o plano ao aluno ativo.",
    ],
  ];

  return (
    <section className="sec light home-steps-section" id="fluxo">
      <div className="wrap">
        <SectionHeader
          centered
          eyebrow="Como funciona"
          title="Do catálogo à atribuição, sem pular etapas."
        >
          Organize a base, prescreva seu método e distribua o plano para o aluno certo.
        </SectionHeader>
        <div className="steps-g home-steps-grid">
          {steps.map(([number, title, body], index) => (
            <article
              className="step home-step"
              data-d={index + 1}
              data-r="up"
              key={number}
            >
              <div className="step-n">{number}</div>
              <h3 className="step-t">{title}</h3>
              <p className="step-b">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="sec mid home-faq-section" id="duvidas">
      <div className="wrap">
        <SectionHeader eyebrow="Antes de começar" title="Perguntas sobre o fluxo.">
          Respostas diretas sobre o que acontece com seus modelos e planos.
        </SectionHeader>
        <div className="faq-list" data-r="up">
          {questions.map(({ answer, question }, index) => (
            <div className="faq-item" key={question}>
              <button
                aria-controls={`home-faq-answer-${index}`}
                aria-expanded="false"
                className="faq-q"
                type="button"
              >
                {question}
                <span aria-hidden="true" className="faq-icon">
                  <IconChevronRight size={20} />
                </span>
              </button>
              <div className="faq-a-wrap" id={`home-faq-answer-${index}`}>
                <div className="faq-a">{answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="cta-sec dot-tex home-final-cta">
      <div className="wrap cta-in" data-r="up">
        <span className="cta-eyebrow">
          <IconBolt size={14} aria-hidden="true" /> NODUS FIT
        </span>
        <h2 className="cta-h">
          Comece pelo <em>próximo plano semanal.</em>
        </h2>
        <p className="cta-sub">
          Acesse seu espaço de personal para organizar alunos, exercícios e planos de
          treino.
        </p>
        <div className="cta-acts">
          <Link className="btn-p cta-primary" href={personalAccessHref}>
            Acessar ou criar conta <IconArrowRight size={19} aria-hidden="true" />
          </Link>
          <Link className="btn-g cta-secondary" href="/contato">
            Falar com a equipe
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer home-footer">
      <div className="footer-i">
        <Link className="ft-brand" href="/" aria-label="Nodus Fit — início">
          NODUS <em>FIT</em>
        </Link>
        <div className="ft-links">
          <Link className="ft-a" href="/privacidade">
            Privacidade
          </Link>
          <Link className="ft-a" href="/termos">
            Termos
          </Link>
          <Link className="ft-a" href="/contato">
            Contato
          </Link>
        </div>
        <div className="ft-copy">Nodus Fit</div>
      </div>
    </footer>
  );
}

function SectionHeader({
  centered = false,
  children,
  eyebrow,
  title,
}: {
  centered?: boolean;
  children: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className={`sh ${centered ? "ctr" : ""}`} data-r="up">
      <span className="pill">{eyebrow}</span>
      <h2 className="sh-title">{title}</h2>
      <p className="sh-body">{children}</p>
    </div>
  );
}
