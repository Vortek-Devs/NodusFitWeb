import type { AuthUser } from "./access-actions";

export type AuthResult =
  | {
      status: "authenticated";
      redirectTo: string;
      message: string;
      user: AuthUser;
      authMethod: "email" | "google";
    }
  | {
      status: "verification-required";
      code: "EMAIL_NOT_VERIFIED";
      email: string;
      callbackURL: string;
      message: string;
    }
  | { status: "error"; code?: string; field?: string; message: string };
export type AuthErrorResult = Extract<AuthResult, { status: "error" }>;
export type GoogleRedirectResult = { status: "redirecting"; message: string };
export type AuthActionResult = AuthResult | GoogleRedirectResult;
export type InvitePreparationResult = { status: "prepared" } | AuthErrorResult;
export type InviteCompletionResult =
  | { status: "accepted"; redirectTo: "/aluno" }
  | { status: "cancelled" }
  | AuthErrorResult;

export function verificationRequired(
  email: string,
  callbackURL: string,
  message = "Confirme seu e-mail para continuar.",
): AuthResult {
  return {
    status: "verification-required",
    code: "EMAIL_NOT_VERIFIED",
    email,
    callbackURL,
    message,
  };
}

export function mapBetterAuthFailure(
  error: { code?: string; message?: string },
  email: string,
  callbackURL: string,
): AuthResult {
  if (error.code === "EMAIL_NOT_VERIFIED")
    return verificationRequired(email, callbackURL);
  return {
    status: "error",
    code: error.code,
    message: "Não foi possível autenticar. Confira os dados e tente novamente.",
  };
}
