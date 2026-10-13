// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProfilePage from "./page";

const { requirePersonalAccess } = vi.hoisted(() => ({
  requirePersonalAccess: vi.fn(),
}));
vi.mock("@/lib/auth/personal-access", () => ({ requirePersonalAccess }));

const identity = {
  userId: "canonical-user",
  name: "Personal Nodus",
  email: "personal@example.test",
  role: "PERSONAL" as const,
  personalProfileId: "canonical-profile",
};

describe("ProfilePage", () => {
  it("shows the authenticated identity and read-only profile status", async () => {
    requirePersonalAccess.mockResolvedValue(identity);
    render(await ProfilePage());

    expect(screen.getByRole("heading", { name: "Meu perfil" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: identity.name })).toBeInTheDocument();
    expect(screen.getByText(identity.email)).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(
      screen.getByText("Este perfil é somente leitura por enquanto."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para o início" })).toHaveAttribute(
      "href",
      "/inicio",
    );
  });
});
