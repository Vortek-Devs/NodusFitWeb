"use client";

import {
  IconBarbell,
  IconCalendar,
  IconChartBar,
  IconHelpCircle,
  IconHome,
  IconLayoutDashboard,
  IconMessageCircle,
  IconPlus,
  IconReceipt,
  IconSettings,
  IconTopologyStar3,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { AuthenticatedPersonal } from "@/lib/auth/personal-access";
import { cn } from "@/lib/utils";

interface IconProps {
  "aria-hidden"?: boolean | "true" | "false";
  className?: string;
  size?: number;
  stroke?: number;
}

type IconLike = ComponentType<IconProps>;

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";

const navigationGroups = [
  {
    items: [
      { href: "/inicio", icon: IconHome, label: "Início" },
      { href: "/dashboard", icon: IconLayoutDashboard, label: "Dashboard" },
      { href: "/alunos", icon: IconUsers, label: "Alunos" },
      { href: "/exercicios", icon: IconBarbell, label: "Exercícios" },
      { icon: IconBarbell, label: "Treinos", planned: true },
      { icon: IconChartBar, label: "Relatórios", planned: true },
    ],
    label: "Principal",
  },
  {
    items: [
      { icon: IconBarbell, label: "Treinos", planned: true },
      { icon: IconReceipt, label: "Financeiro", planned: true },
      { icon: IconMessageCircle, label: "Mensagens", planned: true },
      { icon: IconCalendar, label: "Agenda", planned: true },
    ],
    label: "Gestão",
  },
  {
    items: [
      { icon: IconSettings, label: "Configurações", planned: true },
      { icon: IconHelpCircle, label: "Suporte", planned: true },
    ],
    label: "Conta",
  },
] as const;

const mobileNavigation = [
  { href: "/inicio", icon: IconHome, label: "Início" },
  { href: "/dashboard", icon: IconLayoutDashboard, label: "Dashboard" },
  { href: "/alunos", icon: IconUsers, label: "Alunos" },
  { href: "/exercicios", icon: IconBarbell, label: "Exercícios" },
] as const;

interface PersonalAppShellProps {
  identity: AuthenticatedPersonal;
  todayLabel?: string;
  children: ReactNode;
}

export function PersonalAppShell({
  children,
  identity,
  todayLabel,
}: PersonalAppShellProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const isInicio = pathname === "/inicio";
  const isExercises = pathname === "/exercicios";

  return (
    <div className="min-h-dvh bg-page text-ink-primary">
      <a
        className={cn(
          "sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:flex focus:min-h-11 focus:items-center focus:rounded-lg focus:bg-surface focus:px-4 focus:not-sr-only",
          focus,
        )}
        href="#conteudo-personal"
      >
        Pular para o conteúdo
      </a>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-7 overflow-y-auto border-r border-border bg-surface p-4 lg:flex">
        <Link
          className={cn(
            "flex min-h-11 shrink-0 items-center gap-3 rounded-lg font-[var(--font-syne)] font-extrabold",
            focus,
          )}
          href="/inicio"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-400 text-on-brand">
            <IconTopologyStar3 aria-hidden="true" size={19} stroke={1.8} />
          </span>
          <span>
            NODUS <span className="text-ink-brand">FIT</span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="flex flex-1 flex-col gap-5">
          {navigationGroups.map((group) => (
            <section key={group.label}>
              <h2 className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-tertiary">
                {group.label}
              </h2>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.label}>
                    {"href" in item ? (
                      <NavigationLink
                        active={isRouteActive(pathname, item.href)}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                      />
                    ) : (
                      <PlannedNavigationItem icon={item.icon} label={item.label} />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <IdentityCard identity={identity} />
      </aside>

      <div className="min-h-dvh min-w-0 pb-[calc(var(--spacing-nav)+var(--spacing-safe-bottom))] lg:ml-64 lg:pb-0">
        <header className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto flex min-h-11 w-full max-w-[1360px] items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="hidden text-xs font-semibold uppercase tracking-[0.1em] text-ink-tertiary sm:block">
                Nodus Fit
              </p>
              <h2 className="truncate font-[var(--font-syne)] text-lg font-extrabold sm:text-xl">
                {pageTitle}
              </h2>
            </div>
            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
              {todayLabel ? (
                <span className="hidden whitespace-nowrap text-xs text-ink-tertiary xl:inline">
                  {todayLabel}
                </span>
              ) : null}
              <div className="hidden min-w-0 items-center gap-2 border-l border-border pl-3 md:flex">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-brand-400/25 bg-brand-400/10 text-xs font-bold text-ink-brand"
                >
                  {getInitials(identity.name)}
                </span>
                <span className="min-w-0">
                  <span className="block max-w-40 truncate text-sm font-semibold">
                    {identity.name}
                  </span>
                  <span className="block max-w-40 truncate text-xs text-ink-secondary">
                    {identity.email}
                  </span>
                </span>
              </div>
              {isInicio ? (
                <Button asChild className="min-h-11 shrink-0 px-3 sm:px-4">
                  <Link href="/alunos">
                    <IconPlus aria-hidden="true" size={17} stroke={1.8} />
                    Gerenciar alunos
                  </Link>
                </Button>
              ) : null}
              {isExercises ? (
                <Button asChild className="min-h-11 shrink-0 px-3 sm:px-4">
                  <Link href="/exercicios/novo">
                    <IconPlus aria-hidden="true" size={17} stroke={1.8} />
                    Cadastrar exercício
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
          <div
            className="mt-3 flex min-w-0 items-center gap-2 border-t border-border-muted pt-3 md:hidden"
            data-testid="mobile-identity"
          >
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full border border-brand-400/25 bg-brand-400/10 text-[10px] font-bold text-ink-brand"
            >
              {getInitials(identity.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold">
                {identity.name}
              </span>
              <span className="block truncate text-xs text-ink-secondary">
                {identity.email}
              </span>
            </span>
          </div>
        </header>

        <main
          className="mx-auto w-full max-w-[1360px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7"
          id="conteudo-personal"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      <nav
        aria-label="Navegação principal no celular"
        className="fixed inset-x-0 bottom-0 z-20 flex min-h-[calc(var(--spacing-nav)+var(--spacing-safe-bottom))] items-center border-t border-border bg-surface px-2 pb-safe-bottom lg:hidden"
      >
        {mobileNavigation.map(({ href, icon: Icon, label }) => {
          const active = isRouteActive(pathname, href);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 min-w-11 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1 text-[10px] font-semibold sm:text-xs",
                focus,
                active ? "bg-hover text-ink-brand" : "text-ink-secondary hover:bg-hover",
              )}
              href={href}
              key={href}
            >
              <Icon aria-hidden="true" size={19} stroke={1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function NavigationLink({
  active,
  href,
  icon: Icon,
  label,
}: {
  active: boolean;
  href: string;
  icon: IconLike;
  label: string;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 font-semibold hover:bg-hover",
        focus,
        active ? "bg-hover text-ink-brand" : "text-ink-secondary",
      )}
      href={href}
    >
      <Icon aria-hidden="true" size={20} stroke={1.8} />
      <span>{label}</span>
    </Link>
  );
}

function PlannedNavigationItem({ icon: Icon, label }: { icon: IconLike; label: string }) {
  return (
    <div className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-ink-tertiary">
      <Icon aria-hidden="true" size={20} stroke={1.8} />
      <span className="flex-1 font-semibold">{label}</span>
      <span className="rounded-full border border-border-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
        Planejado
      </span>
    </div>
  );
}

function IdentityCard({ identity }: { identity: AuthenticatedPersonal }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border-muted bg-page p-3">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full border border-brand-400/25 bg-brand-400/10 text-xs font-bold text-ink-brand"
      >
        {getInitials(identity.name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{identity.name}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-secondary">
          {identity.email}
        </span>
      </span>
    </div>
  );
}

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getPageTitle(pathname: string) {
  if (pathname === "/inicio") return "Início";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/alunos" || pathname.startsWith("/alunos/")) return "Alunos";
  if (pathname === "/exercicios" || pathname.startsWith("/exercicios/")) {
    return "Exercícios";
  }
  return "Nodus Fit";
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("pt-BR");
}
