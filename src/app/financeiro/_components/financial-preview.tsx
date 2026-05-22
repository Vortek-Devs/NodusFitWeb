import {
  IconAlertCircle,
  IconAlertTriangle,
  IconBarbell,
  IconCash,
  IconChartBar,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconDeviceFloppy,
  IconFileText,
  IconHistory,
  IconLayoutDashboard,
  IconMessageCircle,
  IconPencil,
  IconPlus,
  IconReceipt,
  IconReceiptOff,
  IconSearch,
  IconSettings,
  IconTrendingUp,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

type FinancePreviewVariant =
  | "config"
  | "drawer"
  | "empty"
  | "loaded"
  | "loading"
  | "payment";

interface IconProps {
  "aria-hidden"?: boolean | "true" | "false";
  className?: string;
  size?: number;
  stroke?: number;
}

type IconLike = ComponentType<IconProps>;

const navItems = [
  { icon: IconLayoutDashboard, label: "Dashboard" },
  { badge: "2", icon: IconUsers, label: "Alunos" },
  { icon: IconBarbell, label: "Treinos" },
  { active: true, icon: IconReceipt, label: "Financeiro" },
  { icon: IconMessageCircle, label: "Mensagens" },
  { icon: IconFileText, label: "Relatorios" },
];

const summaryCards = [
  {
    delta: "+R$260 vs abril",
    icon: IconCash,
    label: "Recebido este mes",
    tone: "mint",
    value: "R$1.860",
  },
  {
    delta: "2 alunos inadimplentes",
    icon: IconAlertTriangle,
    label: "Em atraso",
    tone: "red",
    value: "R$380",
  },
  {
    delta: "1 aluno nos proximos 5 dias",
    icon: IconClock,
    label: "Vencendo em breve",
    tone: "yellow",
    value: "R$190",
  },
  {
    delta: "12 alunos ativos",
    icon: IconChartBar,
    label: "Projecao do mes",
    tone: "blue",
    value: "R$2.430",
  },
] as const;

const studentGroups = [
  {
    count: "2 alunos",
    title: "Em atraso",
    tone: "red",
    students: [
      {
        action: "Registrar",
        amount: "R$190",
        due: "8 dias em atraso",
        initials: "RF",
        meta: "Venceu em 14 mai - Plano mensal",
        name: "Rafael Ferreira",
        status: "Em atraso",
      },
      {
        action: "Registrar",
        amount: "R$190",
        due: "3 dias em atraso",
        initials: "AK",
        meta: "Venceu em 19 mai - Plano mensal",
        name: "Ana Kawamoto",
        status: "Em atraso",
      },
    ],
  },
  {
    count: "1 aluno - proximos 5 dias",
    title: "Vencendo em breve",
    tone: "yellow",
    students: [
      {
        action: "Registrar",
        amount: "R$190",
        due: "Em 3 dias",
        initials: "MC",
        meta: "Vence em 25 mai - Plano mensal",
        name: "Maria Clara",
        status: "Vencendo",
      },
    ],
  },
  {
    count: "9 alunos",
    title: "Em dia",
    tone: "mint",
    students: [
      {
        action: "Historico",
        amount: "R$190",
        due: "Prox: 02 jun",
        initials: "JP",
        meta: "Pago em 02 mai - Plano mensal",
        name: "Joao Paulo",
        status: "Em dia",
      },
      {
        action: "Historico",
        amount: "R$190",
        due: "Prox: 05 jun",
        initials: "LS",
        meta: "Pago em 05 mai - Plano mensal",
        name: "Lucas Silva",
        status: "Em dia",
      },
      {
        action: "Historico",
        amount: "R$220",
        due: "Prox: 01 jun",
        initials: "CB",
        meta: "Pago em 01 mai - Plano mensal",
        name: "Camila Borges",
        status: "Em dia",
      },
    ],
  },
] as const;

const historyRows = [
  ["14/05/26", "R$190", "-", "Pendente"],
  ["09/04/26", "R$190", "PIX", "Pago"],
  ["14/03/26", "R$190", "PIX", "Pago"],
  ["14/02/26", "R$190", "Transferencia", "Pago"],
  ["14/01/26", "R$190", "PIX", "Pago"],
  ["14/12/25", "R$190", "Dinheiro", "Pago"],
];

export function FinancialPreview({
  variant = "loaded",
}: {
  variant?: FinancePreviewVariant;
}) {
  const showDrawer = variant === "drawer";
  const showPayment = variant === "payment";
  const showConfig = variant === "config";

  return (
    <main className="min-h-dvh bg-[#07100D] text-[#E6F7F0]">
      <div className="flex min-h-dvh">
        <FinanceSidebar />
        <section className="min-w-0 flex-1 bg-[radial-gradient(rgba(61,217,164,0.035)_1px,transparent_1px)] [background-size:22px_22px] lg:ml-[220px]">
          <FinanceTopbar />
          <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {variant === "loading" ? (
              <FinanceLoadingState />
            ) : variant === "empty" ? (
              <FinanceEmptyState />
            ) : (
              <FinanceLoadedState />
            )}
          </div>
        </section>
      </div>

      {showDrawer ? <FinanceDrawer /> : null}
      {showPayment ? <PaymentModal /> : null}
      {showConfig ? <ConfigModal /> : null}
    </main>
  );
}

function FinanceSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[220px] flex-col border-r border-[#1C3529] bg-[#0D1A15] px-2 py-5 lg:flex">
      <div className="flex items-center gap-3 px-3 pb-6">
        <div className="grid size-8 place-items-center rounded-lg bg-[#3DD9A4] text-[#04342C]">
          <IconReceipt aria-hidden="true" size={17} />
        </div>
        <span className="font-[var(--font-syne)] text-sm font-extrabold tracking-[0.04em]">
          NODUS <span className="text-[#3DD9A4]">FIT</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Menu do personal">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                item.active
                  ? "border border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-[#3DD9A4]"
                  : "text-[#4A7868] hover:bg-[#122019] hover:text-[#89BBAA]"
              }`}
              href={item.active ? "/financeiro" : "#"}
              key={item.label}
            >
              <Icon aria-hidden="true" size={20} stroke={1.8} />
              <span>{item.label}</span>
              {"badge" in item ? (
                <span className="ml-auto rounded-full bg-[#E05050] px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </a>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-[#1C3529] px-3 pt-4">
        <Avatar initials="MP" tone="mint" />
        <div>
          <p className="text-sm font-semibold text-[#89BBAA]">Marcos Pereira</p>
          <p className="text-xs text-[#4A7868]">Plano Pro</p>
        </div>
      </div>
    </aside>
  );
}

function FinanceTopbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-[#1C3529] bg-[#07100D]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl border border-[#1C3529] bg-[#122019] text-[#3DD9A4] lg:hidden">
            <IconReceipt aria-hidden="true" size={20} />
          </div>
          <div>
            <h1 className="font-[var(--font-syne)] text-lg font-extrabold tracking-normal">
              Controle Financeiro
            </h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-[#89BBAA]">
              <button
                className="grid size-7 place-items-center rounded-lg border border-[#233F31] bg-[#122019]"
                type="button"
                aria-label="Mes anterior"
              >
                <IconChevronLeft aria-hidden="true" size={15} />
              </button>
              <span className="font-mono">Maio 2026</span>
              <button
                className="grid size-7 place-items-center rounded-lg border border-[#233F31] bg-[#122019]"
                type="button"
                aria-label="Proximo mes"
              >
                <IconChevronRight aria-hidden="true" size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionLink href="/financeiro/drawer" icon={IconHistory} label="Historico" />
          <ActionLink
            href="/financeiro/config"
            icon={IconPlus}
            label="Configurar mensalidade"
            primary
          />
        </div>
      </div>
    </header>
  );
}

function FinanceLoadedState() {
  return (
    <div className="space-y-6">
      <AlertBanner />
      <SummaryGrid />
      <GoalBar />
      <FinanceControls />
      <StudentGroups />
    </div>
  );
}

function AlertBanner() {
  return (
    <section className="flex gap-4 rounded-2xl border border-[#E05050]/20 bg-[#E05050]/10 p-4">
      <IconAlertCircle
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-[#E05050]"
        size={22}
      />
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-bold text-[#E6F7F0]">
          2 alunos com pagamento em atraso
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#89BBAA]">
          Rafael F. esta ha 8 dias em atraso e Ana K. esta ha 3 dias. Registre os
          pagamentos ou envie um lembrete.
        </p>
        <a
          className="mt-2 inline-flex text-xs font-bold text-[#E05050]"
          href="/financeiro/pagamento"
        >
          Ver inadimplentes
        </a>
      </div>
      <IconX aria-hidden="true" className="shrink-0 text-[#4A7868]" size={18} />
    </section>
  );
}

function SummaryGrid() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => (
        <SummaryCard key={card.label} {...card} />
      ))}
    </section>
  );
}

function SummaryCard({
  delta,
  icon: Icon,
  label,
  tone,
  value,
}: {
  delta: string;
  icon: IconLike;
  label: string;
  tone: "blue" | "mint" | "red" | "yellow";
  value: string;
}) {
  const toneClasses = {
    blue: "border-[#4A90D9]/20 bg-[#4A90D9]/5 text-[#4A90D9]",
    mint: "border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-[#3DD9A4]",
    red: "border-[#E05050]/20 bg-[#E05050]/10 text-[#E05050]",
    yellow: "border-[#EFC027]/20 bg-[#EFC027]/10 text-[#EFC027]",
  };

  return (
    <article className="relative overflow-hidden rounded-2xl border border-[#1C3529] bg-[#0D1A15] p-5">
      <div
        className={`mb-4 grid size-10 place-items-center rounded-xl border ${toneClasses[tone]}`}
      >
        <Icon aria-hidden="true" size={20} />
      </div>
      <p
        className={`font-mono text-2xl ${tone === "mint" ? "text-[#3DD9A4]" : "text-[#E6F7F0]"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-[#4A7868]">{label}</p>
      <p
        className={`mt-2 flex items-center gap-1 text-xs font-semibold ${tone === "red" ? "text-[#E05050]" : "text-[#3DD9A4]"}`}
      >
        <IconTrendingUp aria-hidden="true" size={13} />
        {delta}
      </p>
    </article>
  );
}

function GoalBar() {
  return (
    <section className="rounded-2xl border border-[#1C3529] bg-[#0D1A15] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-[#89BBAA]">Meta mensal</p>
            <p className="font-mono text-xs text-[#3DD9A4]">76% - R$1.860 de R$2.430</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#182B22]">
            <div className="h-full w-[76%] rounded-full bg-gradient-to-r from-[#0C5E48] to-[#3DD9A4]" />
          </div>
          <p className="mt-2 text-xs text-[#4A7868]">
            Faltam R$570 para atingir a meta. Restam 9 dias no mes.
          </p>
        </div>
        <a
          className="grid size-10 place-items-center rounded-xl border border-[#233F31] bg-[#122019] text-[#89BBAA]"
          href="/financeiro/config"
          aria-label="Editar meta mensal"
        >
          <IconPencil aria-hidden="true" size={18} />
        </a>
      </div>
    </section>
  );
}

function FinanceControls() {
  return (
    <section className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#122019] p-1 sm:flex">
        {["Todos 12", "Em dia 9", "Vencendo 1", "Em atraso 2"].map((tab, index) => (
          <button
            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
              index === 0 ? "bg-[#0D1A15] text-[#E6F7F0]" : "text-[#4A7868]"
            }`}
            type="button"
            key={tab}
          >
            {tab}
          </button>
        ))}
      </div>
      <label className="relative min-w-0 flex-1">
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
    </section>
  );
}

function StudentGroups() {
  return (
    <section className="space-y-6">
      {studentGroups.map((group) => (
        <div key={group.title}>
          <div className="mb-3 flex items-center gap-2">
            <span className={`size-2 rounded-full ${toneDot(group.tone)}`} />
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A7868]">
              {group.title}
            </h2>
            <span className="rounded-full border border-[#1C3529] bg-[#122019] px-2 py-0.5 text-xs text-[#4A7868]">
              {group.count}
            </span>
          </div>
          <div className="space-y-2">
            {group.students.map((student) => (
              <StudentPaymentRow
                groupTone={group.tone}
                key={student.name}
                student={student}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function StudentPaymentRow({
  groupTone,
  student,
}: {
  groupTone: string;
  student: (typeof studentGroups)[number]["students"][number];
}) {
  const isOverdue = groupTone === "red";
  const isWarning = groupTone === "yellow";

  return (
    <article
      className={`grid gap-3 rounded-2xl border bg-[#0D1A15] p-4 transition md:grid-cols-[auto_1fr_auto_auto_auto] md:items-center ${
        isOverdue
          ? "border-[#E05050]/25 bg-[#E05050]/5"
          : isWarning
            ? "border-[#EFC027]/25 bg-[#EFC027]/5"
            : "border-[#1C3529]"
      }`}
    >
      <Avatar initials={student.initials} tone={groupTone} />
      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold">{student.name}</h3>
        <p className="mt-1 text-xs text-[#4A7868]">{student.meta}</p>
      </div>
      <div className="md:text-right">
        <p className="font-mono text-sm">{student.amount}</p>
        <p
          className={`mt-1 text-xs ${isOverdue ? "text-[#E05050]" : isWarning ? "text-[#EFC027]" : "text-[#3DD9A4]"}`}
        >
          {student.due}
        </p>
      </div>
      <StatusPill tone={groupTone}>{student.status}</StatusPill>
      <a
        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
          isOverdue
            ? "border-[#E05050]/25 bg-[#E05050]/10 text-[#E05050]"
            : "border-[#233F31] bg-[#122019] text-[#89BBAA]"
        }`}
        href={isOverdue || isWarning ? "/financeiro/pagamento" : "/financeiro/drawer"}
      >
        {student.action === "Historico" ? (
          <IconHistory aria-hidden="true" size={15} />
        ) : (
          <IconCheck aria-hidden="true" size={15} />
        )}
        {student.action}
      </a>
    </article>
  );
}

function FinanceLoadingState() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando financeiro">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            className="rounded-2xl border border-[#1C3529] bg-[#0D1A15] p-5"
            key={item}
          >
            <Skeleton className="mb-4 size-10 rounded-xl" />
            <Skeleton className="mb-3 h-7 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </section>
      <div className="rounded-2xl border border-[#1C3529] bg-[#0D1A15] p-5">
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
      {[1, 2, 3].map((item) => (
        <div
          className="flex items-center gap-4 rounded-2xl border border-[#1C3529] bg-[#0D1A15] p-4"
          key={item}
        >
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function FinanceEmptyState() {
  return (
    <section className="grid min-h-[520px] place-items-center rounded-3xl border border-dashed border-[#233F31] bg-[#0D1A15]/70 p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-[#233F31] bg-[#122019] text-[#4A7868]">
          <IconReceiptOff aria-hidden="true" size={34} />
        </div>
        <h2 className="font-[var(--font-syne)] text-2xl font-extrabold tracking-normal">
          Nenhuma mensalidade configurada
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#89BBAA]">
          Configure o valor e a data de vencimento dos seus alunos para comecar a
          controlar as financas aqui.
        </p>
        <a
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#3DD9A4] px-5 py-3 text-sm font-bold text-[#04342C]"
          href="/financeiro/config"
        >
          <IconPlus aria-hidden="true" size={18} />
          Configurar primeiro aluno
        </a>
      </div>
    </section>
  );
}

function FinanceDrawer() {
  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/55" />
      <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[460px] flex-col border-l border-[#1C3529] bg-[#0D1A15] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#1C3529] p-5">
          <div>
            <h2 className="font-[var(--font-syne)] text-lg font-extrabold">
              Historico - Rafael Ferreira
            </h2>
            <p className="mt-1 text-xs text-[#4A7868]">Plano mensal - R$190/mes</p>
          </div>
          <a
            className="grid size-9 place-items-center rounded-xl border border-[#233F31] text-[#89BBAA]"
            href="/financeiro"
            aria-label="Fechar drawer"
          >
            <IconX aria-hidden="true" size={18} />
          </a>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <InfoGrid />
          <PaymentHistory />
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#4A7868]">
              Acoes
            </h3>
            <div className="grid gap-2">
              <ActionLink
                href="/financeiro/pagamento"
                icon={IconCheck}
                label="Registrar pagamento pendente"
                primary
              />
              <ActionLink
                href="/financeiro/config"
                icon={IconSettings}
                label="Editar mensalidade"
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function InfoGrid() {
  return (
    <section>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#4A7868]">
        Resumo
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <InfoCard label="Total recebido" tone="mint" value="R$1.140" />
        <InfoCard label="Em aberto agora" tone="red" value="R$190" />
        <InfoCard label="Pagamentos" value="6" />
        <InfoCard label="Meses sem pagar" value="0" />
      </div>
    </section>
  );
}

function PaymentHistory() {
  return (
    <section>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#4A7868]">
        Pagamentos
      </h3>
      <div className="overflow-hidden rounded-2xl border border-[#1C3529]">
        <div className="grid grid-cols-4 gap-2 bg-[#122019] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#4A7868]">
          <span>Data</span>
          <span>Valor</span>
          <span>Forma</span>
          <span>Status</span>
        </div>
        {historyRows.map(([date, value, method, status]) => (
          <div
            className="grid grid-cols-4 gap-2 border-t border-[#1C3529] px-3 py-3 text-xs"
            key={date}
          >
            <span className="font-mono text-[#89BBAA]">{date}</span>
            <span className="font-mono">{value}</span>
            <span className="truncate text-[#4A7868]">{method}</span>
            <StatusPill tone={status === "Pago" ? "mint" : "red"}>{status}</StatusPill>
          </div>
        ))}
      </div>
    </section>
  );
}

function PaymentModal() {
  return (
    <ModalShell subtitle="Rafael Ferreira - R$190" title="Registrar pagamento">
      <div className="rounded-2xl border border-[#E05050]/20 bg-[#E05050]/10 p-4 sm:flex sm:items-center sm:gap-3">
        <Avatar initials="RF" tone="red" />
        <div className="mt-3 min-w-0 flex-1 sm:mt-0">
          <p className="font-bold">Rafael Ferreira</p>
          <p className="text-xs text-[#89BBAA]">
            Venceu em 14/05/2026 - 8 dias de atraso
          </p>
        </div>
        <StatusPill tone="red">Em atraso</StatusPill>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <MockField label="Valor recebido" value="R$190,00" />
        <MockField label="Data do pagamento" value="22/05/2026" />
      </div>
      <MockField className="mt-4" label="Forma de pagamento" value="PIX" />
      <MockField
        className="mt-4"
        hint="Visivel apenas para voce"
        label="Observacao opcional"
        value="Pagou com desconto combinado"
      />
      <ModalFooter primaryIcon={IconCheck} primaryLabel="Confirmar pagamento" />
    </ModalShell>
  );
}

function ConfigModal() {
  return (
    <ModalShell
      subtitle="Define valor e vencimento por aluno"
      title="Configurar mensalidade"
    >
      <MockField label="Aluno" value="Joao Paulo" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MockField label="Valor (R$)" value="190" />
        <MockField hint="Evite dias 29-31" label="Dia do vencimento" value="5" />
      </div>
      <MockField
        className="mt-4"
        hint="Uma notificacao sera enviada automaticamente"
        label="Alerta de inadimplencia apos"
        value="3 dias"
      />
      <MockField
        className="mt-4"
        label="Observacao"
        value="Aluno tem desconto por indicacao"
      />
      <ModalFooter primaryIcon={IconDeviceFloppy} primaryLabel="Salvar configuracao" />
    </ModalShell>
  );
}

function ModalShell({
  children,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/65 p-4">
      <section className="w-full max-w-[520px] overflow-hidden rounded-3xl border border-[#1C3529] bg-[#0D1A15] shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[#1C3529] px-5 py-4">
          <div>
            <h2 className="font-[var(--font-syne)] text-lg font-extrabold">{title}</h2>
            <p className="mt-1 text-xs text-[#4A7868]">{subtitle}</p>
          </div>
          <a
            className="grid size-9 place-items-center rounded-xl border border-[#233F31] text-[#89BBAA]"
            href="/financeiro"
            aria-label="Fechar modal"
          >
            <IconX aria-hidden="true" size={18} />
          </a>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

function ModalFooter({
  primaryIcon: Icon,
  primaryLabel,
}: {
  primaryIcon: IconLike;
  primaryLabel: string;
}) {
  return (
    <footer className="-mx-5 mt-6 flex justify-end gap-2 border-t border-[#1C3529] px-5 pt-4">
      <a
        className="rounded-xl border border-[#233F31] px-4 py-2 text-sm font-semibold text-[#89BBAA]"
        href="/financeiro"
      >
        Cancelar
      </a>
      <a
        className="inline-flex items-center gap-2 rounded-xl bg-[#3DD9A4] px-4 py-2 text-sm font-bold text-[#04342C]"
        href="/financeiro"
      >
        <Icon aria-hidden="true" size={17} />
        {primaryLabel}
      </a>
    </footer>
  );
}

function MockField({
  className = "",
  hint,
  label,
  value,
}: {
  className?: string;
  hint?: string;
  label: string;
  value: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#4A7868]">
        {label}
      </span>
      <input
        className="h-11 w-full rounded-xl border border-[#233F31] bg-[#122019] px-3 text-sm text-[#E6F7F0] outline-none"
        readOnly
        value={value}
      />
      {hint ? <span className="mt-1 block text-xs text-[#4A7868]">{hint}</span> : null}
    </label>
  );
}

function ActionLink({
  href,
  icon: Icon,
  label,
  primary = false,
}: {
  href: string;
  icon: IconLike;
  label: string;
  primary?: boolean;
}) {
  return (
    <a
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
        primary
          ? "bg-[#3DD9A4] text-[#04342C] shadow-[0_10px_28px_rgba(61,217,164,0.16)]"
          : "border border-[#233F31] text-[#89BBAA]"
      }`}
      href={href}
    >
      <Icon aria-hidden="true" size={17} />
      {label}
    </a>
  );
}

function Avatar({ initials, tone }: { initials: string; tone: string }) {
  return (
    <div
      className={`grid size-10 shrink-0 place-items-center rounded-full border text-xs font-bold ${toneAvatar(tone)}`}
    >
      {initials}
    </div>
  );
}

function StatusPill({ children, tone }: { children: React.ReactNode; tone: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${tonePill(tone)}`}
    >
      {children}
    </span>
  );
}

function InfoCard({
  label,
  tone = "neutral",
  value,
}: {
  label: string;
  tone?: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#1C3529] bg-[#122019] p-4">
      <p
        className={`font-mono text-lg ${tone === "mint" ? "text-[#3DD9A4]" : tone === "red" ? "text-[#E05050]" : ""}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-[#4A7868]">{label}</p>
    </div>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-[#1C3529] ${className}`} />;
}

function toneDot(tone: string) {
  if (tone === "red") return "bg-[#E05050]";
  if (tone === "yellow") return "bg-[#EFC027]";
  return "bg-[#3DD9A4]";
}

function toneAvatar(tone: string) {
  if (tone === "red") return "border-[#E05050]/25 bg-[#E05050]/10 text-[#E05050]";
  if (tone === "yellow") return "border-[#EFC027]/25 bg-[#EFC027]/10 text-[#EFC027]";
  return "border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-[#3DD9A4]";
}

function tonePill(tone: string) {
  if (tone === "red") return "border-[#E05050]/25 bg-[#E05050]/10 text-[#E05050]";
  if (tone === "yellow") return "border-[#EFC027]/25 bg-[#EFC027]/10 text-[#EFC027]";
  return "border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-[#3DD9A4]";
}
