import type { Metadata } from "next";
import { AccessAuthClient } from "@/components/auth/access-auth-client";
import { validateInviteToken } from "@/lib/auth/mock-auth";
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
  }>;
};

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const params = await searchParams;
  const token = params.token ?? params.convite;
  const requestedRole = params.perfil ?? params.role;
  const initialRole = requestedRole === "aluno" ? "aluno" : "personal";
  const invite = validateInviteToken(token);

  return <AccessAuthClient initialRole={initialRole} invite={invite} token={token} />;
}
