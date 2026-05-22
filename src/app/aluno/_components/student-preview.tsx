import {
  IconArrowLeft,
  IconBarbell,
  IconBell,
  IconBrandGoogle,
  IconChartLine,
  IconCheck,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconHome,
  IconLink,
  IconLock,
  IconMessageCircle,
  IconPaperclip,
  IconPlayerPlay,
  IconSearch,
  IconSend,
  IconShare,
  IconTarget,
  IconTrophy,
  IconUser,
  IconWeight,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

interface IconLikeProps {
  "aria-hidden"?: boolean | "true" | "false";
  className?: string;
  size?: number;
  stroke?: number;
}

type IconLike = ComponentType<IconLikeProps>;

const student = {
  name: "Joao Paulo",
  initials: "JP",
  trainer: "Marcos Pereira",
  trainerInitials: "MP",
  workout: "Peito + Triceps",
  plan: "Treino A",
};

const workoutExercises = [
  { name: "Supino reto com barra", meta: "4 series - 80kg sugerido" },
  { name: "Crucifixo com halteres", meta: "3 series - 20kg sugerido" },
  { name: "Triceps corda no cabo", meta: "4 series - 25kg sugerido" },
  { name: "Mergulho entre bancos", meta: "3 series - peso corporal" },
];

const navItems = [
  { href: "/aluno/treino", label: "Inicio", icon: IconHome, key: "home" },
  { href: "/aluno/treino/executando", label: "Treino", icon: IconBarbell, key: "workout" },
  { href: "/aluno/evolucao", label: "Evolucao", icon: IconChartLine, key: "progress" },
  { href: "/aluno/perfil", label: "Perfil", icon: IconUser, key: "profile" },
];

interface ShellProps {
  active: string;
  children: React.ReactNode;
  label: string;
  light?: boolean;
}

export function StudentPhoneShell({ active, children, label, light = false }: ShellProps) {
  return (
    <main className="min-h-[100dvh] bg-[#07100D] px-0 py-0 text-[#E6F7F0] sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center gap-4">
        <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#4A7868] sm:block">
          {label}
        </p>
        <section
          className={`relative min-h-[100dvh] w-full overflow-hidden bg-[#07100D] shadow-[0_32px_80px_rgba(0,0,0,0.55)] sm:min-h-[720px] sm:max-w-[390px] sm:rounded-[44px] sm:border sm:border-[#233F31] ${
            light ? "bg-[#F8FBF9] text-[#092520]" : "text-[#E6F7F0]"
          }`}
        >
          <PhoneStatusBar light={light} />
          {children}
          <BottomNav active={active} light={light} />
        </section>
      </div>
    </main>
  );
}

export function PublicPreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] bg-[#EFF9F5] px-0 py-0 text-[#092520] sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center gap-4">
        <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#5A9AB0] sm:block">
          Link publico - /t/:token
        </p>
        <section className="relative min-h-[100dvh] w-full overflow-hidden bg-white shadow-[0_32px_80px_rgba(0,0,0,0.18)] sm:min-h-[690px] sm:max-w-[390px] sm:rounded-[44px] sm:border sm:border-[#C4EBD9]">
          <PhoneStatusBar light />
          {children}
        </section>
      </div>
    </main>
  );
}

function PhoneStatusBar({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 pb-1 pt-3">
      <span className={`font-mono text-xs ${light ? "text-[#5A9AB0]" : "text-[#4A7868]"}`}>
        9:41
      </span>
      <div className="flex items-center gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 rounded-full bg-[#3DD9A4] opacity-70" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#3DD9A4] opacity-50" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#3DD9A4] opacity-30" />
      </div>
    </div>
  );
}

function BottomNav({ active, light = false }: { active: string; light?: boolean }) {
  return (
    <nav
      className={`absolute inset-x-0 bottom-0 grid grid-cols-4 border-t px-1 pb-5 pt-2 backdrop-blur-xl ${
        light ? "border-[#C4EBD9] bg-[#F0F9F4]/95" : "border-[#1C3529] bg-[#0D1A15]/95"
      }`}
      aria-label="Navegacao do aluno"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === active;

        return (
          <a
            className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition ${
              isActive
                ? light
                  ? "bg-[#C4EBD9]/55 text-[#0C5E48]"
                  : "bg-[#3DD9A4]/10 text-[#3DD9A4]"
                : light
                  ? "text-[#5A9AB0]"
                  : "text-[#4A7868]"
            }`}
            href={item.href}
            key={item.key}
          >
            <Icon aria-hidden="true" size={21} stroke={1.8} />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

function AppTopbar({
  title,
  subtitle,
  right = "avatar",
}: {
  right?: "avatar" | "search" | "none";
  subtitle?: string;
  title: string;
}) {
  return (
    <header className="flex items-center justify-between px-5 pb-3 pt-1">
      <a
        className="grid size-9 place-items-center rounded-xl border border-[#233F31] bg-[#122019] text-[#89BBAA]"
        href="/aluno/treino"
        aria-label="Voltar"
      >
        <IconArrowLeft aria-hidden="true" size={18} />
      </a>
      <div className="text-center">
        <h1 className="font-[var(--font-syne)] text-base font-extrabold tracking-normal text-[#E6F7F0]">
          {title}
        </h1>
        {subtitle ? <p className="mt-0.5 text-xs text-[#4A7868]">{subtitle}</p> : null}
      </div>
      {right === "avatar" ? (
        <Avatar initials={student.initials} />
      ) : right === "search" ? (
        <button
          className="grid size-9 place-items-center rounded-xl border border-[#233F31] bg-[#122019] text-[#89BBAA]"
          type="button"
          aria-label="Buscar"
        >
          <IconSearch aria-hidden="true" size={18} />
        </button>
      ) : (
        <span className="size-9" />
      )}
    </header>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="grid size-9 place-items-center rounded-full border border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-xs font-bold text-[#3DD9A4]">
      {initials}
    </div>
  );
}

function Badge({
  children,
  tone = "mint",
}: {
  children: React.ReactNode;
  tone?: "mint" | "yellow" | "red" | "gray";
}) {
  const tones = {
    gray: "border-[#233F31] bg-[#122019] text-[#4A7868]",
    mint: "border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-[#3DD9A4]",
    red: "border-[#E05050]/25 bg-[#E05050]/10 text-[#E05050]",
    yellow: "border-[#EFC027]/25 bg-[#EFC027]/10 text-[#EFC027]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function DarkCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[22px] border border-[#1C3529] bg-[#0D1A15] ${className}`}>
      {children}
    </section>
  );
}

function ProgressBar({ value, tone = "mint" }: { tone?: "mint" | "yellow" | "red"; value: number }) {
  const color = tone === "mint" ? "#3DD9A4" : tone === "yellow" ? "#EFC027" : "#E05050";

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[#182B22]">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ backgroundColor: color, width: `${value}%` }}
      />
    </div>
  );
}

export function StudentWorkoutHome() {
  return (
    <StudentPhoneShell active="home" label="Home - Treino do dia">
      <div className="pb-24">
        <div className="flex items-center justify-between px-5 pb-4 pt-1">
          <div>
            <p className="text-sm text-[#4A7868]">Boa tarde,</p>
            <h1 className="font-[var(--font-syne)] text-2xl font-extrabold leading-tight tracking-normal">
              {student.name}
            </h1>
          </div>
          <button
            className="relative grid size-10 place-items-center rounded-xl border border-[#233F31] bg-[#122019] text-[#89BBAA]"
            type="button"
            aria-label="Notificacoes"
          >
            <IconBell aria-hidden="true" size={19} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-[#3DD9A4]" />
          </button>
        </div>

        <DarkCard className="mx-5 mb-4 overflow-hidden border-[#3DD9A4]/25">
          <div className="relative p-5">
            <div className="absolute -right-8 -top-8 size-36 rounded-full bg-[#3DD9A4]/10 blur-2xl" />
            <Badge>Treino de hoje</Badge>
            <h2 className="mt-3 font-[var(--font-syne)] text-2xl font-extrabold tracking-normal">
              {student.workout}
            </h2>
            <p className="mt-1 text-sm text-[#4A7868]">Semana 4 - foco em controle de carga</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MiniPill icon={IconClock} label="52 min" />
              <MiniPill icon={IconBarbell} label="4 exercicios" />
              <MiniPill icon={IconTarget} label="16 series" />
            </div>
            <a
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#3DD9A4] font-bold text-[#04342C] shadow-[0_10px_28px_rgba(61,217,164,0.2)] transition active:scale-[0.98]"
              href="/aluno/treino/executando"
            >
              <IconPlayerPlay aria-hidden="true" size={18} />
              Iniciar treino
            </a>
          </div>
          <div className="border-t border-[#1C3529] px-5 py-4">
            <div className="flex flex-col gap-3">
              {workoutExercises.slice(0, 3).map((exercise, index) => (
                <ExercisePreviewRow index={index + 1} key={exercise.name} {...exercise} />
              ))}
              <p className="border-t border-[#1C3529] pt-3 text-center text-xs text-[#4A7868]">
                +1 exercicio no fim do treino
              </p>
            </div>
          </div>
        </DarkCard>

        <div className="mb-4 grid grid-cols-3 gap-2 px-5">
          <StatBox label="treinos" value="64" />
          <StatBox label="aderencia" value="87%" />
          <StatBox label="streak" value="6d" />
        </div>

        <DarkCard className="mx-5 flex items-center gap-3 p-4">
          <Avatar initials={student.trainerInitials} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{student.trainer}</p>
            <p className="text-xs text-[#4A7868]">Personal responsavel</p>
          </div>
          <IconChevronRight aria-hidden="true" className="text-[#4A7868]" size={18} />
        </DarkCard>
      </div>
    </StudentPhoneShell>
  );
}

function MiniPill({ icon: Icon, label }: { icon: IconLike; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#233F31] bg-[#122019] px-3 py-1.5 text-xs text-[#89BBAA]">
      <Icon aria-hidden="true" size={13} />
      {label}
    </span>
  );
}

function ExercisePreviewRow({
  index,
  meta,
  name,
}: {
  index: number;
  meta: string;
  name: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-6 place-items-center rounded-full border border-[#233F31] bg-[#122019] font-mono text-[10px] text-[#4A7868]">
        {index}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</span>
      <span className="text-xs text-[#4A7868]">{meta.split(" - ")[0]}</span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#1C3529] bg-[#122019] p-3">
      <p className="font-mono text-xl text-[#3DD9A4]">{value}</p>
      <p className="mt-1 text-[10px] text-[#4A7868]">{label}</p>
    </div>
  );
}

export function StudentWorkoutExecution() {
  return (
    <StudentPhoneShell active="workout" label="Estado 1 - Executando serie">
      <div className="pb-24">
        <AppTopbar title="Treino A" subtitle="3 de 5 exercicios" right="none" />
        <div className="px-5">
          <ProgressBar value={44} />
        </div>

        <DarkCard className="mx-5 mt-5 overflow-hidden border-[#3DD9A4]/25">
          <div className="p-5">
            <Badge>Exercicio atual</Badge>
            <h1 className="mt-3 font-[var(--font-syne)] text-2xl font-extrabold tracking-normal">
              Supino reto com barra
            </h1>
            <p className="mt-1 text-sm text-[#4A7868]">Peitorais - triceps - ombro frontal</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <StatBox label="series" value="4" />
              <StatBox label="carga" value="80" />
              <StatBox label="descanso" value="90s" />
            </div>
          </div>
          <div className="border-t border-[#1C3529] p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[#4A7868]">
              Registrar serie
            </p>
            <div className="grid grid-cols-2 gap-3">
              <StaticInput label="Carga kg" value="82.5" />
              <StaticInput label="Reps" value="10" />
            </div>
            <button
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#3DD9A4] font-bold text-[#04342C] transition active:scale-[0.98]"
              type="button"
            >
              <IconCheck aria-hidden="true" size={18} />
              Concluir serie
            </button>
          </div>
        </DarkCard>

        <DarkCard className="mx-5 mt-4 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[#4A7868]">
            Historico nesta sessao
          </p>
          {[
            ["1", "80kg", "10 reps"],
            ["2", "80kg", "10 reps"],
            ["3", "82.5kg", "8 reps"],
          ].map(([set, load, reps]) => (
            <div className="flex items-center gap-3 border-t border-[#1C3529] py-3 first:border-t-0" key={set}>
              <span className="grid size-7 place-items-center rounded-full bg-[#122019] font-mono text-xs text-[#4A7868]">
                {set}
              </span>
              <span className="flex-1 text-sm font-semibold">{load}</span>
              <span className="text-xs text-[#89BBAA]">{reps}</span>
              <IconCircleCheck aria-hidden="true" className="text-[#3DD9A4]" size={16} />
            </div>
          ))}
        </DarkCard>
      </div>
    </StudentPhoneShell>
  );
}

function StaticInput({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#4A7868]">{label}</span>
      <span className="rounded-xl border border-[#233F31] bg-[#122019] px-4 py-3 text-center font-mono text-lg text-[#E6F7F0]">
        {value}
      </span>
    </label>
  );
}

export function StudentWorkoutRest() {
  return (
    <StudentPhoneShell active="workout" label="Estado 2 - Descanso">
      <div className="pb-24">
        <AppTopbar title="Descanso" subtitle="Proxima serie em instantes" right="none" />
        <div className="px-5 pt-8 text-center">
          <div className="mx-auto grid size-56 place-items-center rounded-full border border-[#3DD9A4]/25 bg-[#3DD9A4]/10 shadow-[inset_0_0_60px_rgba(61,217,164,0.08)]">
            <div>
              <p className="font-mono text-6xl font-semibold text-[#3DD9A4]">0:42</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[#4A7868]">
                Descanso ativo
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="rounded-2xl border border-[#233F31] bg-[#122019] px-4 py-3 text-sm font-bold text-[#89BBAA]" type="button">
              Pular
            </button>
            <button className="rounded-2xl border border-[#233F31] bg-[#122019] px-4 py-3 text-sm font-bold text-[#89BBAA]" type="button">
              +30s
            </button>
          </div>
        </div>

        <DarkCard className="mx-5 mt-7 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#4A7868]">Proxima serie</p>
          <h2 className="mt-2 font-[var(--font-syne)] text-xl font-extrabold">Supino reto com barra</h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <StatBox label="serie" value="4" />
            <StatBox label="carga" value="85" />
            <StatBox label="meta" value="8" />
          </div>
        </DarkCard>

        <DarkCard className="mx-5 mt-4 flex items-center gap-3 p-4">
          <IconCircleCheck aria-hidden="true" className="text-[#3DD9A4]" size={26} />
          <div>
            <p className="text-sm font-semibold">Serie anterior registrada</p>
            <p className="text-xs text-[#4A7868]">82.5kg - 8 reps - boa cadencia</p>
          </div>
        </DarkCard>
      </div>
    </StudentPhoneShell>
  );
}

export function StudentWorkoutSummary() {
  return (
    <StudentPhoneShell active="workout" label="Estado 3 - Resumo">
      <div className="pb-24">
        <div className="px-6 pt-8 text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-full border border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-[#3DD9A4]">
            <IconCheck aria-hidden="true" size={36} />
          </div>
          <p className="mt-5 text-sm text-[#4A7868]">Treino finalizado</p>
          <h1 className="mt-1 font-[var(--font-syne)] text-3xl font-extrabold leading-tight">
            Excelente sessao, {student.name.split(" ")[0]}
          </h1>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 px-5">
          <SummaryMetric icon={IconClock} label="Duracao" value="52m" />
          <SummaryMetric icon={IconWeight} label="Volume" value="8.7t" />
          <SummaryMetric icon={IconBarbell} label="Series" value="16" />
          <SummaryMetric icon={IconTrophy} label="PRs" value="2" />
        </div>

        <DarkCard className="mx-5 mt-5 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#4A7868]">
            Comparativo vs treino anterior
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <CompareRow label="Supino reto" value="+5kg" />
            <CompareRow label="Volume total" value="+11%" />
            <CompareRow label="Tempo de descanso" value="-8m" />
          </div>
        </DarkCard>

        <div className="mx-5 mt-5 flex flex-col gap-3">
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#3DD9A4] font-bold text-[#04342C]" type="button">
            <IconShare aria-hidden="true" size={18} />
            Compartilhar treino
          </button>
          <a className="text-center text-sm font-semibold text-[#89BBAA]" href="/aluno/treino">
            Voltar para inicio
          </a>
        </div>
      </div>
    </StudentPhoneShell>
  );
}

function SummaryMetric({ icon: Icon, label, value }: { icon: IconLike; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#1C3529] bg-[#0D1A15] p-4">
      <Icon aria-hidden="true" className="mb-3 text-[#3DD9A4]" size={21} />
      <p className="font-mono text-2xl text-[#E6F7F0]">{value}</p>
      <p className="text-xs text-[#4A7868]">{label}</p>
    </div>
  );
}

function CompareRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-[#1C3529] pt-3 first:border-t-0 first:pt-0">
      <span className="text-sm text-[#89BBAA]">{label}</span>
      <span className="rounded-full bg-[#3DD9A4]/10 px-2 py-1 font-mono text-xs text-[#3DD9A4]">
        {value}
      </span>
    </div>
  );
}

export function StudentProfile() {
  return (
    <StudentPhoneShell active="profile" label="Perfil do aluno">
      <div className="pb-24">
        <AppTopbar title="Meu perfil" subtitle="Dados e progresso" />
        <div className="mx-5 overflow-hidden rounded-[26px] border border-[#1C3529] bg-[#0D1A15]">
          <div className="h-24 bg-gradient-to-br from-[#0C5E48] to-[#122019]" />
          <div className="-mt-9 px-5 pb-5">
            <div className="grid size-20 place-items-center rounded-full border-4 border-[#0D1A15] bg-[#3DD9A4]/15 font-[var(--font-syne)] text-xl font-extrabold text-[#3DD9A4]">
              {student.initials}
            </div>
            <h1 className="mt-3 font-[var(--font-syne)] text-2xl font-extrabold">{student.name}</h1>
            <p className="text-sm text-[#4A7868]">Aluno desde fevereiro de 2026</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 px-5">
          <StatBox label="treinos feitos" value="64" />
          <StatBox label="aderencia" value="87%" />
          <StatBox label="peso" value="78.4" />
        </div>

        <DarkCard className="mx-5 mt-4 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#4A7868]">Evolucao recente</p>
          <div className="mt-4 h-28 rounded-2xl bg-[linear-gradient(180deg,rgba(61,217,164,0.12),transparent)] p-3">
            <svg aria-label="Grafico de evolucao" className="h-full w-full" role="img" viewBox="0 0 280 90">
              <polyline
                fill="none"
                points="6,70 48,60 90,55 132,46 174,38 216,35 258,24"
                stroke="#3DD9A4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            </svg>
          </div>
        </DarkCard>

        <DarkCard className="mx-5 mt-4 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#4A7868]">Dados pessoais</p>
          <ProfileLine label="Objetivo" value="Hipertrofia" />
          <ProfileLine label="Altura" value="1.78m" />
          <ProfileLine label="Lesoes" value="Nenhuma informada" />
        </DarkCard>
      </div>
    </StudentPhoneShell>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-t border-[#1C3529] py-3 first:mt-3">
      <span className="text-sm text-[#4A7868]">{label}</span>
      <span className="text-sm font-semibold text-[#E6F7F0]">{value}</span>
    </div>
  );
}

export function StudentEvolution() {
  return (
    <StudentPhoneShell active="progress" label="Evolucao - /aluno/evolucao">
      <div className="pb-24">
        <AppTopbar title="Minha evolucao" subtitle="Carga, peso e aderencia" />
        <div className="grid grid-cols-2 gap-2 px-5">
          <EvolutionMetric label="Aderencia" trend="+6%" value="87%" />
          <EvolutionMetric label="Treinos" trend="+8" value="64" />
          <EvolutionMetric label="Peso" trend="-2.4kg" value="78.4" />
          <EvolutionMetric label="Melhor PR" trend="Supino" value="85kg" />
        </div>

        <DarkCard className="mx-5 mt-4 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="font-semibold">Carga por exercicio</h2>
              <p className="text-xs text-[#4A7868]">Supino reto - ultimas 8 sessoes</p>
            </div>
            <Badge>8 sem</Badge>
          </div>
          <div className="px-4 pb-4">
            <svg aria-label="Grafico de carga" className="h-40 w-full" role="img" viewBox="0 0 320 160">
              <defs>
                <linearGradient id="student-load-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3DD9A4" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#3DD9A4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M20 124 L62 112 L104 100 L146 104 L188 80 L230 74 L272 54 L300 46 L300 140 L20 140 Z" fill="url(#student-load-gradient)" />
              <polyline fill="none" points="20,124 62,112 104,100 146,104 188,80 230,74 272,54 300,46" stroke="#3DD9A4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
            </svg>
          </div>
        </DarkCard>

        <section className="px-5 pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[#4A7868]">
            Historico de treinos
          </p>
          {["Peito + Triceps", "Costas + Biceps", "Pernas completo"].map((name, index) => (
            <HistoryRow date={`${16 - index} MAI`} key={name} name={name} value={`${(8.7 - index * 0.8).toFixed(1)}t`} />
          ))}
        </section>
      </div>
    </StudentPhoneShell>
  );
}

function EvolutionMetric({ label, trend, value }: { label: string; trend: string; value: string }) {
  return (
    <DarkCard className="p-4">
      <p className="font-mono text-2xl text-[#E6F7F0]">{value}</p>
      <p className="mt-1 text-xs text-[#4A7868]">{label}</p>
      <p className="mt-2 text-xs font-bold text-[#3DD9A4]">{trend}</p>
    </DarkCard>
  );
}

function HistoryRow({ date, name, value }: { date: string; name: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#1C3529] py-3">
      <span className="w-10 text-center font-mono text-xs text-[#89BBAA]">{date}</span>
      <span className="h-9 w-1 rounded-full bg-[#3DD9A4]/40" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="text-xs text-[#4A7868]">52 min - PR registrado</p>
      </div>
      <span className="font-mono text-xs text-[#89BBAA]">{value}</span>
    </div>
  );
}

export function StudentChat() {
  return (
    <StudentPhoneShell active="chat" label="Chat - /aluno/chat">
      <div className="pb-24">
        <div className="border-b border-[#1C3529] px-5 pb-4 pt-1">
          <div className="flex items-center gap-3">
            <Avatar initials={student.trainerInitials} />
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold">{student.trainer}</h1>
              <p className="text-xs text-[#3DD9A4]">Online agora</p>
            </div>
            <IconMessageCircle aria-hidden="true" className="text-[#4A7868]" size={22} />
          </div>
        </div>

        <div className="flex h-[480px] flex-col gap-3 overflow-hidden px-4 py-4 sm:h-[420px]">
          <ChatBubble side="received">Atualizei seu treino A. O crucifixo entrou em superset com foco em controle.</ChatBubble>
          <ChatMedia />
          <ChatBubble side="sent">Fechado. Vou fazer hoje no horario do almoco.</ChatBubble>
          <ChatBubble side="received">Boa. Me manda como ficou a carga do supino no final.</ChatBubble>
          <ChatBubble side="sent">Acabei de concluir. Bati PR no supino com +5kg.</ChatBubble>
        </div>

        <div className="absolute inset-x-0 bottom-[76px] flex items-center gap-2 border-t border-[#1C3529] bg-[#07100D] px-4 py-3">
          <button className="grid size-10 place-items-center rounded-full border border-[#233F31] bg-[#122019] text-[#89BBAA]" type="button" aria-label="Anexar">
            <IconPaperclip aria-hidden="true" size={18} />
          </button>
          <div className="min-h-10 flex-1 rounded-full border border-[#233F31] bg-[#122019] px-4 py-2 text-sm text-[#4A7868]">
            Escrever mensagem...
          </div>
          <button className="grid size-10 place-items-center rounded-full bg-[#3DD9A4] text-[#04342C]" type="button" aria-label="Enviar">
            <IconSend aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
    </StudentPhoneShell>
  );
}

function ChatBubble({ children, side }: { children: React.ReactNode; side: "received" | "sent" }) {
  return (
    <div className={`max-w-[82%] ${side === "sent" ? "self-end" : "self-start"}`}>
      <div
        className={`rounded-[18px] px-4 py-3 text-sm leading-6 ${
          side === "sent"
            ? "rounded-br-md bg-[#3DD9A4] text-[#04342C]"
            : "rounded-bl-md bg-[#122019] text-[#E6F7F0]"
        }`}
      >
        {children}
      </div>
      <p className={`mt-1 px-1 text-[10px] text-[#4A7868] ${side === "sent" ? "text-right" : ""}`}>
        14:2{side === "sent" ? "8" : "1"}
      </p>
    </div>
  );
}

function ChatMedia() {
  return (
    <div className="flex gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#1C3529] bg-[#122019] p-3">
        <IconBarbell aria-hidden="true" className="text-[#3DD9A4]" size={20} />
        <div>
          <p className="text-xs font-semibold">Treino A atualizado</p>
          <p className="text-[10px] text-[#4A7868]">4 exercicios</p>
        </div>
      </div>
    </div>
  );
}

export function PublicWorkoutLink() {
  return (
    <PublicPreviewShell>
      <div className="pb-6">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0C5E48] to-[#1A6B53] px-5 py-6 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="relative">
            <p className="font-[var(--font-syne)] text-sm font-extrabold tracking-[0.08em] text-white/75">
              NODUS <span className="text-[#3DD9A4]">FIT</span>
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-full border border-white/30 bg-white/15 font-bold">
                {student.trainerInitials}
              </div>
              <div>
                <p className="font-bold">{student.trainer}</p>
                <p className="text-xs text-white/65">Personal trainer</p>
              </div>
            </div>
          </div>
        </section>
        <section className="px-5 py-5">
          <h1 className="font-[var(--font-syne)] text-2xl font-extrabold tracking-normal text-[#092520]">
            Treino demonstrativo
          </h1>
          <p className="mt-1 text-sm leading-6 text-[#5A9AB0]">
            Veja como seu treino chega organizado no Nodus Fit antes de criar sua conta.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LightPill icon={IconClock} label="52 min" />
            <LightPill icon={IconBarbell} label="4 exercicios" />
            <LightPill icon={IconLink} label="link seguro" />
          </div>

          <div className="mt-5 overflow-hidden rounded-[22px] border border-[#C4EBD9] bg-[#EFF9F5]">
            <p className="border-b border-[#C4EBD9] px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#5A9AB0]">
              Exercicios
            </p>
            {workoutExercises.map((exercise, index) => (
              <div className="flex items-center gap-3 border-b border-[#C4EBD9] px-4 py-3 last:border-b-0" key={exercise.name}>
                <span className="grid size-6 place-items-center rounded-full bg-[#C4EBD9] font-mono text-xs text-[#0C5E48]">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{exercise.name}</span>
                <span className="text-xs text-[#5A9AB0]">{exercise.meta.split(" - ")[0]}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <a className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#0C5E48] font-bold text-white" href="/acesso/aluno-preview">
              Comecar com convite
            </a>
            <p className="text-center text-xs text-[#5A9AB0]">
              Plataforma gratuita para o aluno - Nodus Fit
            </p>
          </div>
        </section>
      </div>
    </PublicPreviewShell>
  );
}

function LightPill({ icon: Icon, label }: { icon: IconLike; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C4EBD9] bg-[#EFF9F5] px-3 py-1.5 text-xs font-semibold text-[#1C5247]">
      <Icon aria-hidden="true" size={13} />
      {label}
    </span>
  );
}

export function StudentInvitePreview() {
  return (
    <StudentPhoneShell active="profile" label="Cadastro via convite" light>
      <div className="pb-24">
        <LightTopbar title="Criar conta" subtitle="Convite de treino" />
        <div className="mx-5 overflow-hidden rounded-[22px] border border-[#C4EBD9] bg-white">
          <div className="h-16 bg-gradient-to-br from-[#C4EBD9] to-[#EFF9F5]" />
          <div className="-mt-6 px-5 pb-5">
            <div className="grid size-12 place-items-center rounded-full border-4 border-white bg-[#EFF9F5] font-bold text-[#0C5E48]">
              {student.trainerInitials}
            </div>
            <h1 className="mt-3 font-bold text-[#092520]">{student.trainer} te convidou</h1>
            <p className="text-xs text-[#5A9AB0]">Complete seu acesso para ver o treino.</p>
          </div>
        </div>

        <form className="px-5 pt-5">
          <InviteField label="Nome completo" value="Joao Paulo Ribeiro" />
          <InviteField label="Email" value="joao.ribeiro@email.com" />
          <InviteField label="Senha" value="********" />
          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#C4EBD9]" />
            <span className="text-xs text-[#5A9AB0]">ou</span>
            <span className="h-px flex-1 bg-[#C4EBD9]" />
          </div>
          <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#C4EBD9] bg-white font-semibold text-[#092520]" type="button">
            <IconBrandGoogle aria-hidden="true" size={18} />
            Continuar com Google
          </button>
          <button className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0C5E48] font-bold text-white" type="button">
            <IconLock aria-hidden="true" size={18} />
            Criar acesso
          </button>
        </form>
      </div>
    </StudentPhoneShell>
  );
}

function LightTopbar({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <header className="flex items-center justify-between px-5 pb-4 pt-1">
      <a className="grid size-9 place-items-center rounded-xl border border-[#C4EBD9] bg-white text-[#0C5E48]" href="/t/demo-token" aria-label="Voltar">
        <IconArrowLeft aria-hidden="true" size={18} />
      </a>
      <div className="text-center">
        <h1 className="font-[var(--font-syne)] text-base font-extrabold tracking-normal text-[#092520]">
          {title}
        </h1>
        <p className="text-xs text-[#5A9AB0]">{subtitle}</p>
      </div>
      <span className="size-9" />
    </header>
  );
}

function InviteField({ label, value }: { label: string; value: string }) {
  return (
    <label className="mb-4 flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#5A9AB0]">{label}</span>
      <span className="rounded-xl border border-[#C4EBD9] bg-white px-4 py-3 text-sm text-[#092520]">
        {value}
      </span>
    </label>
  );
}

export function StudentWelcome() {
  return (
    <StudentPhoneShell active="home" label="Boas-vindas" light>
      <div className="flex min-h-[calc(100dvh-92px)] flex-col justify-between pb-24 sm:min-h-[620px]">
        <div className="px-6 pt-10 text-center">
          <div className="relative mx-auto grid size-24 place-items-center rounded-full border border-[#C4EBD9] bg-[#EFF9F5]">
            <div className="grid size-16 place-items-center rounded-full bg-white font-[var(--font-syne)] text-xl font-extrabold text-[#0C5E48]">
              {student.initials}
            </div>
            <span className="absolute bottom-1 right-1 grid size-7 place-items-center rounded-full border-2 border-white bg-[#0C5E48] text-white">
              <IconCheck aria-hidden="true" size={14} />
            </span>
          </div>
          <p className="mt-6 text-sm text-[#5A9AB0]">Tudo pronto, {student.name.split(" ")[0]}</p>
          <h1 className="mt-2 font-[var(--font-syne)] text-3xl font-extrabold leading-tight text-[#092520]">
            Seu treino ja esta no app
          </h1>
          <p className="mx-auto mt-3 max-w-[300px] text-sm leading-6 text-[#1C5247]">
            Complete seu perfil e comece o primeiro treino para o personal acompanhar sua evolucao.
          </p>
        </div>

        <div className="px-5">
          <ChecklistItem done icon={IconCircleCheck} label="Conta criada" sub="Acesso conectado ao convite" />
          <ChecklistItem icon={IconUser} label="Completar perfil" sub="Peso, objetivo e restricoes" />
          <ChecklistItem icon={IconBarbell} label="Fazer primeiro treino" sub="Treino A ja esta disponivel" />
          <a className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#0C5E48] font-bold text-white" href="/aluno/treino">
            Ir para meu treino
          </a>
        </div>
      </div>
    </StudentPhoneShell>
  );
}

function ChecklistItem({
  done = false,
  icon: Icon,
  label,
  sub,
}: {
  done?: boolean;
  icon: IconLike;
  label: string;
  sub: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-3 rounded-2xl border border-[#C4EBD9] bg-white p-3">
      <span className="grid size-9 place-items-center rounded-xl bg-[#EFF9F5] text-[#0C5E48]">
        <Icon aria-hidden="true" size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[#092520]">{label}</span>
        <span className="block text-xs text-[#5A9AB0]">{sub}</span>
      </span>
      <span className={`grid size-6 place-items-center rounded-full ${done ? "bg-[#0C5E48] text-white" : "border border-[#C4EBD9] text-[#5A9AB0]"}`}>
        {done ? <IconCheck aria-hidden="true" size={13} /> : <IconChevronRight aria-hidden="true" size={13} />}
      </span>
    </div>
  );
}
