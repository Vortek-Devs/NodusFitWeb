export const INVITE_HEADER_NAME = "x-nodus-invite-token";
const INVITE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export type SignupInviteContext =
  | { status: "absent" }
  | { status: "invalid" }
  | { status: "present"; token: string };
export type SignupInviteValidation = "absent" | "valid" | "invalid";

export function buildOAuthSignupState(
  intent: "personal" | "student",
  token?: string,
): Record<string, string> {
  return intent === "student"
    ? { nodusSignupIntent: intent, nodusInviteToken: token ?? "" }
    : { nodusSignupIntent: intent };
}

export function parseInviteToken(token: string): SignupInviteContext {
  const normalized = token.trim();
  return INVITE_TOKEN_PATTERN.test(normalized)
    ? { status: "present", token: normalized }
    : { status: "invalid" };
}

export function readSignupInviteContext(
  headers: Headers | null,
  path?: string,
  oauthState?: unknown,
): SignupInviteContext {
  if (isOAuthCallback(path)) {
    if (!isRecord(oauthState) || oauthState.requestSignUp !== true) {
      return { status: "invalid" };
    }
    if (
      oauthState.nodusSignupIntent === "personal" &&
      oauthState.nodusInviteToken === undefined
    ) {
      return { status: "absent" };
    }
    if (
      oauthState.nodusSignupIntent === "student" &&
      typeof oauthState.nodusInviteToken === "string"
    ) {
      return parseInviteToken(oauthState.nodusInviteToken);
    }
    return { status: "invalid" };
  }

  const nativeToken = headers?.get(INVITE_HEADER_NAME) ?? null;
  return nativeToken === null ? { status: "absent" } : parseInviteToken(nativeToken);
}

function isOAuthCallback(path?: string): boolean {
  return Boolean(
    path === "/callback" ||
      path?.startsWith("/callback/") ||
      path?.startsWith("/oauth2/callback/"),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function roleForInvite(
  validation: SignupInviteValidation,
): "ALUNO" | "PERSONAL" | null {
  if (validation === "valid") return "ALUNO";
  if (validation === "absent") return "PERSONAL";
  return null;
}

export function inviteMatchesSignup(invite: unknown, signupEmail: string): boolean {
  if (!invite || typeof invite !== "object" || Array.isArray(invite)) return false;
  const { role, email } = invite as Record<string, unknown>;
  return (
    role === "ALUNO" &&
    typeof email === "string" &&
    email.trim().toLowerCase() === signupEmail.trim().toLowerCase()
  );
}
