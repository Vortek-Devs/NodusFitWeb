// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import StudentHomePage from "./page";

const requireStudentAccess = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/student-access", () => ({ requireStudentAccess }));

it("renders only canonical student identity without sample training data", async () => {
  requireStudentAccess.mockResolvedValue({
    userId: "student-1",
    name: "Ana Costa",
    email: "ana@example.test",
    studentProfileId: "0bbf3eae-6c01-4afd-a003-b6e481e68083",
  });
  render(await StudentHomePage());

  expect(screen.getByRole("heading", { name: "Olá, Ana Costa" })).toBeVisible();
  expect(screen.getByText(/seus treinos aparecerão aqui/i)).toBeVisible();
  expect(screen.queryByText(/Joao Paulo|Treino B/i)).toBeNull();
});
