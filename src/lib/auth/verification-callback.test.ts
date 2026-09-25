import { describe, expect, it } from "vitest";
import { buildVerificationCallback } from "./verification-callback";

describe("verification callback", () => {
  it("builds personal callback", () =>
    expect(buildVerificationCallback("personal")).toBe(
      "/acesso?perfil=personal&emailVerificado=1",
    ));
  it("retains valid invite", () =>
    expect(buildVerificationCallback("aluno", "Abc_123-xyz")).toBe(
      "/acesso?perfil=aluno&token=Abc_123-xyz&emailVerificado=1",
    ));
  it.each([
    undefined,
    "",
    "<script>",
    "a/b",
    "a%20b",
    "a b",
    "a".repeat(129),
  ])("rejects invalid token %s", (token) =>
    expect(() => buildVerificationCallback("aluno", token)).toThrow(
      "INVITE_TOKEN_INVALID",
    ));
  it.each(["a", "a".repeat(128)])("accepts boundary lengths", (token) =>
    expect(buildVerificationCallback("aluno", token)).toContain(`token=${token}`));
});
