import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET as publicInvite } from "@/app/api/mobile/public/invites/[token]/route";
import { POST as accept } from "@/app/api/registration-invites/accept/route";
import { POST as prepare } from "@/app/api/registration-invites/prepare/route";

const { getSession } = vi.hoisted(() => ({
  getSession: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ cookie: "session" }),
}));
const request = (body: string, path = "prepare") =>
  new Request(`https://web.test/api/registration-invites/${path}`, {
    method: "POST",
    body,
    headers: { "content-type": "application/json", "x-correlation-id": "trace-1" },
  });
const context = { params: Promise.resolve({ token: "invite-secret" }) };
beforeEach(() => {
  vi.stubEnv("NODUS_API_URL", "https://api.test");
  getSession.mockReset().mockResolvedValue({
    response: { user: { id: "user" } },
    headers: new Headers({ "set-auth-jwt": "server-jwt" }),
  });
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ valid: true }, { headers: { "set-cookie": "evil=secret" } }),
      ),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("invite preparation", () => {
  it("normalizes a failed validation stream cleanup without creating client state", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        new ReadableStream({
          cancel() {
            throw new Error("invite-secret");
          },
        }),
      ),
    );
    const response = await prepare(request('{"token":"invite-secret"}'));
    expect(response.status).toBe(502);
    expect(response.headers.has("set-cookie")).toBe(false);
    expect(await response.text()).not.toContain("invite-secret");
  });
  it("preserves safe upstream metadata on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json(
        { valid: true },
        {
          headers: {
            "x-correlation-id": "upstream",
            "retry-after": "5",
            "set-cookie": "evil=secret",
          },
        },
      ),
    );
    const response = await prepare(request('{"token":"invite-secret"}'));
    expect(response.headers.get("x-correlation-id")).toBe("upstream");
    expect(response.headers.get("retry-after")).toBe("5");
    expect(response.headers.get("set-cookie")).toBeNull();
  });
  it.each([
    "{",
    "null",
    "[]",
    "{}",
    '{"token":false}',
    '{"token":42}',
    '{"token":{}}',
    '{"token":""}',
    '{"token":"   "}',
  ])("rejects invalid body %s without client state", async (body) => {
    const response = await prepare(request(body));
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toBe("application/problem+json");
    expect(response.headers.has("set-cookie")).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("returns validation without setting an invite cookie", async () => {
    const response = await prepare(request('{"token":"invite-secret"}'));
    expect(await response.json()).toEqual({ valid: true });
    expect(response.headers.has("set-cookie")).toBe(false);
    expect(vi.mocked(fetch).mock.calls[0][1]).toMatchObject({
      redirect: "manual",
      cache: "no-store",
    });
  });
});

describe.each([
  "public",
  "prepare",
  "accept",
] as const)("%s invite adapter", (adapter) => {
  async function invoke() {
    if (adapter === "public")
      return publicInvite(
        new Request("https://web.test/api/mobile/public/invites/invite-secret"),
        context,
      );
    if (adapter === "prepare") return prepare(request('{"token":"invite-secret"}'));
    return accept(request('{"token":"invite-secret"}', "accept"));
  }
  it.each([
    400, 403, 429,
  ])("mirrors upstream %s Problem Details and allowed headers only", async (status) => {
    const problem = {
      type: "about:blank",
      title: "Rejected",
      status,
      detail: "Try later",
      instance: "/api/v1/invites",
      code: "INVITE_REJECTED",
      traceId: "trace-upstream",
    };
    vi.mocked(fetch).mockResolvedValue(
      Response.json(problem, {
        status,
        headers: {
          "content-type": "application/problem+json",
          "retry-after": "30",
          "x-correlation-id": "trace-upstream",
          location: "/retry",
          "set-cookie": "evil=secret",
          "set-auth-jwt": "server-jwt",
        },
      }),
    );
    const response = await invoke();
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual(problem);
    expect(Object.fromEntries(response.headers)).toEqual({
      "content-type": "application/problem+json",
      "retry-after": "30",
      "x-correlation-id": "trace-upstream",
    });
  });
  it("normalizes connection failures without exposing invite token", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("invite-secret server-jwt"));
    const response = await invoke();
    expect(response.status).toBe(502);
    expect(response.headers.get("content-type")).toBe("application/problem+json");
    expect(await response.text()).not.toMatch(/invite-secret|server-jwt/);
    expect(response.headers.has("set-cookie")).toBe(false);
  });
});

describe("invite acceptance", () => {
  it.each([
    null,
    "jwt-missing",
  ])("does not delete invitation on authentication failure %s", async (failure) => {
    getSession.mockResolvedValue({
      response: failure === null ? null : {},
      headers: new Headers(),
    });
    const response = await accept(request('{"token":"invite-secret"}', "accept"));
    expect(response.status).toBe(failure === null ? 401 : 502);
    expect(response.headers.has("set-cookie")).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("accepts the token supplied in this authenticated request only", async () => {
    const response = await accept(request('{"token":"invite-secret"}', "accept"));
    expect(response.ok).toBe(true);
    expect(response.headers.has("set-cookie")).toBe(false);
    expect(
      new Headers(vi.mocked(fetch).mock.calls[0][1]?.headers).get("authorization"),
    ).toBe("Bearer server-jwt");
    expect(await response.text()).not.toContain("server-jwt");
  });
  it.each([
    "{",
    "null",
    "{}",
    '{"token":""}',
    '{"token":"a/b"}',
  ])("requires a bounded token body before reaching backend: %s", async (body) => {
    const response = await accept(request(body, "accept"));
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("INVITE_TOKEN_REQUIRED");
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("public invite validation", () => {
  it.each(["", "   "])("rejects empty token %s", async (token) => {
    const response = await publicInvite(
      new Request("https://web.test/api/mobile/public/invites/token"),
      { params: Promise.resolve({ token }) },
    );
    expect(response.status).toBe(400);
    expect(response.headers.has("set-cookie")).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("strips upstream cookies on success and never forwards caller credentials", async () => {
    const response = await publicInvite(
      new Request("https://web.test/api/mobile/public/invites/invite-secret", {
        headers: {
          cookie: "secret",
          authorization: "Bearer secret",
          "x-user-id": "other",
        },
      }),
      context,
    );
    expect(response.ok).toBe(true);
    expect(response.headers.has("set-cookie")).toBe(false);
    expect(
      Object.fromEntries(new Headers(vi.mocked(fetch).mock.calls[0][1]?.headers)),
    ).toEqual({});
    expect(getSession).not.toHaveBeenCalled();
  });
});
