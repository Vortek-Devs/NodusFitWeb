// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PersonalAppShell } from "./personal-app-shell";

const { pathname } = vi.hoisted(() => ({ pathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: pathname }));
const identity = {
  userId: "canonical-user",
  name: "Personal canônico",
  email: "personal@example.test",
  role: "PERSONAL" as const,
  personalProfileId: "canonical-profile",
};
describe("PersonalAppShell", () => {
  beforeEach(() => pathname.mockReturnValue("/alunos"));

  it.each([
    "/alunos",
    "/alunos/real-student",
  ])("marks only the real students destination active at %s", (path) => {
    pathname.mockReturnValue(path);
    render(
      <PersonalAppShell identity={identity}>
        <h1>Alunos vinculados</h1>
      </PersonalAppShell>,
    );
    expect(screen.getByRole("main")).toContainElement(
      screen.getByRole("heading", { name: "Alunos vinculados" }),
    );
    for (const nav of screen.getAllByRole("navigation")) {
      const studentsLink = within(nav).getByRole("link", { name: "Alunos" });
      const exercisesLink = within(nav).getByRole("link", { name: "Exercícios" });
      expect(studentsLink).toHaveAttribute("href", "/alunos");
      expect(studentsLink).toHaveAttribute("aria-current", "page");
      expect(exercisesLink).toHaveAttribute("href", "/exercicios");
      expect(exercisesLink).not.toHaveAttribute("aria-current");
      expect(within(nav).getAllByRole("link")).toHaveLength(2);
    }
    expect(within(screen.getByRole("banner")).getByText("Alunos")).toBeInTheDocument();
    expect(screen.getByText(identity.email)).toBeInTheDocument();
    expect(screen.getAllByText(identity.name).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Pular para o conteúdo" })).toHaveAttribute(
      "href",
      "#conteudo-personal",
    );
  });

  it.each([
    "/exercicios",
    "/exercicios/novo",
    "/exercicios/8b4ce7b0-4f28-4fa4-a3d2-a08d03dd80a5",
  ])("marks only the exercises destination active at %s", (path) => {
    pathname.mockReturnValue(path);
    render(<PersonalAppShell identity={identity}>Conteúdo</PersonalAppShell>);

    for (const nav of screen.getAllByRole("navigation")) {
      const studentsLink = within(nav).getByRole("link", { name: "Alunos" });
      const exercisesLink = within(nav).getByRole("link", { name: "Exercícios" });
      expect(studentsLink).not.toHaveAttribute("aria-current");
      expect(exercisesLink).toHaveAttribute("aria-current", "page");
      expect(within(nav).getAllByRole("link")).toHaveLength(2);
    }
    expect(
      within(screen.getByRole("banner")).getByText("Exercícios"),
    ).toBeInTheDocument();
  });

  it("does not mark an unrelated prefix active", () => {
    for (const path of [
      "/alunos-arquivados",
      "/exercicios-legados",
      "/treinos-legados",
    ]) {
      pathname.mockReturnValue(path);
      const { unmount } = render(
        <PersonalAppShell identity={identity}>Conteúdo</PersonalAppShell>,
      );
      for (const nav of screen.getAllByRole("navigation")) {
        expect(within(nav).getByRole("link", { name: "Alunos" })).not.toHaveAttribute(
          "aria-current",
        );
        expect(within(nav).getByRole("link", { name: "Exercícios" })).not.toHaveAttribute(
          "aria-current",
        );
      }
      unmount();
    }
  });
});
