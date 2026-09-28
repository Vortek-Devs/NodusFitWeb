import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MeResponse } from "@/lib/contracts/nodus-api";
import { decideStudentAccess, requireStudentAccess } from "./student-access";

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

const access = "/acesso?perfil=aluno";
const unavailable = `${access}&erro=conta-indisponivel`;
const studentProfileId = "0bbf3eae-6c01-4afd-a003-b6e481e68083";
const personalProfileId = "bd99eae9-830f-4d70-b059-dd34e990cfbc";
const studentProfile = {
  id: studentProfileId,
  personalProfileId,
  status: "ACTIVE" as const,
  telefone: null,
  birthDate: null,
};

function me(overrides: Partial<MeResponse["user"]> = {}): MeResponse {
  return {
    user: {
      userId: "student-user",
      name: "Nome canônico",
      email: "student@example.test",
      role: "ALUNO",
      emailVerified: true,
      isActive: true,
      isBanned: false,
      personalProfileId: null,
      studentProfileId,
      ...overrides,
    },
    personalProfile: null,
    studentProfile,
    onboarding: { required: false, missingFields: [] },
  };
}

describe("canonical student access", () => {
  it.each([
    [{ emailVerified: false }, `${access}&verificacao=pendente`],
    [{ isActive: false }, unavailable],
    [{ isBanned: true }, unavailable],
    [{ role: "PERSONAL" }, `${access}&erro=acesso-negado`],
    [{ studentProfileId: null }, unavailable],
  ] as const)("rejects %j", (override, redirectTo) => {
    expect(decideStudentAccess(me(override))).toEqual({ status: "redirect", redirectTo });
  });

  it("rejects missing, inactive, or inconsistent canonical student profile", () => {
    expect(decideStudentAccess({ ...me(), studentProfile: null })).toEqual({
      status: "redirect",
      redirectTo: unavailable,
    });
    expect(
      decideStudentAccess({
        ...me(),
        studentProfile: { ...studentProfile, status: "INACTIVE" },
      }),
    ).toEqual({ status: "redirect", redirectTo: unavailable });
    expect(
      decideStudentAccess({
        ...me(),
        studentProfile: { ...studentProfile, id: personalProfileId },
      }),
    ).toEqual({ status: "redirect", redirectTo: unavailable });
    expect(
      decideStudentAccess({
        ...me(),
        onboarding: { required: true, missingFields: ["profile"] },
      }),
    ).toEqual({ status: "redirect", redirectTo: unavailable });
  });

  it("returns only canonical student identity", () => {
    expect(decideStudentAccess(me())).toEqual({
      status: "allowed",
      identity: {
        userId: "student-user",
        name: "Nome canônico",
        email: "student@example.test",
        studentProfileId,
      },
    });
  });
});

describe("requireStudentAccess server boundary", () => {
  const fetchMock = vi.fn<typeof fetch>();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODUS_API_URL", "https://api.example.test/base/");
    vi.stubGlobal("fetch", fetchMock);
    requestHeaders.mockResolvedValue(new Headers({ cookie: "session=test" }));
    getSession.mockResolvedValue({
      response: { user: { id: "student-user", role: "PERSONAL" } },
      headers: new Headers({ "set-auth-jwt": "server-jwt" }),
    });
    fetchMock.mockResolvedValue(Response.json(me()));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function redirectsTo(path: string) {
    await expect(requireStudentAccess()).rejects.toThrow(`NEXT_REDIRECT:${path}`);
    expect(redirect).toHaveBeenCalledExactlyOnceWith(path);
  }

  it("uses no-store canonical API, not a claim in the session", async () => {
    expect(await requireStudentAccess()).toMatchObject({
      userId: "student-user",
      studentProfileId,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://api.example.test/api/me"),
      expect.objectContaining({
        cache: "no-store",
        redirect: "manual",
        headers: { accept: "application/json", authorization: "Bearer server-jwt" },
      }),
    );
  });

  it("rejects absent session before backend fetch", async () => {
    getSession.mockResolvedValue({ response: null, headers: new Headers() });
    await redirectsTo(access);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([401, 403, 500, 302])("fails closed on backend HTTP %s", async (status) => {
    fetchMock.mockResolvedValue(new Response(null, { status }));
    await redirectsTo(status === 401 ? access : unavailable);
  });

  it("fails closed when canonical identity differs from the session", async () => {
    fetchMock.mockResolvedValue(Response.json(me({ userId: "another-user" })));
    await redirectsTo(unavailable);
  });

  it("fails closed on missing JWT", async () => {
    getSession.mockResolvedValue({
      response: { user: { id: "student-user" } },
      headers: new Headers(),
    });
    await redirectsTo(unavailable);
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

  it("fails closed on network error", async () => {
    fetchMock.mockRejectedValue(new Error("secret-network-error"));
    await redirectsTo(unavailable);
  });

  it("fails closed on malformed JSON", async () => {
    fetchMock.mockResolvedValue(new Response("secret-invalid-json"));
    await redirectsTo(unavailable);
  });
});
