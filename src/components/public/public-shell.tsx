import type { ReactNode } from "react";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";

type PublicShellProps = {
  children: ReactNode;
};

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-hero-dark text-ink-primary">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
