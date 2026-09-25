import { IconChartBar } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard | Nodus Fit",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <header className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-brand">
          Análises do espaço
        </p>
        <h1 className="mt-2 font-[var(--font-syne)] text-3xl font-extrabold tracking-tight sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Indicadores de evolução quando houver dados reais suficientes para sustentar a
          leitura.
        </p>
      </header>

      <section
        aria-labelledby="dashboard-empty-title"
        className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8"
      >
        <span className="grid size-11 place-items-center rounded-xl border border-brand-400/25 bg-brand-400/10 text-ink-brand">
          <IconChartBar aria-hidden="true" size={21} stroke={1.8} />
        </span>
        <h2
          className="mt-4 font-[var(--font-syne)] text-xl font-extrabold"
          id="dashboard-empty-title"
        >
          Ainda não há dados analíticos
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
          Adesão, evolução e financeiro só aparecem aqui quando as fontes oficiais do
          Nodus fornecerem esses dados. Até lá, acompanhe sua carteira e o catálogo em
          Início — sem números de demonstração.
        </p>
        <Button asChild className="mt-5">
          <Link href="/inicio">Ir para Início</Link>
        </Button>
      </section>
    </section>
  );
}
