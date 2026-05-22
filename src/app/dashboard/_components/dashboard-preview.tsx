import {
  IconAlertTriangle,
  IconBell,
  IconChartBar,
  IconChevronRight,
  IconCoin,
  IconFileText,
  IconPlus,
  IconSearch,
  IconTrendingUp,
  IconTrophy,
  IconUserPlus,
  IconUsers,
  IconWeight,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import {
  PersonalPreviewPage,
  PersonalPreviewShell,
  PersonalPreviewTopbar,
} from "../../_components/personal-preview-shell";

interface IconProps {
  "aria-hidden"?: boolean | "true" | "false";
  className?: string;
  size?: number;
  stroke?: number;
}

type IconLike = ComponentType<IconProps>;

const statCards = [
  {
    delta: "+3",
    icon: IconUsers,
    label: "Alunos ativos",
    tone: "mint",
    value: "28",
  },
  {
    delta: "+4%",
    icon: IconTrendingUp,
    label: "Aderencia media",
    tone: "mint",
    value: "84%",
  },
  {
    delta: "Outubro",
    icon: IconCoin,
    label: "Receita do mes",
    tone: "yellow",
    value: "R$3.360",
  },
  {
    delta: "-1",
    icon: IconAlertTriangle,
    label: "Pagamentos em atraso",
    tone: "red",
    value: "3",
  },
] as const;

const students = [
  {
    adherence: 87,
    initials: "JP",
    meta: "Treinou hoje",
    name: "Joao Pimentel",
    status: "Em dia",
  },
  {
    adherence: 91,
    initials: "AK",
    meta: "Treinou hoje",
    name: "Ana Kalinowska",
    status: "PR hoje",
  },
  {
    adherence: 78,
    initials: "CB",
    meta: "Ontem",
    name: "Carla Braga",
    status: "Em dia",
  },
] as const;

const activities = [
  {
    icon: IconTrophy,
    text: "Ana K. bateu um PR - Supino 65kg",
    time: "Ha 12 minutos",
  },
  {
    icon: IconWeight,
    text: "Joao concluiu Treino A",
    time: "Ha 38 minutos",
  },
  {
    icon: IconCoin,
    text: "Pagamento recebido - Lucas",
    time: "Ha 2 horas",
  },
] as const;

export function DashboardPreview() {
  return (
    <PersonalPreviewShell active="dashboard">
      <PersonalPreviewPage topbar={<DashboardTopbar />}>
        <div className="space-y-6">
          <StatsGrid />
          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.7fr)]">
            <div className="min-w-0 space-y-6">
              <AdherencePanel />
              <StudentsPanel />
            </div>
            <aside className="min-w-0 space-y-6">
              <QuickActions />
              <FinancialPanel />
              <ActivityPanel />
            </aside>
          </div>
        </div>
      </PersonalPreviewPage>
    </PersonalPreviewShell>
  );
}

function DashboardTopbar() {
  return (
    <PersonalPreviewTopbar>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-[#4A7868]">Bom dia,</p>
          <h1 className="font-[var(--font-syne)] text-xl font-extrabold leading-tight tracking-normal text-[#E6F7F0] sm:text-2xl">
            Marcos Pereira
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <span className="mr-1 hidden text-sm text-[#4A7868] lg:inline">
            sexta-feira, 22 de maio de 2026
          </span>
          <IconButton icon={IconBell} label="Notificacoes" />
          <IconButton icon={IconSearch} label="Buscar" />
          <a
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#3DD9A4] px-4 text-sm font-bold text-[#04342C] shadow-[0_10px_28px_rgba(61,217,164,0.16)]"
            href="/treinos/novo"
          >
            <IconPlus aria-hidden="true" size={17} />
            Novo treino
          </a>
        </div>
      </div>
    </PersonalPreviewTopbar>
  );
}

function StatsGrid() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </section>
  );
}

function StatCard({
  delta,
  icon: Icon,
  label,
  tone,
  value,
}: {
  delta: string;
  icon: IconLike;
  label: string;
  tone: "mint" | "red" | "yellow";
  value: string;
}) {
  const toneClasses = {
    mint: "border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-[#3DD9A4]",
    red: "border-[#E05050]/20 bg-[#E05050]/10 text-[#E05050]",
    yellow: "border-[#EFC027]/20 bg-[#EFC027]/10 text-[#EFC027]",
  };

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-[#1C3529] bg-[#0D1A15] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div
          className={`grid size-10 shrink-0 place-items-center rounded-xl border ${toneClasses[tone]}`}
        >
          <Icon aria-hidden="true" size={20} />
        </div>
        <span
          className={`max-w-[7rem] truncate rounded-full px-2 py-1 text-[11px] font-bold ${toneClasses[tone]}`}
        >
          {delta}
        </span>
      </div>
      <p className="truncate font-mono text-2xl text-[#E6F7F0] sm:text-3xl">{value}</p>
      <p className="mt-1 truncate text-sm text-[#4A7868]">{label}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#182B22]">
        <div
          className={`h-full rounded-full ${tone === "red" ? "w-[18%] bg-[#E05050]" : tone === "yellow" ? "w-[76%] bg-[#EFC027]" : "w-[84%] bg-[#3DD9A4]"}`}
        />
      </div>
    </article>
  );
}

function AdherencePanel() {
  const points = [
    ["S1", "40%"],
    ["S2", "53%"],
    ["S3", "68%"],
    ["S4", "61%"],
    ["S5", "80%"],
    ["S6", "74%"],
    ["S7", "86%"],
    ["S8", "94%"],
  ];

  return (
    <Panel
      action="Exportar"
      subtitle="Ultimas 8 semanas - media do grupo"
      title="Aderencia semanal"
    >
      <div className="mb-8 flex flex-wrap gap-5 text-xs text-[#89BBAA]">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#3DD9A4]" />
          Aderencia
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#EFC027]" />
          Meta (80%)
        </span>
      </div>
      <div className="relative h-[168px] rounded-2xl bg-[#0B1712] px-4 pb-8 pt-5">
        <div className="absolute inset-x-4 top-[56px] border-t border-dashed border-[#EFC027]/50" />
        <div className="absolute inset-x-4 bottom-14 border-t border-[#1C3529]" />
        <div className="absolute inset-x-4 bottom-24 border-t border-[#1C3529]" />
        <div className="relative flex h-full items-end justify-between gap-3">
          {points.map(([label, height]) => (
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={label}>
              <div className="flex h-[104px] w-full items-end justify-center">
                <div
                  className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-[#0C5E48] to-[#3DD9A4]"
                  style={{ height }}
                />
              </div>
              <span className="text-xs text-[#4A7868]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function StudentsPanel() {
  return (
    <Panel action="Ver todos" subtitle="28 ativos - 4 precisam de atencao" title="Alunos">
      <label className="relative mb-4 block">
        <span className="sr-only">Buscar aluno</span>
        <IconSearch
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A7868]"
          size={17}
        />
        <input
          className="h-11 w-full rounded-2xl border border-[#233F31] bg-[#122019] pl-10 pr-4 text-sm text-[#E6F7F0] outline-none placeholder:text-[#4A7868]"
          placeholder="Buscar aluno..."
          readOnly
          value=""
        />
      </label>
      <div className="mb-4 flex flex-wrap gap-2">
        {["Todos", "Atencao", "Em dia"].map((tab, index) => (
          <button
            className={`rounded-xl px-3 py-2 text-xs font-bold ${
              index === 0 ? "bg-[#122019] text-[#E6F7F0]" : "text-[#4A7868]"
            }`}
            type="button"
            key={tab}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="divide-y divide-[#1C3529]">
        {students.map((student) => (
          <StudentRow key={student.name} student={student} />
        ))}
      </div>
    </Panel>
  );
}

function StudentRow({ student }: { student: (typeof students)[number] }) {
  return (
    <article className="grid min-w-0 gap-3 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#3DD9A4]/12 text-xs font-bold text-[#3DD9A4]">
        {student.initials}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold">{student.name}</h3>
        <p className="mt-1 text-xs text-[#4A7868]">
          {student.meta} <span className="mx-1 text-[#1C3529]">/</span>
          <span className="rounded-full bg-[#3DD9A4]/10 px-2 py-0.5 text-[#3DD9A4]">
            {student.status}
          </span>
        </p>
      </div>
      <div className="flex min-w-0 items-center gap-3 sm:justify-end">
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#182B22] sm:w-28 sm:flex-none">
          <div
            className="h-full rounded-full bg-[#3DD9A4]"
            style={{ width: `${student.adherence}%` }}
          />
        </div>
        <span className="font-mono text-xs text-[#3DD9A4]">{student.adherence}%</span>
      </div>
    </article>
  );
}

function QuickActions() {
  const actions = [
    {
      href: "/treinos/novo",
      icon: IconWeight,
      label: "Novo treino",
      meta: "Criar plano",
    },
    {
      href: "/acesso/aluno-preview",
      icon: IconUserPlus,
      label: "Convidar aluno",
      meta: "Gerar link",
    },
    { href: "#", icon: IconFileText, label: "Relatorio PDF", meta: "Exportar agora" },
    { href: "/financeiro", icon: IconChartBar, label: "Financeiro", meta: "3 em atraso" },
  ];

  return (
    <Panel title="Acoes rapidas">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <a
              className="rounded-2xl border border-[#1C3529] bg-[#122019] p-4 transition hover:border-[#3DD9A4]/35 hover:text-[#3DD9A4]"
              href={action.href}
              key={action.label}
            >
              <Icon aria-hidden="true" className="mb-3 text-[#3DD9A4]" size={20} />
              <p className="text-sm font-bold">{action.label}</p>
              <p className="mt-1 text-xs text-[#4A7868]">{action.meta}</p>
            </a>
          );
        })}
      </div>
    </Panel>
  );
}

function FinancialPanel() {
  return (
    <Panel
      action="Detalhes"
      href="/financeiro"
      subtitle="Outubro 2026"
      title="Financeiro"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MiniMetric label="Recebido" tone="mint" value="R$2.940" />
        <MiniMetric label="Em atraso" tone="red" value="R$420" />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#182B22]">
        <div className="h-full w-[88%] rounded-full bg-[#3DD9A4]" />
      </div>
      <div className="mt-2 flex justify-between gap-3 text-xs text-[#4A7868]">
        <span>87.5% recebido</span>
        <span>Meta: R$3.360</span>
      </div>
    </Panel>
  );
}

function ActivityPanel() {
  return (
    <Panel action="Ver mais" title="Atividade recente">
      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div className="flex gap-3" key={activity.text}>
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#3DD9A4]/10 text-[#3DD9A4]">
                <Icon aria-hidden="true" size={17} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{activity.text}</p>
                <p className="mt-0.5 text-xs text-[#4A7868]">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function Panel({
  action,
  children,
  href = "#",
  subtitle,
  title,
}: {
  action?: string;
  children: React.ReactNode;
  href?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#1C3529] bg-[#0D1A15]">
      <header className="flex items-start justify-between gap-4 border-b border-[#1C3529] px-5 py-4">
        <div className="min-w-0">
          <h2 className="font-[var(--font-syne)] text-lg font-extrabold tracking-normal">
            {title}
          </h2>
          {subtitle ? <p className="mt-0.5 text-xs text-[#4A7868]">{subtitle}</p> : null}
        </div>
        {action ? (
          <a
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#3DD9A4]"
            href={href}
          >
            {action}
            <IconChevronRight aria-hidden="true" size={14} />
          </a>
        ) : null}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function MiniMetric({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "mint" | "red";
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#1C3529] bg-[#122019] p-4">
      <p
        className={`font-mono text-xl ${tone === "mint" ? "text-[#3DD9A4]" : "text-[#E05050]"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#4A7868]">{label}</p>
    </div>
  );
}

function IconButton({ icon: Icon, label }: { icon: IconLike; label: string }) {
  return (
    <button
      className="grid size-10 place-items-center rounded-xl border border-[#233F31] bg-[#122019] text-[#89BBAA] transition hover:border-[#3DD9A4]/35 hover:text-[#3DD9A4]"
      type="button"
      aria-label={label}
    >
      <Icon aria-hidden="true" size={18} />
    </button>
  );
}
