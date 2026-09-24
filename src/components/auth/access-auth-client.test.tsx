// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { readFileSync } from "node:fs";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AccessAuthClient } from "./access-auth-client";

const client = vi.hoisted(() => ({
  useSession: vi.fn(),
  signIn: { email: vi.fn(), social: vi.fn() },
  signUp: { email: vi.fn() },
  sendVerificationEmail: vi.fn(),
}));
vi.mock("@/lib/auth-client", () => ({ authClient: client }));
const fetchMock = vi.fn();
const replace = vi.fn();
const assign = vi.fn();
const canonical = (overrides = {}) => ({
  user: {
    userId: "student-1",
    email: "student@example.com",
    name: "Student",
    role: "ALUNO",
    emailVerified: true,
    isActive: true,
    isBanned: false,
    personalProfileId: null,
    studentProfileId: null,
    ...overrides,
  },
  personalProfile: null,
  studentProfile: null,
  onboarding: { required: false, missingFields: [] },
});
beforeEach(() => {
  vi.clearAllMocks();
  client.useSession.mockReturnValue({ isPending: false, data: null });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal(
    "window",
    new Proxy(window, {
      get: (target, property) =>
        property === "location" ? { replace, assign } : Reflect.get(target, property),
    }),
  );
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("keeps role and panel tab touch targets at least 44px high", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  expect(css).toMatch(/\.auth-role-toggle button\s*\{[^}]*min-height:\s*44px;/);
  expect(css).toMatch(/\.auth-tabs button\s*\{[^}]*min-height:\s*44px;/);
});

async function login() {
  fireEvent.change(screen.getByLabelText("Email profissional"), {
    target: { value: "person@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "Password1" } });
  fireEvent.click(screen.getByRole("button", { name: "Entrar no painel" }));
  await screen.findByRole("heading", { name: "Confirme seu e-mail" });
}
it("unverified login exposes resend, disables pending, announces success", async () => {
  client.signIn.email.mockResolvedValue({
    error: { code: "EMAIL_NOT_VERIFIED", message: "raw secret" },
  });
  let finish: (value: unknown) => void = () => {};
  client.sendVerificationEmail.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  render(<AccessAuthClient initialRole="personal" invite={{ status: "missing" }} />);
  await login();
  fireEvent.click(screen.getByRole("button", { name: "Reenviar e-mail" }));
  expect(screen.getByRole("button", { name: "Solicitando..." })).toBeDisabled();
  await act(async () => finish({ data: { status: true } }));
  expect(
    await screen.findByText("Solicitação recebida. Verifique sua caixa de entrada."),
  ).toHaveAttribute("aria-live", "polite");
  expect(assign).not.toHaveBeenCalled();
});
it("personal signup renders confirmation instead of redirect", async () => {
  client.signUp.email.mockResolvedValue({ data: { user: { id: "personal-1" } } });
  render(<AccessAuthClient initialRole="personal" invite={{ status: "missing" }} />);
  fireEvent.click(screen.getByRole("tab", { name: "Criar conta" }));
  for (const [label, value] of [
    ["Nome", "Marcos"],
    ["Sobrenome", "Pereira"],
    ["Email profissional", "person@example.com"],
  ])
    fireEvent.change(screen.getByLabelText(label), {
      target: { value },
    });
  expect(screen.queryByLabelText("WhatsApp")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  expect(
    screen.getByText(/dados profissionais serão solicitados no onboarding/i),
  ).toBeVisible();
  expect(screen.queryByLabelText(/CREF/i)).toBeNull();
  expect(screen.queryByLabelText("Especialidade")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "Password1" } });
  fireEvent.change(screen.getByLabelText("Confirmar senha"), {
    target: { value: "Password1" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
  expect(
    await screen.findByRole("heading", { name: "Confirme seu e-mail" }),
  ).toBeVisible();
  expect(fetchMock).not.toHaveBeenCalled();
  expect(assign).not.toHaveBeenCalled();
});
it("verified callback accepts once in StrictMode and replaces token history", async () => {
  client.useSession.mockReturnValue({
    isPending: false,
    data: { user: { id: "student-1", email: "student@example.com" } },
  });
  fetchMock.mockImplementation(async (url: string) =>
    url === "/api/backend/me" ? Response.json(canonical()) : Response.json({}),
  );
  render(
    <StrictMode>
      <AccessAuthClient
        initialRole="aluno"
        invite={{ status: "valid" }}
        token="Abc_123"
        emailVerifiedCallback
      />
    </StrictMode>,
  );
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/aluno"));
  expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
    "/api/backend/me",
    "/api/registration-invites/accept",
  ]);
});
it("finishes a used invite for the same authenticated student after response loss", async () => {
  client.useSession.mockReturnValue({
    isPending: false,
    data: { user: { id: "student-1", email: "student@example.com" } },
  });
  fetchMock.mockImplementation(async (url: string) => {
    if (url === "/api/backend/me") return Response.json(canonical());
    if (url === "/api/registration-invites/prepare")
      return Response.json({ code: "INVITE_USED" }, { status: 410 });
    if (url === "/api/registration-invites/accept")
      return Response.json({ accepted: true });
    return Promise.reject(new Error(`Unexpected request: ${url}`));
  });
  render(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "invalid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );

  await waitFor(() => expect(replace).toHaveBeenCalledWith("/aluno"));
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
    "/api/backend/me",
    "/api/registration-invites/accept",
  ]);
});
it.each([
  { emailVerified: false },
  { isActive: false },
  { isBanned: true },
  { role: "ADMIN" },
  { userId: "other" },
])("forged callback cannot accept unavailable canonical account %j", async (flags) => {
  client.useSession.mockReturnValue({
    isPending: false,
    data: { user: { id: "student-1", email: "student@example.com" } },
  });
  fetchMock.mockResolvedValue(Response.json(canonical(flags)));
  render(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  expect(
    await screen.findByText("Não foi possível confirmar seu acesso. Tente novamente."),
  ).toBeVisible();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(replace).not.toHaveBeenCalled();
});
it("acceptance failure stays inline", async () => {
  client.useSession.mockReturnValue({
    isPending: false,
    data: { user: { id: "student-1" } },
  });
  fetchMock.mockImplementation(async (url: string) =>
    url === "/api/backend/me"
      ? Response.json(canonical())
      : url.endsWith("accept")
        ? Response.json({ detail: "Convite expirado." }, { status: 410 })
        : Response.json({}),
  );
  render(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  expect(await screen.findByText("Convite expirado.")).toBeVisible();
  expect(replace).not.toHaveBeenCalled();
});
it("Google starts native provider navigation without racing to callback", async () => {
  client.signIn.social.mockResolvedValue({
    data: { url: "https://accounts.google.com" },
  });
  render(<AccessAuthClient initialRole="personal" invite={{ status: "missing" }} />);
  fireEvent.click(screen.getByRole("button", { name: "Entrar com Google" }));
  expect(await screen.findByText("Redirecionando para o Google.")).toBeVisible();
  expect(client.signIn.social).toHaveBeenCalledWith({
    provider: "google",
    callbackURL: "/acesso?perfil=personal",
    requestSignUp: false,
  });
  expect(assign).not.toHaveBeenCalled();
});
it("pending query uses session email for resend", async () => {
  client.useSession.mockReturnValue({
    isPending: false,
    data: { user: { id: "student-1", email: "actual@example.com" } },
  });
  render(
    <AccessAuthClient
      initialRole="personal"
      invite={{ status: "missing" }}
      verificationPending
    />,
  );
  expect(await screen.findByText(/actual@example.com/)).toBeVisible();
  expect(fetchMock).not.toHaveBeenCalled();
});

it("ignores login response after switching role", async () => {
  let finish: (value: unknown) => void = () => {};
  client.signIn.email.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  fetchMock.mockResolvedValue(
    Response.json(canonical({ userId: "personal-1", role: "PERSONAL" })),
  );
  render(<AccessAuthClient initialRole="personal" invite={{ status: "missing" }} />);
  fireEvent.change(screen.getByLabelText("Email profissional"), {
    target: { value: "person@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "Password1" } });
  fireEvent.click(screen.getByRole("button", { name: "Entrar no painel" }));
  await waitFor(() => expect(client.signIn.email).toHaveBeenCalled());
  fireEvent.click(screen.getByRole("button", { name: "Aluno" }));
  await act(async () => finish({ data: { user: { id: "personal-1" } } }));
  expect(assign).not.toHaveBeenCalled();
});

it("session identity change during acceptance prevents navigation", async () => {
  let finish: (value: Response) => void = () => {};
  client.useSession.mockReturnValue({
    isPending: false,
    data: { user: { id: "student-1" } },
  });
  fetchMock.mockImplementation(async (url: string) =>
    url === "/api/backend/me"
      ? Response.json(canonical())
      : new Promise<Response>((resolve) => {
          finish = resolve;
        }),
  );
  const view = render(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  client.useSession.mockReturnValue({ isPending: false, data: null });
  view.rerender(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  await act(async () => finish(Response.json({})));
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[1][0]).toBe("/api/registration-invites/accept");
  expect(replace).not.toHaveBeenCalled();
});

it("Google student callback uses the same canonical safety and completion", async () => {
  client.useSession.mockReturnValue({
    isPending: false,
    data: { user: { id: "student-1" } },
  });
  fetchMock.mockImplementation(async (url: string) =>
    url === "/api/backend/me" ? Response.json(canonical()) : Response.json({}),
  );
  render(
    <AccessAuthClient initialRole="aluno" invite={{ status: "valid" }} token="Abc_123" />,
  );
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/aluno"));
  expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
    "/api/backend/me",
    "/api/registration-invites/accept",
  ]);
});

it("canonical failure remains inline and does not invent a redirect", async () => {
  client.useSession.mockReturnValue({
    isPending: false,
    data: { user: { id: "student-1" } },
  });
  fetchMock.mockRejectedValue(new Error("provider secret"));
  render(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  expect(
    await screen.findByText("Não foi possível confirmar seu acesso. Tente novamente."),
  ).toBeVisible();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(replace).not.toHaveBeenCalled();
});

it("does not accept the same identity and token again after session remount", async () => {
  const session = { isPending: false, data: { user: { id: "student-1" } } };
  client.useSession.mockReturnValue(session);
  fetchMock.mockImplementation(async (url: string) =>
    url === "/api/backend/me" ? Response.json(canonical()) : Response.json({}),
  );
  const view = render(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
  client.useSession.mockReturnValue({ isPending: false, data: null });
  view.rerender(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  client.useSession.mockReturnValue(session);
  view.rerender(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  await waitFor(() => expect(replace).toHaveBeenCalledTimes(2));
  expect(
    fetchMock.mock.calls.filter((call) => call[0] === "/api/registration-invites/accept"),
  ).toHaveLength(1);
});

it("retries a lost acceptance response after same identity remount", async () => {
  const session = { isPending: false, data: { user: { id: "student-1" } } };
  client.useSession.mockReturnValue(session);
  let acceptances = 0;
  fetchMock.mockImplementation(async (url: string) => {
    if (url === "/api/backend/me") return Response.json(canonical());
    if (url === "/api/registration-invites/accept") {
      acceptances += 1;
      if (acceptances === 1) throw new Error("lost-response-secret");
      return Response.json({ accepted: true });
    }
    if (url === "/api/registration-invites/prepare")
      return Response.json({ code: "INVITE_USED" }, { status: 410 });
    throw new Error(`Unexpected request: ${url}`);
  });
  const element = (
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />
  );
  const view = render(element);
  expect(
    await screen.findByText("Não foi possível aceitar o convite. Tente novamente."),
  ).toBeVisible();
  client.useSession.mockReturnValue({ isPending: false, data: null });
  view.rerender(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  client.useSession.mockReturnValue(session);
  view.rerender(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
  expect(replace).toHaveBeenCalledWith("/aluno");
  expect(acceptances).toBe(2);
  expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
    "/api/backend/me",
    "/api/registration-invites/accept",
    "/api/backend/me",
    "/api/registration-invites/accept",
  ]);
});

it("reuses acceptance already in flight across same identity remount", async () => {
  const session = { isPending: false, data: { user: { id: "student-1" } } };
  client.useSession.mockReturnValue(session);
  let finishAcceptance: (response: Response) => void = () => {};
  fetchMock.mockImplementation(async (url: string) => {
    if (url === "/api/backend/me") return Response.json(canonical());
    if (url === "/api/registration-invites/accept")
      return new Promise<Response>((resolve) => {
        finishAcceptance = resolve;
      });
    return Response.json({});
  });
  const view = render(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  client.useSession.mockReturnValue({ isPending: false, data: null });
  view.rerender(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  client.useSession.mockReturnValue(session);
  view.rerender(
    <AccessAuthClient
      initialRole="aluno"
      invite={{ status: "valid" }}
      token="Abc_123"
      emailVerifiedCallback
    />,
  );
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  await act(async () => finishAcceptance(Response.json({})));
  await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
  expect(
    fetchMock.mock.calls.filter((call) => call[0] === "/api/registration-invites/accept"),
  ).toHaveLength(1);
});

it("resend failure remains announced and re-enables the action", async () => {
  client.signIn.email.mockResolvedValue({ error: { code: "EMAIL_NOT_VERIFIED" } });
  client.sendVerificationEmail.mockRejectedValue(new Error("secret"));
  render(<AccessAuthClient initialRole="personal" invite={{ status: "missing" }} />);
  await login();
  fireEvent.click(screen.getByRole("button", { name: "Reenviar e-mail" }));
  expect(
    await screen.findByText(
      "Não foi possível solicitar um novo e-mail. Tente novamente.",
    ),
  ).toHaveAttribute("aria-live", "polite");
  expect(screen.getByRole("button", { name: "Reenviar e-mail" })).toBeEnabled();
});

it.each([
  "conta-indisponivel",
  "acesso-negado",
])("account query %s uses fixed safe copy", (error) => {
  render(
    <AccessAuthClient
      initialRole="personal"
      invite={{ status: "missing" }}
      accountError={error}
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    error === "conta-indisponivel"
      ? "Sua conta está indisponível."
      : "Você não tem permissão",
  );
});
