// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardPage from "./page";

describe("analytics dashboard page", () => {
  it("explains that analytics wait for real source data", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ainda não há dados analíticos" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para Início" })).toHaveAttribute(
      "href",
      "/inicio",
    );
    expect(screen.queryByText(/84%|R\$3\.360|dados ilustrativos/i)).toBeNull();
  });
});
