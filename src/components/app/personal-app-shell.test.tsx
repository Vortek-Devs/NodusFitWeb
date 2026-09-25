// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  afterEach(cleanup);
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
      const dashboardLink = within(nav).getByRole("link", { name: "Dashboard" });
      expect(within(nav).getByRole("link", { name: "Início" })).not.toHaveAttribute(
        "aria-current",
      );
      expect(studentsLink).toHaveAttribute("href", "/alunos");
      expect(studentsLink).toHaveAttribute("aria-current", "page");
      expect(exercisesLink).toHaveAttribute("href", "/exercicios");
      expect(exercisesLink).not.toHaveAttribute("aria-current");
      expect(dashboardLink).not.toHaveAttribute("aria-current");
      expect(within(nav).getAllByRole("link")).toHaveLength(4);
    }
    expect(within(screen.getByRole("banner")).getByText("Alunos")).toBeInTheDocument();
    expect(screen.getAllByText(identity.email)).toHaveLength(3);
    for (const email of screen.getAllByText(identity.email)) {
      expect(email).toHaveClass("text-ink-secondary");
    }
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
      const homeLink = within(nav).getByRole("link", { name: "Início" });
      expect(studentsLink).not.toHaveAttribute("aria-current");
      expect(exercisesLink).toHaveAttribute("aria-current", "page");
      expect(homeLink).not.toHaveAttribute("aria-current");
      expect(within(nav).getAllByRole("link")).toHaveLength(4);
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

  it("renders the richer grouped sidebar and honest analytics topbar", () => {
    pathname.mockReturnValue("/dashboard");
    render(
      <PersonalAppShell
        identity={identity}
        todayLabel="sexta-feira, 25 de setembro de 2026"
      >
        <h1>Painel pessoal</h1>
      </PersonalAppShell>,
    );

    for (const nav of screen.getAllByRole("navigation")) {
      const dashboardLink = within(nav).getByRole("link", { name: "Dashboard" });
      expect(dashboardLink).toHaveAttribute("href", "/dashboard");
      expect(dashboardLink).toHaveAttribute("aria-current", "page");
      expect(within(nav).getByRole("link", { name: "Início" })).not.toHaveAttribute(
        "aria-current",
      );
      expect(within(nav).getAllByRole("link")).toHaveLength(4);
    }

    const banner = screen.getByRole("banner");
    expect(within(banner).getByText("Dashboard")).toBeInTheDocument();
    expect(
      within(banner).getByText("sexta-feira, 25 de setembro de 2026"),
    ).toBeInTheDocument();
    expect(within(banner).getAllByText(identity.name)).toHaveLength(2);
    const mobileIdentity = screen.getByTestId("mobile-identity");
    expect(within(mobileIdentity).getByText(identity.name)).toBeInTheDocument();
    expect(within(mobileIdentity).getByText(identity.email)).toBeInTheDocument();
    expect(
      within(banner).queryByRole("link", { name: "Cadastrar exercício" }),
    ).toBeNull();
    for (const label of [
      "Treinos",
      "Relatórios",
      "Financeiro",
      "Mensagens",
      "Agenda",
      "Configurações",
      "Suporte",
    ]) {
      const plannedItems = screen.getAllByText(label);
      for (const plannedItem of plannedItems) {
        expect(plannedItem.closest("a")).toBeNull();
        expect(plannedItem.parentElement).toHaveTextContent("Planejado");
      }
    }
  });

  it("distinguishes operational Home from analytics Dashboard", () => {
    pathname.mockReturnValue("/inicio");
    render(
      <PersonalAppShell identity={identity}>
        <h1>Sua base em foco</h1>
      </PersonalAppShell>,
    );

    const banner = screen.getByRole("banner");
    expect(within(banner).getByText("Início")).toBeInTheDocument();
    expect(
      within(banner).getByRole("link", { name: "Gerenciar alunos" }),
    ).toHaveAttribute("href", "/alunos");
    for (const nav of screen.getAllByRole("navigation")) {
      expect(within(nav).getByRole("link", { name: "Início" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(within(nav).getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
        "aria-current",
      );
    }
  });

  it.each([
    "/alunos",
    "/dashboard",
    "/exercicios/novo",
  ])("does not show unrelated header actions on %s", (path) => {
    pathname.mockReturnValue(path);
    render(<PersonalAppShell identity={identity}>Conteúdo</PersonalAppShell>);
    expect(screen.queryByRole("link", { name: "Cadastrar exercício" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Gerenciar alunos" })).toBeNull();
  });

  it("shows exercise creation from the exercise catalog", () => {
    pathname.mockReturnValue("/exercicios");
    render(<PersonalAppShell identity={identity}>Catálogo</PersonalAppShell>);
    expect(screen.getByRole("link", { name: "Cadastrar exercício" })).toHaveAttribute(
      "href",
      "/exercicios/novo",
    );
  });
});
