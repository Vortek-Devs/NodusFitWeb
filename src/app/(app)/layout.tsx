import type { ReactNode } from "react";
import { PersonalAppShell } from "@/components/app/personal-app-shell";
import { QueryProvider } from "@/components/providers/query-provider";
import { requirePersonalAccess } from "@/lib/auth/personal-access";

export default async function PersonalAppLayout({ children }: { children: ReactNode }) {
  const identity = await requirePersonalAccess();
  const todayLabel = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
  return (
    <QueryProvider key={identity.userId}>
      <PersonalAppShell identity={identity} todayLabel={todayLabel}>
        {children}
      </PersonalAppShell>
    </QueryProvider>
  );
}
