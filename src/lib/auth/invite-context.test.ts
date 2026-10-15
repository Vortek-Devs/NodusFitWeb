import { describe, expect, it } from "vitest";
import {
  buildOAuthSignupState,
  INVITE_HEADER_NAME,
  inviteMatchesSignup,
  readSignupInviteContext,
  roleForInvite,
} from "./invite-context";

describe("invite context", () => {
  it("does not allow a form value to choose the user role", () => {
    expect(roleForInvite("absent")).toBe("PERSONAL");
    expect(roleForInvite("valid")).toBe("ALUNO");
    expect(roleForInvite("invalid")).toBeNull();
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
    expect(inviteMatchesSignup(null, "aluno@example.com")).toBe(false);
    expect(inviteMatchesSignup([], "aluno@example.com")).toBe(false);
    expect(inviteMatchesSignup({ role: "ALUNO", email: 42 }, "aluno@example.com")).toBe(
      false,
    );
  });

  it("treats the bounded header as explicit email-signup intent", () => {
    expect(
      readSignupInviteContext(
        new Headers({
          [INVITE_HEADER_NAME]: " native_token-1 ",
        }),
        "/sign-up/email",
      ),
    ).toEqual({ status: "present", token: "native_token-1" });
  });

  it("ignores cookies during personal email signup", () => {
    expect(
      readSignupInviteContext(
        new Headers({ cookie: "nodus_registration_invite=cookie-token" }),
        "/sign-up/email",
      ),
    ).toEqual({ status: "absent" });
  });

  it("uses only the Better Auth transaction state during student OAuth signup", () => {
    expect(
      readSignupInviteContext(
        new Headers({
          cookie: "nodus_registration_invite=cookie-token",
          [INVITE_HEADER_NAME]: "attacker-token",
        }),
        "/callback/google",
        {
          requestSignUp: true,
          ...buildOAuthSignupState("student", "state-token"),
        },
      ),
    ).toEqual({ status: "present", token: "state-token" });
  });

  it("does not fall back to an invite header when OAuth state is unbound", () => {
    expect(
      readSignupInviteContext(
        new Headers({ [INVITE_HEADER_NAME]: "attacker-token" }),
        "/callback/google",
        null,
      ),
    ).toEqual({ status: "invalid" });
  });

  it("allows explicit personal OAuth signup without inheriting invite state", () => {
    expect(
      readSignupInviteContext(new Headers(), "/callback/:id", {
        requestSignUp: true,
        ...buildOAuthSignupState("personal"),
      }),
    ).toEqual({ status: "absent" });
  });

  it.each([
    null,
    {},
    { requestSignUp: false, ...buildOAuthSignupState("student", "state-token") },
    { requestSignUp: true, nodusSignupIntent: "student" },
    { requestSignUp: true, nodusSignupIntent: "unknown" },
  ])("fails closed for an unbound OAuth signup state %#", (state) => {
    expect(readSignupInviteContext(new Headers(), "/callback/google", state)).toEqual({
      status: "invalid",
    });
  });

  it.each([
    "",
    "a/b",
    "a b",
    "a".repeat(129),
  ])("rejects malformed native invite token %s", (token) => {
    expect(
      readSignupInviteContext(
        new Headers({ [INVITE_HEADER_NAME]: token }),
        "/sign-up/email",
      ),
    ).toEqual({ status: "invalid" });
  });

  it("rejects a malformed invite token embedded in OAuth state", () => {
    expect(
      readSignupInviteContext(new Headers(), "/callback/google", {
        requestSignUp: true,
        nodusSignupIntent: "student",
        nodusInviteToken: "a/b",
      }),
    ).toEqual({ status: "invalid" });
  });
});
