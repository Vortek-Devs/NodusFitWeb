import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requirePersonalAccess } from "@/lib/auth/personal-access";

export default async function ProfilePage() {
  const identity = await requirePersonalAccess();
  const initials = identity.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("pt-BR");

  return (
    <div className="space-y-5">
      <header className="border-b border-border pb-5">
        <p className="text-sm font-semibold text-ink-brand">Conta</p>
        <h1 className="mt-1 text-3xl font-bold text-ink-primary">Meu perfil</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Dados da conta usada para acessar o Nodus Fit.
        </p>
      </header>
      <section
        aria-labelledby="profile-card-title"
        className="max-w-2xl rounded-xl border border-border bg-surface p-5 sm:p-6"
      >
        <div className="flex min-w-0 items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-400 text-lg font-bold text-on-brand"
          >
            {initials || "NF"}
          </span>
          <div className="min-w-0">
            <h2
              className="truncate text-xl font-bold text-ink-primary"
              id="profile-card-title"
            >
              {identity.name}
            </h2>
            <p className="mt-1 break-all text-sm text-ink-secondary">{identity.email}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-ink-secondary">Tipo de conta</dt>
            <dd className="mt-1 font-semibold text-ink-primary">Personal</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-secondary">Acesso</dt>
            <dd className="mt-1 font-semibold text-ink-primary">Ativo</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-ink-secondary">
          Este perfil é somente leitura por enquanto.
        </p>
      </section>
      <Button asChild variant="outline">
        <Link href="/inicio">Voltar para o início</Link>
      </Button>
    </div>
  );
}
