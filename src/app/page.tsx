import Link from "next/link";

const features = [
  {
    title: "Treinos na mao do aluno",
    body: "Plano do dia, series, descanso e historico em uma experiencia pensada para usar dentro da academia.",
  },
  {
    title: "Gestao sem planilha",
    body: "Aderencia, evolucao, pagamentos e agenda ficam conectados para o personal agir rapido.",
  },
  {
    title: "PWA primeiro",
    body: "Instalavel no celular, com caminho preparado para cache offline e acesso rapido ao treino.",
  },
];

const steps = ["Crie o aluno", "Monte o treino", "Acompanhe a evolucao"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-hero-dark text-ink-primary">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link className="flex items-center gap-3" href="/" aria-label="Nodus Fit">
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-extrabold text-on-brand shadow-brand">
            NF
          </span>
          <span className="text-lg font-extrabold tracking-normal text-brand-50">
            NODUS <span className="text-brand-400">FIT</span>
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-sm font-semibold text-ink-tertiary md:flex">
          <a className="transition hover:text-brand-400" href="#produto">
            Produto
          </a>
          <a className="transition hover:text-brand-400" href="#fluxo">
            Como funciona
          </a>
          <a className="transition hover:text-brand-400" href="#precos">
            Precos
          </a>
        </div>
        <a
          className="rounded-pill border border-brand-400/35 px-4 py-2 text-sm font-bold text-brand-400 transition hover:bg-brand-400 hover:text-on-brand"
          href="#precos"
        >
          Comecar
        </a>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1fr_0.92fr] lg:pb-20">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-pill border border-brand-400/25 bg-brand-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-300">
            Para personal trainers autonomos
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.02] text-brand-50 sm:text-6xl lg:text-7xl">
            Gerencie seus alunos.
            <span className="block text-gradient-brand">
              Simplifique seu treino.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-ink-secondary">
            O app que o personal assina e o aluno ama usar. Treinos, evolucao,
            agenda e financeiro em um lugar so, com a base visual oficial do
            Nodus Fit desde o primeiro commit.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-400 px-6 text-sm font-extrabold text-on-brand shadow-brand transition hover:bg-brand-500"
              href="#precos"
            >
              Comecar gratis
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-surface/40 px-6 text-sm font-bold text-brand-300 transition hover:border-brand-400 hover:bg-hover"
              href="#produto"
            >
              Ver produto
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-ink-tertiary">
            <div className="flex -space-x-2">
              {["JS", "MA", "RC"].map((initials) => (
                <span
                  className="grid size-9 rounded-pill border border-brand-400/20 bg-brand-400/15 place-items-center text-xs font-extrabold text-brand-300"
                  key={initials}
                >
                  {initials}
                </span>
              ))}
            </div>
            <span>
              <strong className="text-brand-50">+200 personais</strong> no beta
              privado
            </span>
          </div>
        </div>

        <div
          aria-label="Previa visual do produto Nodus Fit"
          className="relative mx-auto w-full max-w-[560px]"
        >
          <div className="absolute -right-8 top-8 h-56 w-56 rounded-pill bg-brand-400/15 blur-3xl" />
          <div className="relative rounded-3xl border border-border bg-surface/80 p-4 shadow-modal backdrop-blur">
            <div className="rounded-2xl border border-border bg-[#0A0F0D] p-4">
              <div className="mb-5 flex items-center justify-between">
                <div className="font-extrabold text-brand-50">
                  NODUS <span className="text-brand-400">FIT</span>
                </div>
                <div className="grid size-9 place-items-center rounded-pill bg-brand-400/15 text-xs font-bold text-brand-300">
                  MP
                </div>
              </div>
              <div className="rounded-2xl border border-brand-400/25 bg-brand-700 p-5 text-brand-50 shadow-brand-lg">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-300">
                  Treino de hoje
                </div>
                <div className="text-2xl font-extrabold">Hipertrofia A</div>
                <div className="mt-4 h-2 overflow-hidden rounded-sm bg-brand-900/55">
                  <div className="h-full w-[62%] rounded-sm bg-brand-400" />
                </div>
                <div className="mt-3 text-sm text-brand-100">
                  5 de 8 exercicios concluidos
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  ["Supino reto", "4 series", "ativo"],
                  ["Remada baixa", "3 series", "proximo"],
                  ["Agachamento", "4 series", "feito"],
                ].map(([name, sets, status]) => (
                  <div
                    className="flex items-center justify-between rounded-lg border border-border bg-elevated p-4 shadow-card"
                    key={name}
                  >
                    <div>
                      <div className="font-bold text-brand-50">{name}</div>
                      <div className="mt-1 text-sm text-ink-tertiary">
                        {sets}
                      </div>
                    </div>
                    <span className="rounded-pill bg-success-bg px-3 py-1 text-xs font-bold text-success-text">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-8 -left-4 w-44 rounded-2xl border border-border bg-surface p-4 shadow-brand sm:-left-10">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-ink-tertiary">
                Descanso
              </div>
              <div className="mt-2 text-4xl font-extrabold text-brand-400">
                1:30
              </div>
              <div className="mt-3 flex gap-2 text-xs font-bold text-ink-secondary">
                <span className="rounded-pill bg-hover px-2 py-1">Pular</span>
                <span className="rounded-pill bg-hover px-2 py-1">+30s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="produto"
        className="border-y border-border bg-[#0A0F0D] px-5 py-20 sm:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-400">
              Funcionalidades
            </p>
            <h2 className="mt-3 text-4xl font-extrabold text-brand-50">
              Tudo que precisa. Nada do que atrapalha.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                className="rounded-lg border border-border bg-surface p-4 shadow-card"
                key={feature.title}
              >
                <div className="mb-5 h-1.5 w-12 rounded-sm bg-brand-400" />
                <h3 className="text-xl font-extrabold text-brand-50">
                  {feature.title}
                </h3>
                <p className="mt-3 text-base font-medium text-ink-secondary">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="fluxo" className="bg-page px-5 py-20 text-ink-primary sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-ink-brand">
            Como funciona
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-4xl font-extrabold">
            Pronto em minutos
          </h2>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                className="rounded-lg border border-border bg-surface p-4 shadow-card"
                key={step}
              >
                <div className="grid size-10 place-items-center rounded-pill bg-brand-400 text-sm font-extrabold text-on-brand">
                  {index + 1}
                </div>
                <div className="mt-5 text-xl font-extrabold">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="bg-[#0A0F0D] px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-400">
              Precos
            </p>
            <h2 className="mt-3 text-4xl font-extrabold text-brand-50">
              O personal paga. O aluno usa de graca.
            </h2>
            <p className="mt-4 max-w-xl text-lg font-medium text-ink-secondary">
              Modelo simples para validar rapido: comece leve, evolua para Pro
              quando a operacao pedir mais controle.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-400/25 bg-surface p-5 shadow-brand">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.12em] text-brand-400">
                  Plano Pro
                </div>
                <div className="mt-3 text-5xl font-extrabold text-brand-50">
                  R$49
                </div>
                <div className="mt-1 text-sm font-medium text-ink-tertiary">
                  por mes, por personal
                </div>
              </div>
              <span className="rounded-pill bg-warning-bg px-3 py-1 text-xs font-bold text-warning-text">
                MVP
              </span>
            </div>
            <a
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-brand-400 px-6 text-sm font-extrabold text-on-brand shadow-brand transition hover:bg-brand-500"
              href="mailto:contato@vortek.dev"
            >
              Entrar na lista
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
