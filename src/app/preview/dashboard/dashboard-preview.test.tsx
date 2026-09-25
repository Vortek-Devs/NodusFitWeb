// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardPreview } from "./_components/dashboard-preview";
import { metadata } from "./page";

const { pathname } = vi.hoisted(() => ({ pathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: pathname }));

describe("DashboardPreview", () => {
  it("identifies illustrative demo data and is not indexable", () => {
    pathname.mockReturnValue("/preview/dashboard");
    const { container } = render(<DashboardPreview />);

    expect(screen.getByText("Demonstração")).toBeInTheDocument();
    expect(screen.getByText(/dados ilustrativos/i)).toBeInTheDocument();
    expect(metadata.robots).toMatchObject({ index: false, follow: false });

    const hrefs = Array.from(container.querySelectorAll("a[href]"), (link) =>
      link.getAttribute("href"),
    );
    expect(hrefs).not.toContain("#");
    expect(hrefs).not.toContain("/financeiro");
    expect(hrefs).not.toContain("/treinos/novo");
    expect(screen.queryByRole("button", { name: /buscar|notificações/i })).toBeNull();
  });
});
