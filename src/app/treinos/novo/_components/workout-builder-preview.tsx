import {
  IconArrowLeft,
  IconBarbell,
  IconChevronDown,
  IconCopy,
  IconDeviceFloppy,
  IconGripVertical,
  IconLink,
  IconPlus,
  IconRun,
  IconSearch,
  IconSend,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import {
  PersonalPreviewPage,
  PersonalPreviewShell,
  PersonalPreviewTopbar,
} from "../../../_components/personal-preview-shell";

const exercises = [
  {
    id: 1,
    name: "Supino Reto com Barra",
    meta: "4 series · 80kg sugerido",
    superset: false,
    tags: ["Peitorais", "Triceps", "Ombro frontal"],
    open: true,
    sets: [
      ["1", "10", "80", "90"],
      ["2", "10", "80", "90"],
      ["3", "8", "85", "120"],
      ["4", "8", "85", "120"],
    ],
  },
  {
    id: 2,
    name: "Crucifixo com Halteres",
    meta: "3 series · 20kg sugerido",
    open: false,
    superset: true,
    tags: ["Peitorais"],
    sets: [
      ["1", "12", "20", "0"],
      ["2", "12", "20", "0"],
      ["3", "12", "20", "60"],
    ],
  },
  {
    id: 3,
    name: "Triceps Corda no Cabo",
    meta: "4 series · 25kg sugerido",
    open: false,
    superset: false,
    tags: ["Triceps"],
    sets: [
      ["1", "12", "25", "60"],
      ["2", "12", "25", "60"],
      ["3", "10", "27.5", "60"],
      ["4", "10", "27.5", "90"],
    ],
  },
  {
    id: 4,
    name: "Mergulho entre Bancos",
    meta: "3 series · peso corporal",
    open: false,
    superset: false,
    tags: ["Triceps", "Peitorais"],
    sets: [
      ["1", "falha", "-", "90"],
      ["2", "falha", "-", "90"],
      ["3", "falha", "-", "90"],
    ],
  },
] as const;

const library = [
  ["Supino Inclinado", "Peito", "Barra"],
  ["Remada Curvada", "Costas", "Livre"],
  ["Agachamento Livre", "Pernas", "Barra"],
  ["Desenvolvimento", "Ombro", "Halter"],
  ["Rosca Alternada", "Biceps", "Halter"],
  ["Prancha", "Abdomen", "Core"],
] as const;

export function WorkoutBuilderPreview() {
  return (
    <PersonalPreviewShell active="treinos">
      <PersonalPreviewPage topbar={<WorkoutTopbar />}>
        <div className="grid min-w-0 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <WorkoutSettings />
          <WorkoutMain />
          <ExerciseLibrary />
        </div>
      </PersonalPreviewPage>
    </PersonalPreviewShell>
  );
}

function WorkoutTopbar() {
  return (
    <PersonalPreviewTopbar>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <a
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#233F31] bg-[#122019] text-[#89BBAA]"
            href="/dashboard"
            aria-label="Voltar"
          >
            <IconArrowLeft aria-hidden="true" size={18} />
          </a>
          <div className="min-w-0">
            <h1 className="truncate font-[var(--font-syne)] text-xl font-extrabold leading-tight tracking-normal text-[#E6F7F0]">
              Criar treino
            </h1>
            <p className="mt-0.5 truncate text-sm text-[#4A7868]">Joao Paulo · Plano A</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <button
            className="hidden min-h-10 items-center gap-2 rounded-xl border border-[#233F31] px-4 text-sm font-bold text-[#89BBAA] sm:inline-flex"
            type="button"
          >
            <IconDeviceFloppy aria-hidden="true" size={17} />
            Salvar rascunho
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#3DD9A4] px-4 text-sm font-bold text-[#04342C] shadow-[0_10px_28px_rgba(61,217,164,0.16)]"
            type="button"
          >
            <IconSend aria-hidden="true" size={17} />
            Publicar
          </button>
        </div>
      </div>
    </PersonalPreviewTopbar>
  );
}

function WorkoutSettings() {
  return (
    <aside className="min-w-0 space-y-4 rounded-2xl border border-[#1C3529] bg-[#0D1A15] p-4 xl:sticky xl:top-[96px] xl:self-start">
      <SectionTitle label="Configurar" />
      <StudentCard />
      <Field label="Nome do plano" value="Hipertrofia - Fase 1" />
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#4A7868]">
          Dias de treino
        </p>
        <div className="grid grid-cols-3 gap-2">
          {["A", "B", "C"].map((day, index) => (
            <button
              className={`min-h-10 rounded-xl border text-sm font-bold ${
                index === 0
                  ? "border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-[#3DD9A4]"
                  : "border-[#233F31] bg-[#122019] text-[#4A7868]"
              }`}
              type="button"
              key={day}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      <Field label="Treino ativo" value="Peito + Triceps" />
      <label className="block">
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#4A7868]">
          Observacoes
        </span>
        <textarea
          className="min-h-24 w-full resize-none rounded-xl border border-[#233F31] bg-[#122019] px-3 py-2 text-sm text-[#E6F7F0] outline-none placeholder:text-[#4A7868]"
          placeholder="Orientacoes gerais para o aluno..."
          readOnly
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <MiniStat label="exercicios" value="4" />
        <MiniStat label="series" value="14" />
        <MiniStat label="min estimados" value="52" />
        <MiniStat label="grupos" value="3" />
      </div>
    </aside>
  );
}

function WorkoutMain() {
  return (
    <section className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1C3529] bg-[#0D1A15] p-4 sm:flex-row sm:items-center">
        <span className="w-fit rounded-full border border-[#3DD9A4]/25 bg-[#3DD9A4]/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-[#3DD9A4]">
          Treino A
        </span>
        <input
          className="min-w-0 flex-1 border-0 border-b border-[#233F31] bg-transparent pb-1 font-[var(--font-syne)] text-xl font-extrabold text-[#E6F7F0] outline-none"
          readOnly
          value="Peito + Triceps"
        />
      </div>

      {exercises.map((exercise) => (
        <div key={exercise.id}>
          {exercise.superset ? <SupersetBand /> : null}
          <ExerciseCard exercise={exercise} />
        </div>
      ))}

      <button
        className="flex min-h-24 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#233F31] bg-[#0D1A15]/75 p-4 text-center transition hover:border-[#3DD9A4]/35 hover:bg-[#3DD9A4]/5"
        type="button"
      >
        <IconPlus aria-hidden="true" className="text-[#4A7868]" size={24} />
        <span className="mt-2 text-sm font-bold text-[#89BBAA]">Adicionar exercicio</span>
        <span className="mt-1 text-xs text-[#4A7868]">
          Busque na biblioteca ou crie um customizado
        </span>
      </button>

      <div className="rounded-2xl border border-[#1C3529] bg-[#0D1A15] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#4A7868]">
          Cardio opcional
        </p>
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#4A90D9]/25 bg-[#4A90D9]/10 text-[#4A90D9]">
            <IconRun aria-hidden="true" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold">Esteira - caminhada inclinada</h3>
            <p className="mt-1 truncate text-xs text-[#4A7868]">
              20 min · apos os exercicios
            </p>
          </div>
          <button
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#233F31] text-[#4A7868]"
            type="button"
            aria-label="Remover cardio"
          >
            <IconTrash aria-hidden="true" size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

function ExerciseCard({ exercise }: { exercise: (typeof exercises)[number] }) {
  return (
    <details
      className="group min-w-0 overflow-hidden rounded-2xl border border-[#1C3529] bg-[#0D1A15]"
      open={exercise.open}
    >
      <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] gap-3 p-4 sm:grid-cols-[auto_auto_1fr_auto_auto] sm:items-center">
        <IconGripVertical
          aria-hidden="true"
          className="hidden text-[#2A5245] sm:block"
          size={18}
        />
        <span className="hidden font-mono text-xs text-[#4A7868] sm:block">
          {exercise.id}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-[#E6F7F0]">{exercise.name}</h2>
          <p className="mt-1 truncate text-xs text-[#4A7868]">{exercise.meta}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {exercise.tags.map((tag, index) => (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                  index === 0
                    ? "border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-[#3DD9A4]"
                    : "border-[#233F31] bg-[#122019] text-[#4A7868]"
                }`}
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <IconButton label="Duplicar" icon={IconCopy} />
          <IconButton label="Remover" icon={IconTrash} danger />
        </div>
        <IconChevronDown
          aria-hidden="true"
          className="hidden text-[#4A7868] transition group-open:rotate-180 sm:block"
          size={18}
        />
      </summary>
      <div className="border-t border-[#1C3529] px-4 pb-4">
        <div className="mt-3 hidden grid-cols-[42px_1fr_1fr_1fr_84px_32px] gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#2A5245] sm:grid">
          <span />
          <span>Serie</span>
          <span>Reps</span>
          <span>Carga</span>
          <span>Desc.</span>
          <span />
        </div>
        <div className="mt-3 space-y-2">
          {exercise.sets.map((set) => (
            <SetRow key={`${exercise.id}-${set[0]}`} set={set} />
          ))}
        </div>
        <button
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#233F31] text-xs font-bold text-[#4A7868] transition hover:border-[#3DD9A4]/35 hover:text-[#3DD9A4]"
          type="button"
        >
          <IconPlus aria-hidden="true" size={15} />
          Adicionar serie
        </button>
      </div>
    </details>
  );
}

function SetRow({ set }: { set: readonly string[] }) {
  const [serie, reps, weight, rest] = set;

  return (
    <div className="grid grid-cols-[32px_1fr_1fr_32px] gap-2 sm:grid-cols-[42px_1fr_1fr_1fr_84px_32px]">
      <span className="grid size-8 place-items-center rounded-full border border-[#233F31] bg-[#122019] font-mono text-xs text-[#4A7868]">
        {serie}
      </span>
      <ReadOnlyInput value={serie} />
      <ReadOnlyInput value={reps} />
      <ReadOnlyInput className="hidden sm:block" value={weight} />
      <ReadOnlyInput className="hidden sm:block" value={`${rest}s`} />
      <button
        className="grid size-8 place-items-center rounded-xl text-[#4A7868]"
        type="button"
        aria-label="Remover serie"
      >
        <IconTrash aria-hidden="true" size={15} />
      </button>
    </div>
  );
}

function ExerciseLibrary() {
  return (
    <aside className="min-w-0 rounded-2xl border border-[#1C3529] bg-[#0D1A15] xl:sticky xl:top-[96px] xl:self-start">
      <div className="border-b border-[#1C3529] p-4">
        <SectionTitle label="Biblioteca" />
        <label className="relative mt-3 block">
          <span className="sr-only">Buscar exercicio</span>
          <IconSearch
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A7868]"
            size={17}
          />
          <input
            className="h-11 w-full rounded-xl border border-[#233F31] bg-[#122019] pl-10 pr-3 text-sm outline-none placeholder:text-[#4A7868]"
            placeholder="Buscar exercicio..."
            readOnly
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Todos", "Peito", "Costas", "Pernas", "Ombro"].map((filter, index) => (
            <button
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                index === 0
                  ? "border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-[#3DD9A4]"
                  : "border-[#233F31] bg-[#122019] text-[#4A7868]"
              }`}
              type="button"
              key={filter}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-[420px] overflow-y-auto p-2">
        {library.map(([name, tag, kind]) => (
          <button
            className="flex min-h-16 w-full min-w-0 items-center gap-3 rounded-xl p-3 text-left transition hover:bg-[#122019]"
            type="button"
            key={name}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#233F31] bg-[#122019] text-[#4A7868]">
              <IconBarbell aria-hidden="true" size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-[#E6F7F0]">
                {name}
              </span>
              <span className="mt-1 flex gap-1.5">
                <span className="rounded-full bg-[#182B22] px-2 py-0.5 text-[10px] text-[#4A7868]">
                  {tag}
                </span>
                <span className="rounded-full bg-[#182B22] px-2 py-0.5 text-[10px] text-[#4A7868]">
                  {kind}
                </span>
              </span>
            </span>
            <IconPlus aria-hidden="true" className="text-[#3DD9A4]" size={18} />
          </button>
        ))}
      </div>
    </aside>
  );
}

function StudentCard() {
  return (
    <button
      className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-[#233F31] bg-[#122019] p-3 text-left"
      type="button"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-xs font-bold text-[#3DD9A4]">
        JP
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-[#E6F7F0]">
          Joao Paulo
        </span>
        <span className="mt-1 block truncate text-xs text-[#4A7868]">
          Plano ativo · Hipertrofia
        </span>
      </span>
      <IconUser aria-hidden="true" className="text-[#4A7868]" size={18} />
    </button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#4A7868]">
        {label}
      </span>
      <input
        className="h-11 w-full rounded-xl border border-[#233F31] bg-[#122019] px-3 text-sm text-[#E6F7F0] outline-none"
        readOnly
        value={value}
      />
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1C3529] bg-[#122019] p-3">
      <p className="font-mono text-xl text-[#3DD9A4]">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[#4A7868]">
        {label}
      </p>
    </div>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <h2 className="font-[var(--font-syne)] text-base font-extrabold tracking-normal text-[#E6F7F0]">
      {label}
    </h2>
  );
}

function SupersetBand() {
  return (
    <div className="mb-3 mt-1 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#EFC027]">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#EFC027]/30 to-transparent" />
      <span className="inline-flex items-center gap-2 rounded-full border border-[#EFC027]/20 bg-[#EFC027]/8 px-3 py-1">
        <IconLink aria-hidden="true" size={13} />
        Superset
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#EFC027]/30 to-transparent" />
    </div>
  );
}

function IconButton({
  danger = false,
  icon: Icon,
  label,
}: {
  danger?: boolean;
  icon: typeof IconCopy;
  label: string;
}) {
  return (
    <button
      className={`grid size-9 place-items-center rounded-xl border ${
        danger ? "border-[#E05050]/25 text-[#E05050]" : "border-[#233F31] text-[#4A7868]"
      }`}
      type="button"
      aria-label={label}
    >
      <Icon aria-hidden="true" size={16} />
    </button>
  );
}

function ReadOnlyInput({ className = "", value }: { className?: string; value: string }) {
  return (
    <input
      className={`h-8 min-w-0 rounded-xl border border-[#233F31] bg-[#122019] px-2 text-center font-mono text-xs text-[#E6F7F0] outline-none ${className}`}
      readOnly
      value={value}
    />
  );
}
