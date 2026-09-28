"use client";

import { IconBarbell, IconTopologyStar3, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { AuthenticatedPersonal } from "@/lib/auth/personal-access";
import { cn } from "@/lib/utils";

interface PersonalAppShellProps {
  identity: AuthenticatedPersonal;
  children: ReactNode;
}

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";

function navigationLinkClassName(active: boolean) {
  return cn(
    "flex min-h-11 min-w-11 items-center gap-3 rounded-lg px-3 py-2 font-semibold hover:bg-hover active:bg-hover",
    focus,
    active ? "bg-hover text-ink-brand" : "text-ink-secondary",
  );
}

export function PersonalAppShell({ identity, children }: PersonalAppShellProps) {
  const pathname = usePathname();
  const studentsActive = pathname === "/alunos" || pathname.startsWith("/alunos/");
  const exercisesActive =
    pathname === "/exercicios" || pathname.startsWith("/exercicios/");
  const navigationItems = [
    { href: "/alunos", label: "Alunos", icon: IconUsers, active: studentsActive },
    {
      href: "/exercicios",
      label: "Exercícios",
      icon: IconBarbell,
      active: exercisesActive,
    },
  ];
  return (
    <div className="min-h-dvh bg-page text-ink-primary">
      <a
        href="#conteudo-personal"
        className={cn(
          "sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:flex focus:min-h-11 focus:items-center focus:rounded-lg focus:bg-surface focus:px-4 focus:not-sr-only",
          focus,
        )}
      >
        Pular para o conteúdo
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-[228px] flex-col gap-8 overflow-y-auto border-r border-border bg-surface p-4 lg:flex">
        <Link
          className={cn(
            "flex min-h-11 shrink-0 items-center gap-3 rounded-lg font-[var(--font-syne)] font-extrabold",
            focus,
          )}
          href="/alunos"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-400 text-on-brand">
            <IconTopologyStar3 aria-hidden="true" size={18} stroke={1.8} />
          </span>
          <span>
            NODUS <span className="text-ink-brand">FIT</span>
          </span>
        </Link>
        <nav aria-label="Navegação do personal" className="flex flex-1 flex-col gap-1">
          {navigationItems.map(({ active, href, icon: Icon, label }) => (
            <Link
              key={href}
              className={navigationLinkClassName(active)}
              aria-current={active ? "page" : undefined}
              href={href}
            >
              <Icon aria-hidden="true" size={20} stroke={1.8} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="min-w-0 border-t border-border pt-4 text-sm">
          <p className="wrap-anywhere font-semibold">{identity.name}</p>
          <p className="mt-1 wrap-anywhere text-ink-secondary">{identity.email}</p>
        </div>
      </aside>
      <div className="min-h-dvh min-w-0 pb-[calc(var(--spacing-nav)+var(--spacing-safe-bottom))] lg:ml-[228px] lg:pb-0">
        <header className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4">
            <span className="shrink-0 font-semibold">
              {exercisesActive ? "Exercícios" : "Alunos"}
            </span>
            <span className="min-w-0 wrap-anywhere text-right text-sm text-ink-secondary">
              {identity.name}
            </span>
          </div>
        </header>
        <main
          id="conteudo-personal"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7"
        >
          {children}
        </main>
      </div>
      <nav
        aria-label="Navegação do personal mobile"
        className="fixed inset-x-0 bottom-0 z-20 flex min-h-[calc(var(--spacing-nav)+var(--spacing-safe-bottom))] items-center border-t border-border bg-surface px-4 pb-safe-bottom lg:hidden"
      >
        {navigationItems.map(({ active, href, icon: Icon, label }) => (
          <Link
            key={href}
            aria-current={active ? "page" : undefined}
            className={cn(navigationLinkClassName(active), "flex-1 justify-center")}
            href={href}
          >
            <Icon aria-hidden="true" size={20} stroke={1.8} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
