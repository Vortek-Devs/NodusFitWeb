import { describe, expect, it, vi } from "vitest";
import RegistrationAliasPage from "./page";

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
}));
vi.mock("next/navigation", () => ({ redirect }));

describe("registration alias", () => {
  it("sends API invite links to the existing student access flow", async () => {
    await expect(
      RegistrationAliasPage({
        searchParams: Promise.resolve({ token: "invite-token_1" }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/acesso?perfil=aluno&token=invite-token_1");
  });

  it("does not produce an open signup link without an invite", async () => {
    await expect(
      RegistrationAliasPage({ searchParams: Promise.resolve({ token: "" }) }),
    ).rejects.toThrow("NEXT_REDIRECT:/acesso?perfil=aluno");
  });
});
