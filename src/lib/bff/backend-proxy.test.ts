import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as web from "@/app/api/backend/[...path]/route";
import * as mobile from "@/app/api/mobile/backend/[...path]/route";

const { getSession, webHeaders } = vi.hoisted(() => ({
  getSession: vi.fn(),
  webHeaders: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("next/headers", () => ({ headers: webHeaders }));

beforeEach(() => {
  vi.stubEnv("NODUS_API_URL", "https://api.test/base");
  getSession.mockReset().mockResolvedValue({
    response: { user: { id: "user" } },
    headers: new Headers({ "set-auth-jwt": "server-jwt", "set-cookie": "auth-secret" }),
  });
  webHeaders.mockReset().mockResolvedValue(new Headers({ cookie: "web-session" }));
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe.each([
  ["web", web],
  ["mobile", mobile],
] as const)("%s authenticated boundary", (channel, route) => {
  const context = (path = ["v1", "students"]) => ({ params: Promise.resolve({ path }) });
  it("preserves binary request, query, method and safe response metadata", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(new Uint8Array([0, 255, 42]), {
        status: 201,
        headers: {
          "content-type": "application/octet-stream",
          location: "/api/v1/students/1",
          "retry-after": "9",
          "x-correlation-id": "trace-1",
          "set-cookie": "secret",
          "set-auth-jwt": "secret",
          "x-private": "secret",
        },
      }),
    );
    const request = new Request("https://web.test/api/backend/v1/students?q=a%2Fb&q=2", {
      method: "PATCH",
      body: new Uint8Array([255, 0, 17]),
      headers: {
        authorization: "Bearer forged",
        cookie: "native-session",
        "x-user-id": "other",
        "x-role": "ADMIN",
        "x-forwarded-user": "other",
        "set-cookie": "forged",
        accept: "application/json",
        "content-type": "application/octet-stream",
        "if-none-match": '"v1"',
        "x-correlation-id": "trace-1",
      },
    });
    const response = await route.PATCH(request, context());
    const [target, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(target)).toBe("https://api.test/api/v1/students?q=a%2Fb&q=2");
    expect(init).toMatchObject({
      method: "PATCH",
      cache: "no-store",
      redirect: "manual",
      signal: request.signal,
    });
    expect(new Uint8Array(init?.body as ArrayBuffer)).toEqual(
      new Uint8Array([255, 0, 17]),
    );
    expect(Object.fromEntries(new Headers(init?.headers))).toEqual({
      authorization: "Bearer server-jwt",
      accept: "application/json",
      "content-type": "application/octet-stream",
      "if-none-match": '"v1"',
    });
    expect(getSession.mock.calls[0][0].headers.get("cookie")).toBe(
      channel === "web" ? "web-session" : "native-session",
    );
    expect(getSession.mock.calls[0][0].returnHeaders).toBe(true);
    expect(response.status).toBe(201);
    expect(Object.fromEntries(response.headers)).toEqual({
      "content-type": "application/octet-stream",
      "retry-after": "9",
      "x-correlation-id": "trace-1",
    });
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array([0, 255, 42]),
    );
  });
  it.each(["GET", "HEAD"])("%s never forwards a body", async (method) => {
    await route.GET(
      new Request("https://web.test/api/backend/v1/students", { method }),
      context(),
    );
    expect(vi.mocked(fetch).mock.calls[0][1]?.body).toBeUndefined();
  });
  it.each([
    [401, "SESSION_REQUIRED", "session"],
    [502, "AUTH_BRIDGE_UNAVAILABLE", "jwt"],
    [502, "AUTH_BRIDGE_UNAVAILABLE", "lookup"],
    [502, "BACKEND_UNAVAILABLE", "fetch"],
  ] as const)("returns safe %s %s on %s failure", async (status, code, failure) => {
    if (failure === "session")
      getSession.mockResolvedValue({ response: null, headers: new Headers() });
    if (failure === "jwt")
      getSession.mockResolvedValue({ response: {}, headers: new Headers() });
    if (failure === "lookup")
      getSession.mockRejectedValue(new Error("credential-secret"));
    if (failure === "fetch")
      vi.mocked(fetch).mockRejectedValue(new Error("credential-secret"));
    const response = await route.GET(
      new Request("https://web.test/api/backend/v1/students?secret=hidden"),
      context(),
    );
    expect(response.status).toBe(status);
    expect(response.headers.get("content-type")).toBe("application/problem+json");
    const body = await response.json();
    expect(body).toMatchObject({
      code,
      status,
      type: "about:blank",
      instance: "/api/backend/v1/students",
      traceId: response.headers.get("x-correlation-id"),
    });
    expect(JSON.stringify(body)).not.toMatch(/credential-secret|server-jwt|hidden/);
    if (failure !== "fetch") expect(fetch).not.toHaveBeenCalled();
  });
  it.each([
    "",
    "bad-url",
    "ftp://api.test",
    "https://user:secret@api.test",
  ])("rejects unsafe configuration %s", async (base) => {
    vi.stubEnv("NODUS_API_URL", base);
    const response = await route.GET(
      new Request("https://web.test/api/backend/v1/students"),
      context(),
    );
    expect(response.status).toBe(500);
    expect((await response.json()).code).toBe("NODUS_API_NOT_CONFIGURED");
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([".", ".."])("rejects dot segment %s", async (segment) => {
    const response = await route.GET(
      new Request("https://web.test/api/backend/x"),
      context(["v1", segment, "students"]),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("INVALID_BACKEND_PATH");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("propagates cancellation instead of claiming an outage", async () => {
    const controller = new AbortController();
    controller.abort();
    const request = new Request("https://web.test/api/backend/v1/students", {
      signal: controller.signal,
    });
    await expect(route.GET(request, context())).rejects.toBe(request.signal.reason);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("propagates cancellation while backend fetch is running", async () => {
    const controller = new AbortController();
    const reason = new DOMException("Cancelled", "AbortError");
    const request = new Request("https://web.test/api/backend/v1/students", {
      signal: controller.signal,
    });
    vi.mocked(fetch).mockImplementation(async () => {
      controller.abort(reason);
      throw request.signal.reason;
    });
    await expect(route.GET(request, context())).rejects.toBe(reason);
  });
  it("encodes reserved characters within a single backend path segment", async () => {
    await route.GET(
      new Request("https://web.test/api/backend/x"),
      context(["v1", "students", "a/b?#é"]),
    );
    expect(String(vi.mocked(fetch).mock.calls[0][0])).toBe(
      "https://api.test/api/v1/students/a%2Fb%3F%23%C3%A9",
    );
  });
});
