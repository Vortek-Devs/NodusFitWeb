// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import OnboardingPage from "./page";

const fetchMock = vi.fn<typeof fetch>();
const assign = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  assign.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal(
    "window",
    new Proxy(window, {
      get: (target, property) =>
        property === "location" ? { assign } : Reflect.get(target, property),
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("recovers from network failure and navigates to the canonical roster after retry", async () => {
  fetchMock.mockRejectedValueOnce(new Error("network secret"));
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
  render(<OnboardingPage />);
  const form = screen.getByRole("button", { name: "Salvar perfil" }).closest("form");
  if (!form) throw new Error("Onboarding form missing");

  fireEvent.submit(form);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível salvar o perfil. Tente novamente.",
  );
  expect(screen.getByRole("button", { name: "Salvar perfil" })).toBeEnabled();
  expect(assign).not.toHaveBeenCalled();

  fireEvent.submit(form);
  await waitFor(() => expect(assign).toHaveBeenCalledExactlyOnceWith("/alunos"));
});
