"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { NodusApiError } from "@/lib/api/nodus-api-client";

export function ExerciseLoading({ detail = false }: { detail?: boolean }) {
  return (
    <div
      role="status"
      aria-label={detail ? "Carregando exercício" : "Carregando exercícios"}
      className="space-y-3"
    >
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function SessionExpired() {
  const router = useRouter();
  useMountEffect(() => {
    router.replace("/acesso?perfil=personal", { scroll: false });
  });
  return <p role="status">Sessão encerrada. Voltando ao acesso.</p>;
}

export function ExerciseQueryError({
  error,
  retry,
  detail = false,
}: {
  error: Error;
  retry: () => void;
  detail?: boolean;
}) {
  const api = error instanceof NodusApiError ? error : null;
  if (api?.status === 401) return <SessionExpired />;

  const notFound = detail && api?.status === 404;
  const forbidden = api?.status === 403;
  const remediation = api ? remediationFor(api.code) : null;
  const onboarding = api?.status === 409 && api.code === "ONBOARDING_REQUIRED";

  return (
    <section role="alert" className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-lg font-bold text-ink-primary">
        {remediation
          ? remediation.title
          : notFound
            ? "Exercício não encontrado"
            : forbidden
              ? "Catálogo indisponível para esta conta"
              : detail
                ? "Não foi possível carregar o exercício"
                : "Não foi possível carregar os exercícios"}
      </h2>
      <p className="mt-2 text-sm text-ink-secondary">
        {remediation
          ? remediation.detail
          : notFound
            ? "Verifique o endereço ou volte para o catálogo."
            : forbidden
              ? "Sua conta não tem permissão para consultar este catálogo."
              : (api?.message ?? "Tente novamente.")}
      </p>
      {api && (
        <p className="mt-2 break-all text-xs text-ink-secondary">
          Código: {api.code}
          {api.traceId ? ` · Correlação: ${api.traceId}` : ""}
        </p>
      )}
      {onboarding && (
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/onboarding">Completar perfil</Link>
        </Button>
      )}
      {!notFound && !forbidden && !remediation && (
        <Button variant="outline" className="mt-4" onClick={retry}>
          Tentar novamente
        </Button>
      )}
    </section>
  );
}

function remediationFor(code: string) {
  return (
    {
      ONBOARDING_REQUIRED: {
        title: "Complete seu perfil profissional",
        detail: "Finalize os dados obrigatórios antes de acessar o catálogo.",
      },
      EMAIL_NOT_VERIFIED: {
        title: "E-mail ainda não confirmado",
        detail: "Confirme seu e-mail para acessar esta área.",
      },
      ACCOUNT_INACTIVE: {
        title: "Conta inativa",
        detail: "O acesso volta a ficar disponível quando a conta for reativada.",
      },
      ACCOUNT_BANNED: {
        title: "Conta bloqueada",
        detail: "Esta conta não pode acessar o catálogo enquanto estiver bloqueada.",
      },
      PERSONAL_ROLE_REQUIRED: {
        title: "Área exclusiva do personal",
        detail: "Entre com uma conta de personal para acessar este conteúdo.",
      },
      EXERCISE_FORBIDDEN: {
        title: "Catálogo indisponível para esta conta",
        detail: "Sua conta não tem permissão para consultar este catálogo.",
      },
    } as const
  )[code];
}
