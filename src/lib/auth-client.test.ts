import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("web auth client origin", () => {
  it("sends auth requests to the page origin instead of a stale configured port", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubGlobal("window", { location: { origin: "http://127.0.0.1:3011" } });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ message: "Invalid email or password" }, { status: 401 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { authClient } = await import("./auth-client");
    await authClient.signIn.email({
      email: "codex-origin-probe@example.invalid",
      password: "invalid-probe-only",
    });

    const [request] = fetchMock.mock.calls[0] as [Request | string];
    const requestUrl = request instanceof Request ? request.url : request;
    expect(new URL(requestUrl).origin).toBe("http://127.0.0.1:3011");
  });
});
