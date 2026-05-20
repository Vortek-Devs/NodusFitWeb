import {
  IconArrowRight,
  IconBarbell,
  IconBolt,
  IconBrandWhatsapp,
  IconChartLine,
  IconCheck,
  IconDeviceMobile,
  IconDeviceMobileCheck,
  IconLink,
  IconPlayerPlayFilled,
  IconPlus,
  IconReceipt,
  IconRun,
  IconStarFilled,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LandingV3Motion } from "@/components/landing/landing-v3-motion";
import { createPublicPageMetadata } from "@/lib/seo";

const mailTo = "mailto:contato@vortek.dev?subject=Beta%20Nodus%20Fit";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Nodus Fit | Gestão de alunos, treinos e financeiro para personal trainers",
  description:
    "Organize alunos, treinos, evolução e financeiro em uma plataforma web e PWA feita para personal trainers.",
  path: "",
});

const features = [
  {
    icon: IconBarbell,
    title: "Montagem em 3 minutos",
    body: "Planos A/B/C com exercícios, séries, cargas e descanso. Templates reutilizáveis entre alunos com um clique.",
  },
  {
    icon: IconDeviceMobileCheck,
    title: "Execução sem fricção",
    body: "O treino do dia aparece assim que o aluno abre o app. Timer automático, registro de séries e histórico de cargas sem precisar perguntar nada.",
  },
  {
    icon: IconChartLine,
    title: "Aderência em tempo real",
    body: "Veja quem treinou hoje, a aderência semanal e quem está em risco de cancelar antes que ele cancele.",
  },
  {
    icon: IconReceipt,
    title: "Financeiro sem planilha",
    body: "Mensalidades, vencimentos e inadimplência num painel limpo. Chega de cobrar por mensagem no fim do mês.",
  },
  {
    icon: IconLink,
    title: "Link público de treino",
    body: "Compartilhe o treino por link. O aluno acessa sem criar conta, ideal para converter leads na hora.",
  },
  {
    icon: IconDeviceMobile,
    title: "Instala como app",
    body: "PWA nativo sem App Store. Funciona offline, com notificações push, para personal e aluno.",
  },
];

const stats = [
  { label: "personais no beta", value: "200", prefix: "+" },
  { label: "para montar um treino", value: "3", suffix: "min" },
  { label: "aderência média dos alunos", value: "85", suffix: "%" },
  { label: "plano Pro / mês", value: "49", prefix: "R$" },
];

const chatMessages = [
  {
    initials: "JP",
    name: "João Paulo",
    time: "23h47",
    tone: "mint",
    message: "Qual exercício vem depois do supino? Não acho o PDF.",
  },
  {
    initials: "MC",
    name: "Maria Costa",
    time: "08h12",
    tone: "yellow",
    message: "Consegue mandar o link do treino de novo? Esse aqui não abre mais.",
  },
  {
    initials: "RF",
    name: "Rafael F.",
    time: "02 jan",
    tone: "red",
    message: "Sobre o pagamento, posso deixar pra semana que vem?",
  },
  {
    initials: "AK",
    name: "Ana K.",
    time: "Seg, 14h28",
    tone: "mint",
    message: "Quanto tempo faz que não treino? Não lembro meu histórico.",
  },
];

const steps = [
  [
    "1",
    "Personal cria a conta",
    "Cadastro em 2 minutos. Perfil profissional completo e pronto para convidar alunos.",
  ],
  [
    "2",
    "Convida o aluno por link",
    "Um link via WhatsApp. O aluno cria a conta em 30 segundos e já aparece no painel.",
  ],
  [
    "3",
    "Monta e envia o treino",
    "Plano criado em menos de 3 minutos. O aluno recebe notificação e treina na mesma hora.",
  ],
];

const faqItems = [
  [
    "O aluno precisa pagar para usar?",
    "Não. O aluno usa de graça para sempre. Quem assina é o personal. O modelo é simples: você paga pela ferramenta, seu aluno tem a melhor experiência possível sem custo.",
  ],
  [
    "Funciona no iPhone e Android?",
    'Sim, em qualquer dispositivo. O Nodus Fit é um PWA: o aluno ou o personal abre o site, toca em "Adicionar à tela inicial" e pronto.',
  ],
  [
    "E se meus alunos não quiserem usar um app novo?",
    "Na prática, os alunos adoram porque o app deles é muito mais fácil do que procurar PDF no WhatsApp. O treino do dia já aparece na tela e eles acompanham o próprio progresso.",
  ],
  [
    "Tenho alunos presenciais e online. Funciona para os dois?",
    "Completamente. Alunos presenciais podem usar durante a aula com timer e checklist. Alunos online ficam com o plano no app e você acompanha a aderência em tempo real.",
  ],
  [
    "Posso cancelar quando quiser?",
    "Sim, sem burocracia e sem multa. Cancele pelo painel quando quiser. Você não fica preso a contratos.",
  ],
];

const testimonials = [
  {
    initials: "MP",
    name: "Marcos Pereira",
    role: "Personal trainer · São Paulo",
    quote:
      "Montei o treino em 2 minutos e meu aluno estava treinando na mesma tarde. Acabou com a perguntaiada no WhatsApp.",
  },
  {
    initials: "CL",
    name: "Camila Lopes",
    role: "Personal trainer · Brasília",
    quote:
      "Meus alunos pararam de esquecer qual exercício fazer. O timer de descanso e o histórico de carga mudaram o engajamento.",
  },
  {
    initials: "RL",
    name: "Rafael Lima",
    role: "Personal trainer · Belo Horizonte",
    quote:
      "Saí das planilhas numa tarde. Hoje controlo 28 alunos, pagamentos e treinos sem abrir Excel ou mandar áudio.",
  },
];

type Plan = {
  tier: string;
  price: string;
  period: string;
  description: string;
  cta: string;
  featured?: boolean;
  save?: string;
  features: Array<[string, boolean]>;
};

const plans: Plan[] = [
  {
    tier: "Free",
    price: "R$0",
    period: "/mês",
    description: "Para começar e validar",
    cta: "Começar grátis",
    features: [
      ["Até 5 alunos ativos", true],
      ["Treinos e execução completa", true],
      ["Histórico básico", true],
      ["Templates de treino", false],
      ["Relatório PDF", false],
      ["Chat com aluno", false],
      ["Controle financeiro", false],
    ],
  },
  {
    tier: "Pro",
    price: "R$49",
    period: "/mês",
    description: "Para o personal que cresce",
    cta: "Assinar Pro",
    featured: true,
    features: [
      ["Alunos ilimitados", true],
      ["Tudo do Free", true],
      ["Templates de treino", true],
      ["Relatório PDF automático", true],
      ["Chat com aluno", true],
      ["Controle financeiro completo", true],
    ],
  },
  {
    tier: "Anual",
    price: "R$490",
    period: "/ano",
    description: "2 meses grátis incluso",
    cta: "Assinar anual",
    save: "Economize R$98 vs. mensal",
    features: [
      ["Tudo do Pro", true],
      ["Suporte prioritário", true],
      ["Acesso antecipado a novidades", true],
      ["Economia de R$98", true],
    ],
  },
];

export default function Home() {
  return (
    <div className="landing-v3">
      <LandingV3Motion />
      <Navigation />
      <Hero />
      <Phones />
      <Stats />
      <PainSection />
      <FeaturesSection />
      <SpotlightSection />
      <HowItWorks />
      <ForWho />
      <PullQuote />
      <Testimonials />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

function Navigation() {
  return (
    <nav className="nav">
      <div className="nav-i">
        <Link className="nav-logo" href="/" aria-label="Nodus Fit">
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
          <span className="nav-brand">
            NODUS <em>FIT</em>
          </span>
          <span className="nav-badge">BETA</span>
        </Link>
        <div className="nav-links">
          <a className="nav-a" href="#funcionalidades">
            Funcionalidades
          </a>
          <a className="nav-a" href="#como-funciona">
            Como funciona
          </a>
          <a className="nav-a" href="#precos">
            Preços
          </a>
          <Link className="nav-cta" href="/acesso">
            Começar grátis
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero dot-tex">
      <div className="hero-glow-static" />
      <div className="hero-cursor-glow" />
      <div className="hero-in wrap">
        <div data-r="up">
          <span className="pill">
            <IconBolt size={14} aria-hidden="true" /> Beta aberto · +200 personais
          </span>
        </div>
        <h1 className="hero-h1" data-d="1" data-r="up">
          Gerenciar alunos não <br />
          pode parecer um <br />
          <span className="grad">segundo emprego.</span>
        </h1>
        <p className="hero-sub" data-d="2" data-r="up">
          O Nodus Fit é a plataforma que o personal assina e o aluno ama usar. Treinos,
          aderência e pagamentos em um único lugar, finalmente.
        </p>
        <div className="hero-actions" data-d="3" data-r="up">
          <Link className="btn-p" data-mag href="/acesso">
            Começar grátis <IconArrowRight size={18} aria-hidden="true" />
          </Link>
          <a className="btn-g" href="#funcionalidades">
            <IconPlayerPlayFilled size={13} aria-hidden="true" /> Ver demo
          </a>
        </div>
        <div className="hero-trust" data-d="4" data-r="up">
          <span>Sem cartão de crédito</span>
          <span className="ht-dot">·</span>
          <span>Cancele quando quiser</span>
          <span className="ht-dot">·</span>
          <span>Aluno usa de graça para sempre</span>
        </div>
        <div className="hero-proof" data-d="5" data-r="up">
          <div className="avs" aria-hidden="true">
            {["JS", "MA", "RC", "LF", "+"].map((avatar) => (
              <span className="av" key={avatar}>
                {avatar}
              </span>
            ))}
          </div>
          <span className="proof-t">
            <strong>+200 personais</strong> no beta · 85% de aderência média
          </span>
        </div>
      </div>
    </section>
  );
}

function Phones() {
  return (
    <div className="phones" role="img" aria-label="Prévia do produto Nodus Fit">
      <PersonalPhone />
      <WorkoutPhone />
      <ProgressPhone />
    </div>
  );
}

function PersonalPhone() {
  const students = [
    ["JP", "João P.", "Treinou hoje · 87%", "g"],
    ["MC", "Maria C.", "2 dias sem treinar", "y"],
    ["RF", "Rafael F.", "Pagamento pendente", "r"],
    ["AK", "Ana K.", "Treinou hoje · 91%", "g"],
  ];

  return (
    <div className="ph-shell" data-d="2" data-r="right">
      <PhoneFrame avatar="M">
        <div className="pbd-lbl">Painel do Personal</div>
        <div className="pbd-h pbd-spaced">Seus alunos</div>
        <div className="phone-list">
          {students.map(([initials, name, status, dot]) => (
            <div className="al-r" key={name}>
              <span className={`al-av ${dot}`}>{initials}</span>
              <span>
                <span className="al-n">{name}</span>
                <span className="al-s">{status}</span>
              </span>
              <span className={`al-dot ${dot}`} />
            </div>
          ))}
          <div className="invite-card">+ Convidar aluno</div>
        </div>
      </PhoneFrame>
    </div>
  );
}

function WorkoutPhone() {
  return (
    <div className="ph-shell feat" data-d="1" data-r="up">
      <PhoneFrame avatar="J">
        <div className="pbd-lbl">Treino de hoje</div>
        <div className="pbd-h">Peito + Tríceps</div>
        <div className="pbd-s">Plano A · Semana 4</div>
        <div className="prog-w">
          <div className="prog-tr">
            <div className="prog-fill" style={{ width: "60%" }} />
          </div>
          <div className="prog-lbl">3 de 5 exercícios</div>
        </div>
        <ExerciseRow done meta="4x10 · 80kg" name="Supino reto" tag="PR" />
        <ExerciseRow done meta="3x12 · 20kg" name="Crucifixo inclinado" />
        <ExerciseRow active meta="Série 2/4 · em andamento" name="Tríceps corda" />
        <ExerciseRow meta="3x falha" name="Mergulho" />
        <div className="timer">
          <div className="timer-n">0:48</div>
          <div className="timer-l">DESCANSO</div>
        </div>
      </PhoneFrame>
    </div>
  );
}

function ProgressPhone() {
  return (
    <div className="ph-shell" data-d="2" data-r="left">
      <PhoneFrame avatar="J">
        <div className="pbd-lbl">Minha evolução</div>
        <div className="sm-grid">
          <Metric label="aderência" value="87%" />
          <Metric label="treinos" light value="64" />
          <Metric label="peso total" value="-4.1kg" />
          <Metric label="PR supino" light value="+12kg" />
        </div>
        <div className="pbd-lbl chart-label">Evolução de carga</div>
        <svg className="phone-chart" viewBox="0 0 155 44" aria-hidden="true">
          <defs>
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3DD9A4" stopOpacity=".18" />
              <stop offset="100%" stopColor="#3DD9A4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            fill="url(#chartGradient)"
            points="0,40 22,35 48,28 78,20 108,13 135,9 155,5 155,44 0,44"
          />
          <polyline
            fill="none"
            points="0,40 22,35 48,28 78,20 108,13 135,9 155,5"
            stroke="#3DD9A4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <circle cx="155" cy="5" fill="#3DD9A4" r="3" />
          <circle cx="155" cy="5" fill="rgba(61,217,164,.18)" r="6" />
        </svg>
      </PhoneFrame>
    </div>
  );
}

function PhoneFrame({ avatar, children }: { avatar: string; children: React.ReactNode }) {
  return (
    <>
      <div className="ph-notch" />
      <div className="ph-sc">
        <div className="psb">
          <span className="psb-t">9:41</span>
          <span className="psb-d" />
        </div>
        <div className="phd">
          <span className="phd-b">
            NODUS <em>FIT</em>
          </span>
          <span className="phd-av">{avatar}</span>
        </div>
        <div className="pbd">{children}</div>
      </div>
    </>
  );
}

function ExerciseRow({
  active,
  done,
  meta,
  name,
  tag,
}: {
  active?: boolean;
  done?: boolean;
  meta: string;
  name: string;
  tag?: string;
}) {
  return (
    <div className={`ex-r ${active ? "active-row" : ""}`}>
      <span className={`ex-ck ${done ? "done" : active ? "active" : "idle"}`} />
      <span>
        <span className="ex-n">{name}</span>
        <span className="ex-m">{meta}</span>
      </span>
      {tag ? <span className="ex-badge">{tag}</span> : null}
    </div>
  );
}

function Metric({
  label,
  light,
  value,
}: {
  label: string;
  light?: boolean;
  value: string;
}) {
  return (
    <div className="sm-card">
      <div className={`sm-n ${light ? "wht" : ""}`}>{value}</div>
      <div className="sm-l">{label}</div>
    </div>
  );
}

function Stats() {
  return (
    <div className="stats-bar">
      <div className="stats-i">
        {stats.map((stat, index) => (
          <div className="st" data-d={index + 1} data-r="up" key={stat.label}>
            <div
              className="st-n"
              data-counter
              data-prefix={stat.prefix}
              data-suffix={stat.suffix}
              data-to={stat.value}
            >
              {stat.prefix}
              {stat.value}
              {stat.suffix}
            </div>
            <div className="st-l">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PainSection() {
  return (
    <section className="sec dark dot-tex">
      <div className="wrap">
        <SectionHeader
          centered
          eyebrow="O problema"
          title={
            <>
              Você conhece
              <br />
              esses horários.
            </>
          }
        >
          Mensagens que chegam a qualquer hora, de qualquer aluno, sobre algo que não
          deveria ser pergunta.
        </SectionHeader>
        <div className="chat-wrap">
          <div className="chat-header" data-r="up">
            <div className="chat-header-icon">
              <IconBrandWhatsapp size={18} aria-hidden="true" />
            </div>
            <div>
              <div className="chat-header-title">Grupo: Personal + Alunos</div>
              <div className="chat-header-sub">4 novas mensagens</div>
            </div>
          </div>
          <div className="chat-thread">
            {chatMessages.map((message) => (
              <div className="chat-msg" key={message.name}>
                <div className={`chat-av ${message.tone}`}>{message.initials}</div>
                <div className="chat-content">
                  <div className="chat-meta">
                    <span className="chat-name">{message.name}</span>
                    <span className="chat-time">{message.time}</span>
                  </div>
                  <div className="chat-bubble">{message.message}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="pain-callout" data-r="up">
            <div className="pain-callout-n">4</div>
            <div className="pain-callout-t">
              <strong>Quatro brechas de profissionalismo por semana.</strong> Cada uma
              delas é um treino perdido, um aluno desmotivado ou uma mensagem de
              cancelamento que você não viu chegar.
            </div>
          </div>
          <div className="pain-bridge" data-r="up">
            <div className="pain-line" />
            <span className="pain-bridge-t">
              Com o Nodus Fit, nenhuma dessas mensagens precisa existir
            </span>
            <div className="pain-line" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="sec mid" id="funcionalidades">
      <div className="wrap">
        <SectionHeader
          eyebrow="Funcionalidades"
          title="Tudo que você precisa. Nada que te atrasa."
        >
          Construído do zero para o personal autônomo que quer crescer sem complicar a
          operação.
        </SectionHeader>
        <div className="feat-grid">
          {features.map((feature, index) => (
            <article
              className="feat-card"
              data-d={(index % 3) + 1}
              data-r="up"
              key={feature.title}
            >
              <div className="feat-icon">
                <feature.icon size={22} stroke={1.8} aria-hidden="true" />
              </div>
              <h3 className="feat-t">{feature.title}</h3>
              <p className="feat-b">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpotlightSection() {
  const rows = [
    ["JP", "João Paulo", "Treinou hoje · Peito + Tríceps", "92%", "OK", "g", "92"],
    ["MC", "Maria Costa", "Há 2 dias · Atenção", "74%", "Atenção", "y", "74"],
    ["RF", "Rafael F.", "5 dias sem treinar · Risco", "48%", "Risco", "r", "48"],
    ["AK", "Ana K.", "Treinou hoje · Pernas", "88%", "OK", "g", "88"],
    ["PM", "Pedro M.", "Há 3 dias · Atenção", "68%", "Atenção", "y", "68"],
  ];

  return (
    <section className="spotlight">
      <div className="spotlight-in">
        <div className="spotlight-text" data-r="right">
          <div className="spotlight-label">Aderência &amp; Risco</div>
          <h2 className="spotlight-h">Saiba quem vai cancelar antes que ele cancele.</h2>
          <p className="spotlight-b">
            O Nodus Fit monitora a aderência de cada aluno em tempo real. Quando alguém
            fica 3 dias sem treinar, você vê. Quando o histórico aponta risco, você age
            antes.
          </p>
          <div className="spotlight-stats">
            <SpotlightStat
              number="3x"
              label="mais cedo você identifica um aluno em risco"
            />
            <SpotlightStat
              number="85%"
              label="aderência média entre os alunos na plataforma"
            />
            <SpotlightStat
              number="-40%"
              label="cancelamentos em 90 dias no beta fechado"
            />
          </div>
          <a className="btn-p btn-offset" data-mag href="#precos">
            Ver o painel de aderência <IconArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div data-r="left">
          <div className="adh-card">
            <div className="adh-hdr">
              <div className="adh-hdr-t">Aderência dos alunos</div>
              <div className="adh-hdr-badge">HOJE</div>
            </div>
            <div className="adh-list">
              {rows.map(([initials, name, subtitle, percent, risk, tone, width]) => (
                <div className={`adh-row ${tone === "r" ? "risk-row" : ""}`} key={name}>
                  <div className={`adh-av ${tone}`}>{initials}</div>
                  <div className="adh-info">
                    <div className="adh-name">{name}</div>
                    <div className="adh-sub">{subtitle}</div>
                    <div className="adh-bar">
                      <div
                        className={`adh-bar-fill ${tone}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                  <div className="adh-right">
                    <div className={`adh-pct ${tone}`}>{percent}</div>
                    <div className={`adh-risk ${tone}`}>{risk}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpotlightStat({ label, number }: { label: string; number: string }) {
  return (
    <div className="spl-stat">
      <div className="spl-n">{number}</div>
      <div className="spl-l">{label}</div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="sec dark" id="como-funciona">
      <div className="wrap">
        <SectionHeader
          centered
          eyebrow="Como funciona"
          title={
            <>
              Do zero ao treino
              <br />
              em 5 minutos.
            </>
          }
        >
          Sem burocracia, sem treinamento. Personal e aluno conectados antes do fim do
          cafezinho.
        </SectionHeader>
        <div className="steps-g">
          {steps.map(([number, title, body], index) => (
            <article className="step" data-d={index + 1} data-r="up" key={number}>
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

function ForWho() {
  return (
    <section className="sec light">
      <div className="wrap">
        <SectionHeader dark eyebrow="Para quem é" title="Um produto. Dois protagonistas.">
          O personal comanda. O aluno executa. Os dois crescem juntos.
        </SectionHeader>
        <div className="for-grid">
          <AudienceCard
            cta="Criar conta grátis"
            icon={IconUser}
            items={[
              "Painel com todos os alunos e status de aderência em tempo real",
              "Montagem de treinos completos em minutos, não em horas",
              "Alertas de risco para ver quem está prestes a cancelar",
              "Controle financeiro sem planilha e sem cobrança por mensagem",
              "Relatório de progresso em PDF gerado com um clique",
            ]}
            title="Para o personal"
            variant="dark"
          />
          <AudienceCard
            icon={IconRun}
            items={[
              "Treino do dia na tela, sem procurar PDF e sem perguntar nada",
              "Timer de descanso automático entre cada série",
              "Histórico completo de cargas e recordes pessoais por exercício",
              "Gráficos de evolução de peso, força e aderência",
              "Usa de graça para sempre, sem pedir cartão",
            ]}
            note="O aluno nunca paga. O personal assina. Simples assim."
            title="Para o aluno"
            variant="light"
          />
        </div>
      </div>
    </section>
  );
}

function AudienceCard({
  cta,
  icon: Icon,
  items,
  note,
  title,
  variant,
}: {
  cta?: string;
  icon: typeof IconUser;
  items: string[];
  note?: string;
  title: string;
  variant: "dark" | "light";
}) {
  const isDark = variant === "dark";
  return (
    <article className={`for-card ${isDark ? "pt" : "al"}`} data-r="up">
      <div className={`for-icon ${isDark ? "dk" : "lt"}`}>
        <Icon size={22} stroke={1.8} aria-hidden="true" />
      </div>
      <h3 className={`for-title ${isDark ? "dk" : "lt"}`}>{title}</h3>
      <div className="for-list">
        {items.map((item) => (
          <div className={`for-item ${isDark ? "dk" : "lt"}`} key={item}>
            <span className={`for-ck ${isDark ? "dk" : "lt"}`}>
              <IconCheck size={12} aria-hidden="true" />
            </span>
            {item}
          </div>
        ))}
      </div>
      {cta ? (
        <Link className="btn-p fit-btn" href="/acesso">
          {cta} <IconArrowRight size={17} aria-hidden="true" />
        </Link>
      ) : null}
      {note ? <p className="for-note lt">{note}</p> : null}
    </article>
  );
}

function PullQuote() {
  return (
    <section className="pullquote-sec">
      <div className="pullquote-in">
        <div className="pq-label" data-r="up">
          Depoimento em destaque
        </div>
        <blockquote className="pq-text" data-d="1" data-r="up">
          "Em 3 semanas, minha aderência foi de 58% para <em>86%.</em> Quando vi o número,
          entendi: nunca foi problema dos alunos. Foi problema de acompanhamento."
        </blockquote>
        <div className="pq-footer" data-d="2" data-r="up">
          <div className="pq-av">AF</div>
          <div>
            <div className="pq-name">Ana Ferreira</div>
            <div className="pq-role">Personal trainer · Rio de Janeiro</div>
          </div>
          <div className="pq-stats">
            <QuoteStat label="aderência" number="+28pp" />
            <QuoteStat label="alunos ativos" number="28" />
            <QuoteStat label="para mudar" number="3sem" />
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteStat({ label, number }: { label: string; number: string }) {
  return (
    <div className="pq-s">
      <div className="pq-s-n">{number}</div>
      <div className="pq-s-l">{label}</div>
    </div>
  );
}

function Testimonials() {
  return (
    <section className="sec light">
      <div className="wrap">
        <SectionHeader
          centered
          dark
          eyebrow="Depoimentos"
          title={
            <>
              Personais que saíram
              <br />
              do improviso.
            </>
          }
        />
        <div className="testi-grid">
          {testimonials.map((testimonial, index) => (
            <article
              className="testi"
              data-d={index + 1}
              data-r="up"
              key={testimonial.name}
            >
              <div className="testi-stars" role="img" aria-label="5 estrelas">
                {["1", "2", "3", "4", "5"].map((star) => (
                  <IconStarFilled size={14} key={star} aria-hidden="true" />
                ))}
              </div>
              <p className="testi-q">"{testimonial.quote}"</p>
              <div className="testi-au">
                <div className="t-av">{testimonial.initials}</div>
                <div>
                  <div className="t-nm">{testimonial.name}</div>
                  <div className="t-rl">{testimonial.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="sec dark dot-tex" id="precos">
      <div className="wrap">
        <SectionHeader centered eyebrow="Preços" title="Simples assim.">
          O personal paga. O aluno usa de graça. Sem taxa por aluno, sem surpresas no
          boleto.
        </SectionHeader>
        <div className="price-grid">
          {plans.map((plan, index) => (
            <article
              className={`plan ${plan.featured ? "feat" : ""}`}
              data-d={index + 1}
              data-r="up"
              key={plan.tier}
            >
              {plan.featured ? <div className="plan-badge">Mais popular</div> : null}
              <div className={`plan-tier ${plan.featured ? "mint" : ""}`}>
                {plan.tier}
              </div>
              <div className="plan-price-r">
                <span className="plan-val">{plan.price}</span>
                <span className="plan-per">{plan.period}</span>
              </div>
              <div className="plan-desc">{plan.description}</div>
              <div className="plan-div" />
              <div className="plan-feats">
                {plan.features.map(([feature, enabled]) => (
                  <div className={`plan-f ${enabled ? "" : "off"}`} key={feature}>
                    {enabled ? (
                      <IconCheck className="pf-ck" size={15} aria-hidden="true" />
                    ) : (
                      <IconX className="pf-x" size={15} aria-hidden="true" />
                    )}
                    {feature}
                  </div>
                ))}
              </div>
              <Link
                className={`plan-btn ${plan.featured ? "mint" : ""}`}
                href={plan.tier === "Free" ? "/acesso" : mailTo}
              >
                {plan.cta}
              </Link>
              {plan.save ? <div className="plan-save">{plan.save}</div> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="sec mid">
      <div className="wrap">
        <SectionHeader eyebrow="FAQ" title="Ainda com dúvidas?">
          As perguntas mais comuns de quem está quase convencido.
        </SectionHeader>
        <div className="faq-list" data-r="up">
          {faqItems.map(([question, answer], index) => (
            <div className="faq-item" key={question}>
              <button
                aria-controls={`faq-answer-${index}`}
                aria-expanded="false"
                className="faq-q"
                type="button"
              >
                {question}
                <IconPlus className="faq-icon" size={22} aria-hidden="true" />
              </button>
              <div className="faq-a-wrap" id={`faq-answer-${index}`}>
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
    <section className="cta-sec dot-tex">
      <div className="wrap cta-in">
        <div data-r="up">
          <span className="cta-eyebrow">
            <IconBolt size={14} aria-hidden="true" /> Comece ainda hoje
          </span>
          <h2 className="cta-h">
            Seu próximo aluno está
            <br />
            procurando um <em>profissional</em>
            <br />
            de verdade.
          </h2>
          <p className="cta-sub">
            Não o mais barato. O mais organizado, o mais presente, o que nunca deixa nada
            escapar. Seja esse profissional agora.
          </p>
          <div className="cta-acts">
            <Link className="btn-p cta-primary" data-mag href="/acesso">
              Criar conta grátis <IconArrowRight size={19} aria-hidden="true" />
            </Link>
            <a className="btn-g cta-secondary" href="/contato">
              Falar com a equipe
            </a>
          </div>
          <p className="cta-note">
            Já são +200 personais no beta · Sem cartão · Alunos usam de graça para sempre
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-i">
        <div className="ft-brand">
          NODUS <em>FIT</em>
        </div>
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
        <div className="ft-copy">© 2026 Nodus Fit · Todos os direitos reservados</div>
      </div>
    </footer>
  );
}

function SectionHeader({
  centered,
  children,
  dark,
  eyebrow,
  title,
}: {
  centered?: boolean;
  children?: React.ReactNode;
  dark?: boolean;
  eyebrow: string;
  title: React.ReactNode;
}) {
  return (
    <div className={`sh ${centered ? "ctr" : ""}`} data-r="up">
      <span className={`pill ${dark ? "lt" : ""}`}>{eyebrow}</span>
      <h2 className={`sh-title ${dark ? "dk" : ""}`}>{title}</h2>
      {children ? <p className={`sh-body ${dark ? "dk" : ""}`}>{children}</p> : null}
    </div>
  );
}
