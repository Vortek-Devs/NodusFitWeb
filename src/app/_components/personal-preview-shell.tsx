"use client";

import {
  IconBarbell,
  IconChartBar,
  IconLayoutDashboard,
  IconMenu2,
  IconMessageCircle,
  IconReceipt,
  IconTopologyStar3,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";

type PersonalSection =
  | "dashboard"
  | "alunos"
  | "exercicios"
  | "financeiro"
  | "mensagens"
  | "relatorios"
  | "treinos";

interface IconProps {
  "aria-hidden"?: boolean | "true" | "false";
  className?: string;
  size?: number;
  stroke?: number;
}

type IconLike = ComponentType<IconProps>;

interface PreviewNavItem {
  badge?: string;
  href?: string;
  icon: IconLike;
  key: PersonalSection;
  label: string;
  planned?: boolean;
}

const navGroups: { items: PreviewNavItem[]; label: string }[] = [
  {
    items: [
      {
        href: "/preview/dashboard",
        icon: IconLayoutDashboard,
        key: "dashboard",
        label: "Painel",
      },
      { badge: "28", href: "/alunos", icon: IconUsers, key: "alunos", label: "Alunos" },
      {
        href: "/exercicios",
        icon: IconBarbell,
        key: "exercicios",
        label: "Exercícios",
      },
      {
        icon: IconBarbell,
        key: "treinos",
        label: "Treinos",
        planned: true,
      },
      {
        icon: IconChartBar,
        key: "relatorios",
        label: "Relatórios",
        planned: true,
      },
    ],
    label: "Principal",
  },
  {
    items: [
      {
        badge: "3",
        icon: IconReceipt,
        key: "financeiro",
        label: "Financeiro",
        planned: true,
      },
      {
        icon: IconMessageCircle,
        key: "mensagens",
        label: "Mensagens",
        planned: true,
      },
    ],
    label: "Gestão",
  },
];

export function PersonalPreviewShell({
  active,
  children,
}: {
  active: PersonalSection;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <PersonalPreviewShellContent active={active} key={pathname}>
      {children}
    </PersonalPreviewShellContent>
  );
}

function PersonalPreviewShellContent({
  active,
  children,
}: {
  active: PersonalSection;
  children: ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#07100D] text-[#E6F7F0]">
      <PersonalAside active={active} />
      <section className="min-h-dvh min-w-0 overflow-x-hidden bg-[#07100D] pb-[calc(72px+env(safe-area-inset-bottom))] lg:ml-[228px] lg:pb-0">
        {children}
      </section>
      {isMobileMenuOpen ? (
        <PersonalMobileMenu active={active} onClose={() => setIsMobileMenuOpen(false)} />
      ) : null}
      <PersonalMobileNav active={active} onMenuOpen={() => setIsMobileMenuOpen(true)} />
    </main>
  );
}

export function PersonalPreviewPage({
  children,
  topbar,
}: {
  children: ReactNode;
  topbar: ReactNode;
}) {
  return (
    <section className="min-h-dvh min-w-0 overflow-x-hidden bg-[radial-gradient(rgba(61,217,164,0.035)_1px,transparent_1px)] [background-size:22px_22px]">
      {topbar}
      <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {children}
      </div>
    </section>
  );
}

export function PersonalPreviewTopbar({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 border-b border-[#1C3529] bg-[#07100D]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4">{children}</div>
    </header>
  );
}

function PersonalAside({ active }: { active: PersonalSection }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[228px] flex-col border-r border-[#1C3529] bg-[#0D1A15] px-2 py-5 lg:flex">
      <PersonalBrand />
      <PersonalNavGroups active={active} />
      <PersonalUserCard />
    </aside>
  );
}

function PersonalMobileMenu({
  active,
  onClose,
}: {
  active: PersonalSection;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        className="absolute inset-0 bg-black/60"
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
      />
      <aside
        className="absolute inset-y-0 left-0 flex w-[min(84vw,320px)] flex-col border-r border-[#1C3529] bg-[#0D1A15] px-2 py-5 shadow-2xl"
        aria-label="Menu principal"
      >
        <div className="flex items-start justify-between gap-3">
          <PersonalBrand onNavigate={onClose} />
          <button
            className="mr-2 grid size-11 place-items-center rounded-xl border border-[#233F31] text-[#89BBAA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
            type="button"
            aria-label="Fechar menu"
            onClick={onClose}
          >
            <IconX aria-hidden="true" size={18} />
          </button>
        </div>
        <PersonalNavGroups active={active} onNavigate={onClose} />
        <PersonalUserCard />
      </aside>
    </div>
  );
}

function PersonalMobileNav({
  active,
  onMenuOpen,
}: {
  active: PersonalSection;
  onMenuOpen: () => void;
}) {
  const items = [
    {
      href: "/preview/dashboard",
      icon: IconLayoutDashboard,
      key: "dashboard",
      label: "Painel",
    },
    { href: "/alunos", icon: IconUsers, key: "alunos", label: "Alunos" },
    {
      href: "/exercicios",
      icon: IconBarbell,
      key: "exercicios",
      label: "Exercícios",
    },
  ] as const;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#1C3529] bg-[#0D1A15]/96 px-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 lg:hidden"
      aria-label="Navegação de demonstração no celular"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 sm:text-[11px] ${
              isActive ? "bg-[#3DD9A4]/10 text-[#3DD9A4]" : "text-[#4A7868]"
            }`}
            href={item.href}
            key={item.key}
          >
            <Icon aria-hidden="true" size={20} />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
      <button
        className="flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-semibold text-[#4A7868] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 sm:text-[11px]"
        type="button"
        onClick={onMenuOpen}
      >
        <IconMenu2 aria-hidden="true" size={20} />
        <span className="max-w-full truncate">Menu</span>
      </button>
    </nav>
  );
}

function PersonalBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      className="flex min-h-11 items-center gap-3 px-3 pb-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
      href="/preview/dashboard"
      onClick={onNavigate}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-[#3DD9A4] text-[#04342C]">
        <IconTopologyStar3 aria-hidden="true" size={17} />
      </span>
      <span className="font-[var(--font-syne)] text-sm font-extrabold tracking-[0.03em]">
        NODUS <span className="text-[#3DD9A4]">FIT</span>
      </span>
    </Link>
  );
}

function PersonalNavGroups({
  active,
  onNavigate,
}: {
  active: PersonalSection;
  onNavigate?: () => void;
}) {
  return (
    <nav
      className="flex flex-1 flex-col gap-3 overflow-y-auto"
      aria-label="Menu principal da demonstração"
    >
      {navGroups.map((group) => (
        <section key={group.label}>
          <h2 className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#2A5245]">
            {group.label}
          </h2>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.key}>
                <PersonalNavItem
                  active={active === item.key}
                  item={item}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}

function PersonalUserCard() {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#1C3529] p-3">
      <span className="grid size-10 place-items-center rounded-full border border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-xs font-bold text-[#3DD9A4]">
        MP
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">Marcos Pereira</span>
        <span className="mt-0.5 block truncate text-xs text-[#4A7868]">
          Conta de demonstração
        </span>
      </span>
    </div>
  );
}

function PersonalNavItem({
  active,
  item,
  onNavigate,
}: {
  active: boolean;
  item: PreviewNavItem;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const className = `relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
    active
      ? "bg-[#3DD9A4]/10 text-[#3DD9A4]"
      : item.planned
        ? "text-[#4A7868]"
        : "text-[#89BBAA] hover:bg-[#122019] hover:text-[#E6F7F0]"
  }`;
  const content = (
    <>
      {active ? (
        <span
          aria-hidden="true"
          className="absolute left-0 h-5 w-0.5 rounded-r bg-[#3DD9A4]"
        />
      ) : null}
      <Icon aria-hidden="true" size={20} stroke={1.8} />
      <span className="min-w-0 flex-1">{item.label}</span>
      {item.planned ? (
        <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-[#4A7868]">
          Planejado
        </span>
      ) : item.badge ? (
        <span className="shrink-0 rounded-full border border-[#3DD9A4]/25 bg-[#3DD9A4]/10 px-1.5 text-[10px] font-bold text-[#3DD9A4]">
          {item.badge}
        </span>
      ) : null}
    </>
  );

  if (!item.href) {
    return (
      <div aria-disabled="true" className={className}>
        {content}
      </div>
    );
  }

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`${className} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400`}
      href={item.href}
      onClick={onNavigate}
    >
      {content}
    </Link>
  );
}
