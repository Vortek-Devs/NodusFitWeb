"use client";

import {
  IconBarbell,
  IconCalendar,
  IconChartBar,
  IconHelpCircle,
  IconLayoutDashboard,
  IconMenu2,
  IconMessageCircle,
  IconReceipt,
  IconSettings,
  IconTopologyStar3,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import { useState } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#07100D] text-[#E6F7F0]">
      <PersonalAside active={active} />
      <section className="min-h-dvh min-w-0 overflow-x-hidden bg-[#07100D] pb-[72px] lg:ml-[228px] lg:pb-0">
        {children}
      </section>
      <PersonalMobileMenu
        active={active}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <PersonalMobileNav active={active} onMenuOpen={() => setIsMobileMenuOpen(true)} />
    </main>
  );
}

export function PersonalPreviewPage({
  children,
  topbar,
}: {
  children: React.ReactNode;
  topbar: React.ReactNode;
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

export function PersonalPreviewTopbar({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 border-b border-[#1C3529] bg-[#07100D]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4">{children}</div>
    </header>
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
    <div className="h-[calc(100dvh-72px)] overflow-hidden bg-[#07100D] lg:h-dvh">
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
      <PersonalBrand />
      <PersonalNavGroups active={active} />
      <PersonalUserCard />
    </aside>
  );
}

function PersonalMobileMenu({
  active,
  isOpen,
  onClose,
}: {
  active: PersonalSection;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <button
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
      />
      <aside
        className={`absolute inset-y-0 left-0 flex w-[min(84vw,320px)] flex-col border-r border-[#1C3529] bg-[#0D1A15] px-2 py-5 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu principal"
      >
        <div className="flex items-start justify-between gap-3">
          <PersonalBrand />
          <button
            className="mr-2 grid size-10 place-items-center rounded-xl border border-[#233F31] text-[#89BBAA]"
            type="button"
            aria-label="Fechar menu"
            onClick={onClose}
          >
            <IconX aria-hidden="true" size={18} />
          </button>
        </div>
        <PersonalNavGroups active={active} />
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
    { href: "/dashboard", icon: IconLayoutDashboard, key: "dashboard", label: "Painel" },
    { href: "/treinos/novo", icon: IconBarbell, key: "treinos", label: "Treinos" },
    { href: "/financeiro", icon: IconReceipt, key: "financeiro", label: "Financeiro" },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 grid w-[100dvw] max-w-[100vw] grid-cols-4 overflow-hidden border-t border-[#1C3529] bg-[#0D1A15]/96 px-1.5 pb-4 pt-2 backdrop-blur-xl lg:hidden"
      aria-label="Menu principal mobile"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;

        return (
          <a
            className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-semibold sm:text-[11px] ${
              isActive ? "bg-[#3DD9A4]/10 text-[#3DD9A4]" : "text-[#4A7868]"
            }`}
            href={item.href}
            key={item.key}
          >
            <Icon aria-hidden="true" size={20} />
            <span className="max-w-full truncate">{item.label}</span>
          </a>
        );
      })}
      <button
        className="flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-semibold text-[#4A7868] sm:text-[11px]"
        type="button"
        onClick={onMenuOpen}
      >
        <IconMenu2 aria-hidden="true" size={20} />
        <span className="max-w-full truncate">Menu</span>
      </button>
    </nav>
  );
}

function PersonalBrand() {
  return (
    <a className="flex items-center gap-3 px-3 pb-6" href="/dashboard">
      <div className="grid size-9 place-items-center rounded-xl bg-[#3DD9A4] text-[#04342C] transition hover:rotate-45">
        <IconTopologyStar3 aria-hidden="true" size={17} />
      </div>
      <span className="font-[var(--font-syne)] text-sm font-extrabold tracking-[0.03em]">
        NODUS <span className="text-[#3DD9A4]">FIT</span>
      </span>
    </a>
  );
}

function PersonalNavGroups({ active }: { active: PersonalSection }) {
  return (
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
              <PersonalNavItem active={active === item.key} item={item} key={item.key} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function PersonalUserCard() {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#1C3529] p-3">
      <div className="grid size-10 place-items-center rounded-full border border-[#3DD9A4]/25 bg-[#3DD9A4]/10 text-xs font-bold text-[#3DD9A4]">
        MP
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">Marcos Pereira</p>
        <p className="mt-0.5 text-xs text-[#4A7868]">Personal trainer - Pro</p>
      </div>
    </div>
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
