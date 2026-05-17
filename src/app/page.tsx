import { PublicShell } from "@/components/public/public-shell";

const painPoints = [
  "Treino perdido em PDF, WhatsApp e planilha",
  "Aluno sem clareza do que executar hoje",
  "Acompanhamento manual de presenca e evolucao",
  "Mensalidade e atraso fora do fluxo do treino",
];

const productModules = [
  {
    title: "Treino do dia",
    body: "O aluno abre e ja entende o que fazer: exercicios, series, cargas, descanso e progresso.",
  },
  {
    title: "Painel do personal",
    body: "Lista de alunos por status, aderencia recente e sinais claros de quem precisa de atencao.",
  },
  {
    title: "Evolucao sem friccao",
    body: "Historico de carga, presenca, peso e observacoes prontos para virar relatorio.",
  },
];

const flowSteps = [
  ["01", "Convide", "O personal cria o aluno e envia um link simples."],
  ["02", "Prescreva", "Treinos A/B/C com descanso, carga e observacoes."],
  ["03", "Acompanhe", "Aderencia, evolucao e financeiro no mesmo contexto."],
];

const planItems = [
  "Alunos ilimitados",
  "Treinos e templates",
  "Acompanhamento de aderencia",
  "Base preparada para PWA",
];

export default function Home() {
  return (
    <PublicShell>
      <section className="relative border-border-muted border-b bg-[#0A0F0D]">
        <div className="mx-auto grid min-h-[calc(100vh-var(--spacing-nav))] w-full max-w-[100vw] gap-10 overflow-hidden px-5 py-10 sm:max-w-7xl sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-16">
          <div className="w-full min-w-0 max-w-xs sm:max-w-2xl">
            <p className="mb-5 inline-block max-w-full rounded-pill border border-brand-400/25 bg-brand-400/10 px-3 py-1.5 text-[10px] font-bold uppercase leading-5 tracking-[0.08em] text-brand-300 sm:text-xs sm:tracking-[0.14em]">
              Para personal trainers autonomos
            </p>
            <h1 className="max-w-xs break-words text-3xl font-extrabold leading-[1.08] text-brand-50 sm:max-w-3xl sm:text-5xl lg:text-6xl">
              O treino, o aluno e a rotina do personal no mesmo lugar.
            </h1>
            <p className="mt-6 max-w-xs text-base font-medium leading-7 text-ink-secondary sm:max-w-xl sm:text-lg sm:leading-8">
              Nodus Fit troca a bagunca de planilhas, PDFs e mensagens soltas por uma
              experiencia direta: o personal prescreve, o aluno executa e a evolucao fica
              visivel.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-brand-400 px-4 text-center text-sm font-extrabold text-on-brand shadow-brand transition hover:bg-brand-500 sm:w-auto sm:px-6"
                href="mailto:contato@vortek.dev?subject=Lista%20de%20espera%20Nodus%20Fit"
              >
                Entrar na lista
              </a>
              <a
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-border bg-surface/45 px-4 text-sm font-bold text-brand-300 transition hover:border-brand-400 hover:bg-hover sm:w-auto sm:px-6"
                href="#produto"
              >
                Ver produto
              </a>
            </div>
            <dl className="mt-10 grid max-w-xs grid-cols-3 gap-2 border-border-muted border-t pt-6 sm:max-w-xl sm:gap-4">
              <div>
                <dt className="text-2xl font-extrabold text-brand-400 sm:text-3xl">
                  3min
                </dt>
                <dd className="mt-1 text-[9px] font-bold uppercase tracking-[0.04em] text-ink-tertiary sm:text-xs sm:tracking-[0.08em]">
                  para montar
                </dd>
              </div>
              <div>
                <dt className="text-2xl font-extrabold text-brand-400 sm:text-3xl">
                  R$49
                </dt>
                <dd className="mt-1 text-[9px] font-bold uppercase tracking-[0.04em] text-ink-tertiary sm:text-xs sm:tracking-[0.08em]">
                  plano pro
                </dd>
              </div>
              <div>
                <dt className="text-2xl font-extrabold text-brand-400 sm:text-3xl">
                  PWA
                </dt>
                <dd className="mt-1 text-[9px] font-bold uppercase tracking-[0.04em] text-ink-tertiary sm:text-xs sm:tracking-[0.08em]">
                  instalavel
                </dd>
              </div>
            </dl>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section className="bg-page px-5 py-16 text-ink-primary sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-brand">
              O problema
            </p>
            <h2 className="mt-3 max-w-xl text-4xl font-extrabold">
              A operacao do personal ainda acontece fora do treino.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {painPoints.map((item) => (
              <div
                className="min-h-24 rounded-lg border border-border bg-surface p-4 text-base font-bold text-ink-primary shadow-card"
                key={item}
              >
                <span className="mb-4 block h-1.5 w-10 rounded-sm bg-warning" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="produto"
        className="border-border-muted border-y bg-[#0A0F0D] px-5 py-16 sm:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-400">
                Produto
              </p>
              <h2 className="mt-3 max-w-2xl text-4xl font-extrabold text-brand-50">
                Uma interface para prescrever, executar e acompanhar.
              </h2>
            </div>
            <p className="max-w-2xl text-lg font-medium leading-8 text-ink-secondary">
              O foco nao e encher tela de funcao. E reduzir o tempo entre montar o treino
              e ver se o aluno realmente evoluiu.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {productModules.map((module) => (
              <article
                className="rounded-lg border border-border bg-surface p-5 shadow-card"
                key={module.title}
              >
                <h3 className="text-xl font-extrabold text-brand-50">{module.title}</h3>
                <p className="mt-3 text-base font-medium leading-7 text-ink-secondary">
                  {module.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="fluxo" className="bg-surface px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-brand">
            Como funciona
          </p>
          <div className="mt-3 grid gap-8 lg:grid-cols-[0.75fr_1fr] lg:items-start">
            <h2 className="text-4xl font-extrabold text-brand-50">
              O caminho todo cabe em tres movimentos.
            </h2>
            <div className="divide-y divide-border rounded-lg border border-border bg-elevated shadow-card">
              {flowSteps.map(([number, title, body]) => (
                <div className="grid gap-4 p-5 sm:grid-cols-[80px_1fr]" key={number}>
                  <div className="font-mono text-sm font-bold text-brand-400">
                    {number}
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-brand-50">{title}</h3>
                    <p className="mt-2 text-base font-medium text-ink-secondary">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="precos" className="bg-[#0A0F0D] px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-400">
              Precos
            </p>
            <h2 className="mt-3 max-w-xl text-4xl font-extrabold text-brand-50">
              O personal paga. O aluno usa de graca.
            </h2>
            <p className="mt-4 max-w-xl text-lg font-medium leading-8 text-ink-secondary">
              Um modelo simples para validar o MVP: entrada acessivel, sem friccao para o
              aluno e margem para evoluir quando a operacao crescer.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-400/30 bg-elevated p-5 shadow-brand">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-400">
                  Plano Pro
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-6xl font-extrabold leading-none text-brand-50">
                    R$49
                  </span>
                  <span className="pb-2 text-sm font-bold text-ink-tertiary">/mes</span>
                </div>
              </div>
              <span className="w-fit rounded-pill bg-warning-bg px-3 py-1 text-xs font-bold text-warning-text">
                MVP
              </span>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {planItems.map((item) => (
                <li
                  className="flex items-center gap-3 text-sm font-bold text-ink-secondary"
                  key={item}
                >
                  <span className="size-2 rounded-pill bg-brand-400" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-brand-400 px-6 text-sm font-extrabold text-on-brand shadow-brand transition hover:bg-brand-500"
              href="mailto:contato@vortek.dev?subject=Lista%20de%20espera%20Nodus%20Fit"
            >
              Entrar na lista de espera
            </a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function ProductPreview() {
  return (
    <div
      aria-label="Preview do painel do personal e do treino do aluno no Nodus Fit"
      className="relative mx-auto w-full min-w-0 max-w-xs overflow-hidden sm:max-w-2xl"
      role="img"
    >
      <div className="grid min-w-0 gap-4 rounded-2xl border border-border bg-surface p-4 shadow-modal lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0 rounded-xl border border-border bg-[#0A0F0D] p-4">
          <div className="flex items-center justify-between border-border border-b pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-tertiary">
                Painel do personal
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-brand-50">Hoje</h2>
            </div>
            <span className="rounded-pill bg-success-bg px-3 py-1 text-xs font-bold text-success-text">
              12 ativos
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["85%", "aderencia"],
              ["7", "treinos hoje"],
              ["3", "alertas"],
            ].map(([value, label]) => (
              <div
                className="rounded-lg border border-border bg-elevated p-3"
                key={label}
              >
                <div className="text-2xl font-extrabold text-brand-400">{value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-ink-tertiary">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            {[
              ["Joao Silva", "Treinou hoje", "ativo"],
              ["Maria Alves", "Treino atrasado", "2d"],
              ["Rodrigo Costa", "Pagamento vence amanha", "alerta"],
            ].map(([name, status, tag]) => (
              <div
                className="flex items-center justify-between gap-3 border-border border-b bg-surface px-4 py-3 last:border-b-0"
                key={name}
              >
                <div>
                  <div className="font-bold text-brand-50">{name}</div>
                  <div className="mt-1 text-sm font-medium text-ink-tertiary">
                    {status}
                  </div>
                </div>
                <span className="max-w-16 truncate rounded-pill bg-hover px-3 py-1 text-xs font-bold text-brand-300">
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[220px] rounded-[28px] border border-brand-400/35 bg-[#0A0F0D] p-3 shadow-brand">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-pill bg-border" />
          <div className="rounded-2xl border border-border bg-surface p-3">
            <div className="flex items-center justify-between border-border border-b pb-3">
              <div className="text-xs font-extrabold text-brand-50">
                NODUS <span className="text-brand-400">FIT</span>
              </div>
              <span className="grid size-7 place-items-center rounded-pill bg-brand-400/15 text-[10px] font-bold text-brand-300">
                JS
              </span>
            </div>
            <div className="py-4">
              <p className="text-xs font-bold text-ink-tertiary">Treino A</p>
              <h3 className="mt-1 text-xl font-extrabold text-brand-50">
                Peito e triceps
              </h3>
              <div className="mt-3 h-2 overflow-hidden rounded-sm bg-border">
                <div className="h-full w-[42%] rounded-sm bg-brand-400" />
              </div>
              <p className="mt-2 text-xs font-bold text-ink-tertiary">
                2 de 6 exercicios
              </p>
            </div>
            <div className="space-y-2">
              {["Supino reto", "Desenvolvimento", "Triceps corda"].map(
                (exercise, index) => (
                  <div
                    className="rounded-md border border-border bg-elevated px-3 py-2"
                    key={exercise}
                  >
                    <div className="text-sm font-bold text-brand-50">{exercise}</div>
                    <div className="mt-1 text-xs font-medium text-ink-tertiary">
                      {index === 1 ? "serie 2/4" : "4x10"}
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="mt-3 rounded-lg bg-brand-700 p-3 text-center">
              <div className="text-3xl font-extrabold text-brand-50">1:23</div>
              <div className="text-xs font-bold uppercase tracking-[0.1em] text-brand-300">
                descanso
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
