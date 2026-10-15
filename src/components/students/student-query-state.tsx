"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { NodusApiError } from "@/lib/api/nodus-api-client";

export function StudentLoading({ detail = false }: { detail?: boolean }) {
  return (
    <div
      role="status"
      aria-label={detail ? "Carregando aluno" : "Carregando alunos"}
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
export function StudentQueryError({
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
  const denied = api?.status === 403;
  const remediation = api ? remediationFor(api.code) : null;
  const onboarding = api?.status === 409 && api.code === "ONBOARDING_REQUIRED";
  return (
    <section role="alert" className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-lg font-bold text-ink-primary">
        {remediation
          ? remediation.title
          : notFound
            ? "Aluno não encontrado"
            : denied
              ? "Acesso indisponível"
              : detail
                ? "Não foi possível carregar o aluno"
                : "Não foi possível carregar os alunos"}
      </h2>
      <p className="mt-2 text-sm text-ink-secondary">
        {remediation
          ? remediation.detail
          : notFound
            ? "Verifique o endereço ou volte para a lista."
            : denied
              ? "Sua conta não tem acesso a este conteúdo. Verifique a confirmação do e-mail e a situação da conta."
              : (api?.message ?? "Tente novamente.")}
      </p>
      {api && (
        <p className="mt-2 break-all text-xs text-ink-tertiary">
          Código: {api.code}
          {api.traceId ? ` · Correlação: ${api.traceId}` : ""}
        </p>
      )}
      {onboarding && (
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/onboarding">Completar perfil</Link>
        </Button>
      )}
      {!notFound && !denied && !remediation && (
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
        detail: "Finalize os dados obrigatórios antes de acessar seus alunos.",
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
        detail: "Esta conta não pode acessar o conteúdo enquanto estiver bloqueada.",
      },
      PERSONAL_ROLE_REQUIRED: {
        title: "Área exclusiva do personal",
        detail: "Entre com uma conta de personal para acessar este conteúdo.",
      },
    } as const
  )[code];
}
