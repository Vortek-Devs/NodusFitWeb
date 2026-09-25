import { describe, expect, it } from "vitest";
import {
  INVITE_COOKIE_MAX_AGE_SECONDS,
  inviteCookieOptions,
  inviteMatchesSignup,
  parseCookie,
  roleForInvite,
} from "./invite-context";

describe("invite context", () => {
  it("does not allow a form value to choose the user role", () => {
    expect(roleForInvite(false)).toBe("PERSONAL");
    expect(roleForInvite(true)).toBe("ALUNO");
  });

  it("only grants student role when invite email matches signup email", () => {
    expect(
      inviteMatchesSignup(
        { role: "ALUNO", email: "aluno@example.com" },
        "ALUNO@example.com",
      ),
    ).toBe(true);
    expect(
      inviteMatchesSignup(
        { role: "ALUNO", email: "outro@example.com" },
        "aluno@example.com",
      ),
    ).toBe(false);
  });

  it("reads the opaque invite token from the server cookie", () => {
    expect(
      parseCookie(
        "other=1; nodus_registration_invite=abc%20123",
        "nodus_registration_invite",
      ),
    ).toBe("abc 123");
  });

  it("keeps the OAuth invite cookie short-lived", () => {
    expect(INVITE_COOKIE_MAX_AGE_SECONDS).toBe(600);
    expect(inviteCookieOptions(true)).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 600,
    });
  });
});
