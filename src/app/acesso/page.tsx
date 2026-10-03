import type { Metadata } from "next";
import { AccessAuthClient } from "@/components/auth/access-auth-client";
import { validateInviteToken } from "@/lib/auth/invite-validation";
import { createPublicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Acesso | Nodus Fit",
  description:
    "Entre ou crie sua conta no Nodus Fit como personal trainer ou aluno convidado.",
  path: "/acesso",
});

type AccessPageProps = {
  searchParams: Promise<{
    perfil?: string;
    role?: string;
    token?: string;
    convite?: string;
    emailVerificado?: string;
    verificacao?: string;
    erro?: string;
  }>;
};

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const params = await searchParams;
  const token = params.token ?? params.convite;
  const requestedRole = params.perfil ?? params.role;
  const initialRole = requestedRole === "aluno" ? "aluno" : "personal";
  const invite = await validateInviteToken(token);

  return (
    <AccessAuthClient
      initialRole={initialRole}
      invite={invite}
      token={token}
      emailVerifiedCallback={params.emailVerificado === "1"}
      verificationPending={params.verificacao === "pendente"}
      accountError={
        params.erro === "conta-indisponivel" || params.erro === "acesso-negado"
          ? params.erro
          : undefined
      }
    />
  );
}
