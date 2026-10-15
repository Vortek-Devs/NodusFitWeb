import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isMeResponse, type MeResponse } from "@/lib/contracts/nodus-api";

export interface AuthenticatedStudent {
  userId: string;
  name: string;
  email: string;
  studentProfileId: string;
}

export type StudentAccessDecision =
  | { status: "allowed"; identity: AuthenticatedStudent }
  | { status: "redirect"; redirectTo: string };

const access = "/acesso?perfil=aluno";
const unavailable = `${access}&erro=conta-indisponivel`;

export function decideStudentAccess(me: MeResponse): StudentAccessDecision {
  const { user, studentProfile, onboarding } = me;
  if (!user.isActive || user.isBanned)
    return { status: "redirect", redirectTo: unavailable };
  if (user.role !== "ALUNO")
    return { status: "redirect", redirectTo: `${access}&erro=acesso-negado` };
  if (!user.emailVerified)
    return { status: "redirect", redirectTo: `${access}&verificacao=pendente` };
  if (
    onboarding.required ||
    !user.studentProfileId ||
    !studentProfile ||
    studentProfile.id !== user.studentProfileId ||
    studentProfile.status !== "ACTIVE"
  )
    return { status: "redirect", redirectTo: unavailable };
  return {
    status: "allowed",
    identity: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      studentProfileId: user.studentProfileId,
    },
  };
}

export async function requireStudentAccess(): Promise<AuthenticatedStudent> {
  const decision = await lookupStudentAccess();
  // Next redirect throws control flow; never catch it as an upstream failure.
  if (decision.status === "redirect") redirect(decision.redirectTo);
  return decision.identity;
}

async function lookupStudentAccess(): Promise<StudentAccessDecision> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      returnHeaders: true,
    });
    if (!session.response) return { status: "redirect", redirectTo: access };
    const jwt = session.headers.get("set-auth-jwt");
    if (!jwt?.trim() || !session.response.user.id?.trim())
      return { status: "redirect", redirectTo: unavailable };
    const base = new URL(process.env.NODUS_API_URL ?? "");
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password)
      return { status: "redirect", redirectTo: unavailable };
    const response = await fetch(new URL("/api/me", base), {
      headers: { accept: "application/json", authorization: `Bearer ${jwt}` },
      cache: "no-store",
      redirect: "manual",
    });
    if (response.status === 401) return { status: "redirect", redirectTo: access };
    if (!response.ok) return { status: "redirect", redirectTo: unavailable };
    const payload: unknown = await response.json();
    if (!isMeResponse(payload) || payload.user.userId !== session.response.user.id)
      return { status: "redirect", redirectTo: unavailable };
    return decideStudentAccess(payload);
  } catch {
    return { status: "redirect", redirectTo: unavailable };
  }
}
