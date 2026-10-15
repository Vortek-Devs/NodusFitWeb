import { redirect } from "next/navigation";

type RegistrationAliasPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function RegistrationAliasPage({
  searchParams,
}: RegistrationAliasPageProps) {
  const { token } = await searchParams;
  if (typeof token !== "string" || token.trim().length === 0) {
    redirect("/acesso?perfil=aluno");
  }
  redirect(`/acesso?perfil=aluno&token=${encodeURIComponent(token.trim())}`);
}
