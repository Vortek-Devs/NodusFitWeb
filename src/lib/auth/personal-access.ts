import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isMeResponse, type MeResponse } from "@/lib/contracts/nodus-api";

export interface AuthenticatedPersonal {
  userId: string;
  name: string;
  email: string;
  role: "PERSONAL";
  personalProfileId: string;
}
export type PersonalAccessDecision =
  | { status: "allowed"; identity: AuthenticatedPersonal }
  | { status: "redirect"; redirectTo: string };

const access = "/acesso?perfil=personal";
const unavailable = `${access}&erro=conta-indisponivel`;

export function decidePersonalAccess(me: MeResponse): PersonalAccessDecision {
  const { user, personalProfile, onboarding } = me;
  if (!user.isActive || user.isBanned)
    return { status: "redirect", redirectTo: unavailable };
  if (user.role !== "PERSONAL")
    return { status: "redirect", redirectTo: `${access}&erro=acesso-negado` };
  if (!user.emailVerified)
    return { status: "redirect", redirectTo: `${access}&verificacao=pendente` };
  if (onboarding.required || !user.personalProfileId || !personalProfile)
    return { status: "redirect", redirectTo: "/onboarding" };
  if (personalProfile.id !== user.personalProfileId)
    return { status: "redirect", redirectTo: unavailable };
  return {
    status: "allowed",
    identity: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: "PERSONAL",
      personalProfileId: user.personalProfileId,
    },
  };
}

export async function requirePersonalAccess(): Promise<AuthenticatedPersonal> {
  const decision = await lookupPersonalAccess();
  // Next redirect throws control flow; never catch it as an upstream failure.
  if (decision.status === "redirect") redirect(decision.redirectTo);
  return decision.identity;
}

async function lookupPersonalAccess(): Promise<PersonalAccessDecision> {
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
    // Match the BFF's origin-relative API convention; never forward browser cookies.
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
    return decidePersonalAccess(payload);
  } catch {
    return { status: "redirect", redirectTo: unavailable };
  }
}
