export const INVITE_COOKIE_NAME = "nodus_registration_invite";
export const INVITE_COOKIE_MAX_AGE_SECONDS = 10 * 60;

export function inviteCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: INVITE_COOKIE_MAX_AGE_SECONDS,
  };
}

export function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;

  for (const part of header.split(";")) {
    const [key, ...valueParts] = part.trim().split("=");
    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export function roleForInvite(isValidStudentInvite: boolean): "ALUNO" | "PERSONAL" {
  return isValidStudentInvite ? "ALUNO" : "PERSONAL";
}

export function inviteMatchesSignup(
  invite: { role?: string; email?: string },
  signupEmail: string,
): boolean {
  return (
    invite.role === "ALUNO" &&
    invite.email?.trim().toLowerCase() === signupEmail.trim().toLowerCase()
  );
}
