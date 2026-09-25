import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MeResponse } from "@/lib/contracts/nodus-api";
import { decidePersonalAccess, requirePersonalAccess } from "./personal-access";

const { getSession, requestHeaders, redirect } = vi.hoisted(() => ({
  getSession: vi.fn(),
  requestHeaders: vi.fn(),
  redirect: vi.fn((path: string): never => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("next/headers", () => ({ headers: requestHeaders }));
vi.mock("next/navigation", () => ({ redirect }));
const access = "/acesso?perfil=personal";
const unavailable = `${access}&erro=conta-indisponivel`;
const profileId = "0bbf3eae-6c01-4afd-a003-b6e481e68083";
function me(overrides: Partial<MeResponse["user"]> = {}): MeResponse {
  return {
    user: {
      userId: "personal-user",
      name: "Nome canônico",
      email: "personal@example.test",
      role: "PERSONAL",
      emailVerified: true,
      isActive: true,
      isBanned: false,
      personalProfileId: profileId,
      studentProfileId: null,
      ...overrides,
    },
    personalProfile: {
      id: profileId,
      cpf: "",
      cref: "",
      telefone: "",
      especialidade: null,
    },
    studentProfile: null,
    onboarding: { required: false, missingFields: [] },
  };
}
describe("canonical personal access", () => {
  it.each([
    [{ emailVerified: false }, `${access}&verificacao=pendente`],
    [{ isActive: false }, unavailable],
    [{ isBanned: true }, unavailable],
    [{ role: "ALUNO" }, `${access}&erro=acesso-negado`],
    [{ role: "ADMIN" }, `${access}&erro=acesso-negado`],
    [{ personalProfileId: null }, "/onboarding"],
  ] as const)("rejects %j", (override, redirectTo) => {
    expect(decidePersonalAccess(me(override))).toEqual({
      status: "redirect",
      redirectTo,
    });
  });
  it("requires completed onboarding", () => {
    expect(
      decidePersonalAccess({
        ...me(),
        onboarding: { required: true, missingFields: ["cpf"] },
      }),
    ).toEqual({ status: "redirect", redirectTo: "/onboarding" });
  });
  it("rejects missing or inconsistent canonical profiles", () => {
    expect(decidePersonalAccess({ ...me(), personalProfile: null })).toEqual({
      status: "redirect",
      redirectTo: "/onboarding",
    });
    expect(
      decidePersonalAccess({
        ...me(),
        personalProfile: {
          cpf: "",
          cref: "",
          telefone: "",
          especialidade: null,
          id: "bd99eae9-830f-4d70-b059-dd34e990cfbc",
        },
      }),
    ).toEqual({ status: "redirect", redirectTo: unavailable });
  });
  it("returns only allowed canonical identity", () => {
    expect(decidePersonalAccess(me())).toEqual({
      status: "allowed",
      identity: {
        userId: "personal-user",
        name: "Nome canônico",
        email: "personal@example.test",
        role: "PERSONAL",
        personalProfileId: profileId,
      },
    });
  });
});
describe("requirePersonalAccess server boundary", () => {
  const fetchMock = vi.fn<typeof fetch>();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODUS_API_URL", "https://api.example.test/base/");
    vi.stubGlobal("fetch", fetchMock);
    requestHeaders.mockResolvedValue(new Headers({ cookie: "session=test" }));
    getSession.mockResolvedValue({
      response: { user: { id: "personal-user", role: "ADMIN" } },
      headers: new Headers({ "set-auth-jwt": "server-jwt" }),
    });
    fetchMock.mockResolvedValue(Response.json(me()));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  async function redirectsTo(path: string) {
    await expect(requirePersonalAccess()).rejects.toThrow(`NEXT_REDIRECT:${path}`);
    expect(redirect).toHaveBeenCalledExactlyOnceWith(path);
  }
  it("uses no-store canonical API and never session role", async () => {
    expect(await requirePersonalAccess()).toEqual(
      expect.objectContaining({ role: "PERSONAL", userId: "personal-user" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://api.example.test/api/me"),
      expect.objectContaining({
        cache: "no-store",
        redirect: "manual",
        headers: { accept: "application/json", authorization: "Bearer server-jwt" },
      }),
    );
    expect(getSession).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      returnHeaders: true,
    });
  });
  it("redirects absent session without calling backend", async () => {
    getSession.mockResolvedValue({ response: null, headers: new Headers() });
    await redirectsTo(access);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    "session",
    "headers",
    "jwt",
  ])("fails closed on %s failure", async (failure) => {
    if (failure === "session")
      getSession.mockRejectedValue(new Error("secret-provider-error"));
    if (failure === "headers")
      requestHeaders.mockRejectedValue(new Error("secret-cookie-error"));
    if (failure === "jwt")
      getSession.mockResolvedValue({
        response: { user: { id: "personal-user" } },
        headers: new Headers(),
      });
    await redirectsTo(unavailable);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    "",
    "invalid",
    "file:///tmp/api",
    "https://user:secret@api.example.test",
  ])("rejects invalid API configuration %s", async (url) => {
    vi.stubEnv("NODUS_API_URL", url);
    await redirectsTo(unavailable);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    401, 403, 500, 302,
  ])("handles HTTP %s without swallowing redirect", async (status) => {
    fetchMock.mockResolvedValue(new Response(null, { status }));
    await redirectsTo(status === 401 ? access : unavailable);
  });
  it("fails closed on network error", async () => {
    fetchMock.mockRejectedValue(new Error("secret-network-error"));
    await redirectsTo(unavailable);
  });
  it("fails closed on malformed JSON", async () => {
    fetchMock.mockResolvedValue(new Response("secret-invalid-json"));
    await redirectsTo(unavailable);
  });
  it.each([
    null,
    {},
    { ...me(), user: { ...me().user, emailVerified: "true" } },
    me({ userId: "another-user" }),
  ])("fails closed on invalid/mismatched canonical payload", async (payload) => {
    fetchMock.mockResolvedValue(Response.json(payload));
    await redirectsTo(unavailable);
  });
  it("applies canonical decision to server rendering", async () => {
    fetchMock.mockResolvedValue(Response.json(me({ emailVerified: false })));
    await redirectsTo(`${access}&verificacao=pendente`);
  });
});
