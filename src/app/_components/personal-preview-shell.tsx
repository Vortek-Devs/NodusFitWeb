import {
  IconBarbell,
  IconCalendar,
  IconChartBar,
  IconHelpCircle,
  IconLayoutDashboard,
  IconMessageCircle,
  IconReceipt,
  IconSettings,
  IconTopologyStar3,
  IconUsers,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

type PersonalSection = "dashboard" | "financeiro" | "treinos";

interface IconProps {
  "aria-hidden"?: boolean | "true" | "false";
  className?: string;
  size?: number;
  stroke?: number;
}

type IconLike = ComponentType<IconProps>;

const navGroups = [
  {
    items: [
      {
        href: "/dashboard",
        icon: IconLayoutDashboard,
        key: "dashboard",
        label: "Painel",
      },
      { badge: "28", href: "#", icon: IconUsers, key: "alunos", label: "Alunos" },
      { href: "/treinos/novo", icon: IconBarbell, key: "treinos", label: "Treinos" },
      { href: "#", icon: IconChartBar, key: "relatorios", label: "Relatorios" },
    ],
    label: "Principal",
  },
  {
    items: [
      {
        badge: "3",
        href: "/financeiro",
        icon: IconReceipt,
        key: "financeiro",
        label: "Financeiro",
        mintBadge: true,
      },
      { href: "#", icon: IconMessageCircle, key: "mensagens", label: "Mensagens" },
      { href: "#", icon: IconCalendar, key: "agenda", label: "Agenda" },
    ],
    label: "Gestao",
  },
  {
    items: [
      { href: "#", icon: IconSettings, key: "configuracoes", label: "Configuracoes" },
      { href: "#", icon: IconHelpCircle, key: "suporte", label: "Suporte" },
    ],
    label: "Conta",
  },
] as const;

export function PersonalPreviewShell({
  active,
  children,
}: {
  active: PersonalSection;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#07100D] text-[#E6F7F0]">
      <PersonalAside active={active} />
      <section className="min-h-dvh min-w-0 bg-[#07100D] pb-[72px] lg:ml-[228px] lg:pb-0">
        {children}
      </section>
      <PersonalMobileNav active={active} />
    </main>
  );
}

export function MockupContentFrame({
  hideMockSidebar = false,
  src,
  title,
}: {
  hideMockSidebar?: boolean;
  src: string;
  title: string;
}) {
  return (
    <div className="h-dvh overflow-hidden bg-[#07100D]">
      <iframe
        className={`block h-full border-0 bg-[#07100D] ${
          hideMockSidebar ? "w-[calc(100%+228px)] -translate-x-[228px]" : "w-full"
        }`}
        src={src}
        title={title}
      />
    </div>
  );
}

function PersonalAside({ active }: { active: PersonalSection }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[228px] flex-col border-r border-[#1C3529] bg-[#0D1A15] px-2 py-5 lg:flex">
      <a className="flex items-center gap-3 px-3 pb-6" href="/dashboard">
        <div className="grid size-9 place-items-center rounded-xl bg-[#3DD9A4] text-[#04342C] transition hover:rotate-45">
          <IconTopologyStar3 aria-hidden="true" size={17} />
        </div>
        <span className="font-[var(--font-syne)] text-sm font-extrabold tracking-[0.03em]">
          NODUS <span className="text-[#3DD9A4]">FIT</span>
        </span>
      </a>

      <nav
        className="flex flex-1 flex-col gap-3 overflow-y-auto"
        aria-label="Menu principal"
      >
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#2A5245]">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <PersonalNavItem
                  active={active === item.key}
                  item={item}
                  key={item.key}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#1C3529] p-3">
        <div className="grid size-10 place-items-center rounded-full border border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-xs font-bold text-[#3DD9A4]">
          MP
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Marcos Pereira</p>
          <p className="mt-0.5 text-xs text-[#4A7868]">Personal trainer - Pro</p>
        </div>
      </div>
    </aside>
  );
}

function PersonalMobileNav({ active }: { active: PersonalSection }) {
  const items = [
    { href: "/dashboard", icon: IconLayoutDashboard, key: "dashboard", label: "Painel" },
    { href: "/treinos/novo", icon: IconBarbell, key: "treinos", label: "Treinos" },
    { href: "/financeiro", icon: IconReceipt, key: "financeiro", label: "Financeiro" },
  ] as const;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-[#1C3529] bg-[#0D1A15]/96 px-2 pb-4 pt-2 backdrop-blur-xl lg:hidden"
      aria-label="Menu principal mobile"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;

        return (
          <a
            className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold ${
              isActive ? "bg-[#3DD9A4]/10 text-[#3DD9A4]" : "text-[#4A7868]"
            }`}
            href={item.href}
            key={item.key}
          >
            <Icon aria-hidden="true" size={20} />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

function PersonalNavItem({
  active,
  item,
}: {
  active: boolean;
  item: {
    badge?: string;
    href: string;
    icon: IconLike;
    key: string;
    label: string;
    mintBadge?: boolean;
  };
}) {
  const Icon = item.icon;

  return (
    <a
      className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        active
          ? "bg-[#3DD9A4]/10 text-[#3DD9A4]"
          : "text-[#4A7868] hover:bg-[#122019] hover:text-[#E6F7F0]"
      }`}
      href={item.href}
    >
      {active ? (
        <span className="absolute left-0 h-5 w-0.5 rounded-r bg-[#3DD9A4]" />
      ) : null}
      <Icon aria-hidden="true" size={20} stroke={1.8} />
      <span>{item.label}</span>
      {item.badge ? (
        <span
          className={`ml-auto rounded-full border px-1.5 text-[10px] font-bold ${
            item.mintBadge
              ? "border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-[#3DD9A4]"
              : "border-[#E05050]/25 bg-[#E05050] text-white"
          }`}
        >
          {item.badge}
        </span>
      ) : null}
    </a>
  );
}
