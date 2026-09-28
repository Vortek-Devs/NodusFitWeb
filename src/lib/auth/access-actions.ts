"use client";

import type { InviteValidation } from "@/lib/auth/invite-validation";
import { authClient } from "@/lib/auth-client";
import { isMeResponse } from "@/lib/contracts/nodus-api";
import {
  type AuthActionResult,
  type AuthErrorResult,
  type AuthResult,
  type InviteCompletionResult,
  type InvitePreparationResult,
  mapBetterAuthFailure,
  verificationRequired,
} from "./auth-result";
import { buildOAuthSignupState, INVITE_HEADER_NAME } from "./invite-context";
import { buildVerificationCallback } from "./verification-callback";

export type { InviteValidation } from "@/lib/auth/invite-validation";
export type { AuthActionResult, AuthResult } from "./auth-result";
export type AuthRole = "personal" | "aluno";
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: AuthRole;
  personalId: string | null;
  emailVerified: boolean;
};
export type PersonalEmailRegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const unavailable: AuthErrorResult = {
  status: "error",
  message: "Não foi possível confirmar seu acesso. Tente novamente.",
};

export async function personalEmailLogin(
  email: string,
  password: string,
): Promise<AuthResult> {
  return emailLogin(email, password, buildVerificationCallback("personal"));
}
export async function personalEmailRegister(
  payload: PersonalEmailRegisterPayload,
): Promise<AuthResult> {
  const callbackURL = buildVerificationCallback("personal");
  try {
    const result = await authClient.signUp.email({
      email: payload.email,
      name: [payload.firstName.trim(), payload.lastName.trim()].join(" ").trim(),
      password: payload.password,
      callbackURL,
    });
    if (result.error)
      return mapBetterAuthFailure(result.error, payload.email, callbackURL);
    return verificationRequired(
      payload.email,
      callbackURL,
      "Conta criada. Confirme seu e-mail para continuar.",
    );
  } catch {
    return unavailable;
  }
}
export async function studentLogin(
  email: string,
  password: string,
  token?: string,
): Promise<AuthResult> {
  const callbackURL = token
    ? buildVerificationCallback("aluno", token)
    : "/acesso?perfil=aluno&emailVerificado=1";
  return emailLogin(email, password, callbackURL);
}
async function emailLogin(
  email: string,
  password: string,
  callbackURL: string,
): Promise<AuthResult> {
  try {
    const result = await authClient.signIn.email({ email, password, callbackURL });
    if (result.error) return mapBetterAuthFailure(result.error, email, callbackURL);
    if (!result.data?.user) return unavailable;
    return resolveAuthenticatedAccess(result.data.user.id, "email");
  } catch {
    return unavailable;
  }
}
export async function studentRegister(
  invite: InviteValidation,
  email: string,
  name: string,
  password: string,
  token?: string,
): Promise<AuthResult> {
  if (invite.status !== "valid" || !token)
    return {
      status: "error",
      code: "INVITE_INVALID",
      message: "Convite inválido ou expirado.",
    };
  try {
    const callbackURL = buildVerificationCallback("aluno", token);
    const prepared = await prepareInvite(token);
    if (prepared.status === "error") return prepared;
    const result = await authClient.signUp.email(
      { email, name, password, callbackURL },
      { headers: { [INVITE_HEADER_NAME]: token } },
    );
    if (result.error) return mapBetterAuthFailure(result.error, email, callbackURL);
    return verificationRequired(
      email,
      callbackURL,
      "Conta criada. Confirme seu e-mail para aceitar o convite.",
    );
  } catch {
    return unavailable;
  }
}
export async function requestVerificationEmail(
  email: string,
  callbackURL: string,
): Promise<AuthResult> {
  try {
    const result = await authClient.sendVerificationEmail({ email, callbackURL });
    if (result.error)
      return {
        status: "error",
        code: result.error.code,
        message: "Não foi possível solicitar um novo e-mail. Tente novamente.",
      };
    return verificationRequired(
      email,
      callbackURL,
      "Solicitação recebida. Verifique sua caixa de entrada.",
    );
  } catch {
    return {
      status: "error",
      message: "Não foi possível solicitar um novo e-mail. Tente novamente.",
    };
  }
}
export async function personalGoogleLogin(): Promise<AuthActionResult> {
  return startGoogle("/acesso?perfil=personal");
}
export async function personalGoogleStart(): Promise<AuthActionResult> {
  return startGoogle("/acesso?perfil=personal", { role: "personal" });
}
export async function personalGoogleCompleteProfile(): Promise<AuthResult> {
  return {
    status: "error",
    message: "Complete os dados obrigatórios do perfil na etapa de onboarding.",
  };
}
export async function studentGoogleLogin(): Promise<AuthActionResult> {
  return startGoogle("/acesso?perfil=aluno");
}
export async function studentGoogleRegister(
  invite: InviteValidation,
  token?: string,
): Promise<AuthActionResult> {
  if (invite.status !== "valid" || !token)
    return { status: "error", message: "Convite inválido ou expirado." };
  const prepared = await prepareInvite(token);
  if (prepared.status === "error") return prepared;
  return startGoogle(`/acesso?perfil=aluno&token=${encodeURIComponent(token)}`, {
    role: "student",
    token,
  });
}
async function startGoogle(
  callbackURL: string,
  signup?: { role: "personal" } | { role: "student"; token: string },
): Promise<AuthActionResult> {
  try {
    const additionalData = signup
      ? buildOAuthSignupState(signup.role, "token" in signup ? signup.token : undefined)
      : undefined;
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL,
      requestSignUp: Boolean(signup),
      ...(additionalData ? { additionalData } : {}),
    });
    if (result.error)
      return {
        status: "error",
        code: result.error.code,
        message: "Não foi possível iniciar o Google. Tente novamente.",
      };
    // BetterAuth owns provider navigation; the client must not navigate to callbackURL here.
    return { status: "redirecting", message: "Redirecionando para o Google." };
  } catch {
    return unavailable;
  }
}
export async function prepareInvite(token: string): Promise<InvitePreparationResult> {
  try {
    buildVerificationCallback("aluno", token);
    const response = await fetch("/api/registration-invites/prepare", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token }),
    });
    return response.ok
      ? { status: "prepared" }
      : readResponseError(response, "Convite inválido ou expirado.");
  } catch {
    return {
      status: "error",
      message: "Não foi possível preparar o convite. Confira o link e tente novamente.",
    };
  }
}
export async function completeVerifiedStudentInvite(
  token: string,
  isCurrent = () => true,
): Promise<InviteCompletionResult> {
  try {
    if (!isCurrent()) return { status: "cancelled" };
    // Public preparation rejects used tokens; authenticated acceptance is idempotent
    // for the same student and must remain retryable after a lost response.
    const response = await fetch("/api/registration-invites/accept", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token }),
    });
    if (!response.ok)
      return readResponseError(response, "Não foi possível aceitar o convite.");
    return { status: "accepted", redirectTo: "/aluno" };
  } catch {
    return {
      status: "error",
      message: "Não foi possível aceitar o convite. Tente novamente.",
    };
  }
}
export async function resolveAuthenticatedAccess(
  sessionUserId: string,
  authMethod: "email" | "google",
  signal?: AbortSignal,
): Promise<AuthResult> {
  try {
    const response = await fetch("/api/backend/me", {
      credentials: "include",
      cache: "no-store",
      signal,
    });
    if (!response.ok) return unavailable;
    const payload: unknown = await response.json();
    if (!isMeResponse(payload)) return unavailable;
    const me = payload;
    const user = me.user;
    if (
      !user ||
      user.userId !== sessionUserId ||
      user.emailVerified !== true ||
      user.isActive !== true ||
      user.isBanned !== false ||
      (user.role !== "PERSONAL" && user.role !== "ALUNO") ||
      typeof me.onboarding?.required !== "boolean"
    )
      return unavailable;
    return {
      status: "authenticated",
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role === "ALUNO" ? "aluno" : "personal",
        personalId: user.personalProfileId,
        emailVerified: true,
      },
      redirectTo:
        user.role === "ALUNO"
          ? "/aluno"
          : me.onboarding.required
            ? "/onboarding"
            : "/inicio",
      message: "Login confirmado.",
      authMethod,
    };
  } catch {
    return unavailable;
  }
}
async function readResponseError(
  response: Response,
  fallback: string,
): Promise<AuthErrorResult> {
  const body: unknown = await response.json().catch(() => null);
  if (body && typeof body === "object") {
    return {
      status: "error",
      code: "code" in body && typeof body.code === "string" ? body.code : undefined,
      message:
        "detail" in body && typeof body.detail === "string" ? body.detail : fallback,
    };
  }
  return { status: "error", message: fallback };
}
