import type { ReactNode } from "react";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";

type PublicPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PublicPageShell({
  eyebrow,
  title,
  description,
  children,
}: PublicPageShellProps) {
  return (
    <div className="min-h-screen bg-page text-ink-primary">
      <PublicHeader />
      <main className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-brand">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-brand-50 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg font-medium leading-8 text-ink-secondary">
            {description}
          </p>
          <div className="mt-10 space-y-6 text-base font-medium leading-7 text-ink-secondary">
            {children}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
