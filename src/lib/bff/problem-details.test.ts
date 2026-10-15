import { describe, expect, it } from "vitest";
import { problemResponse } from "./problem-details";

describe("local Problem Details", () => {
  it.each([
    "trace_1.2-3",
    "a".repeat(128),
  ])("replaces untrusted correlation %s", async (candidate) => {
    const response = problemResponse(
      new Request("https://web.test/api/backend/v1/students?secret=hidden", {
        headers: { "x-correlation-id": candidate },
      }),
      401,
      "SESSION_REQUIRED",
    );
    const traceId = response.headers.get("x-correlation-id");
    expect(traceId).not.toBe(candidate);
    expect(traceId).toMatch(/^[a-f0-9]{32}$/);
    expect(await response.json()).toEqual({
      type: "about:blank",
      title: "Autenticação necessária.",
      status: 401,
      detail: "Entre novamente para continuar.",
      instance: "/api/backend/v1/students",
      code: "SESSION_REQUIRED",
      traceId,
    });
  });
  it.each([
    "",
    "a".repeat(129),
    "<script>",
    "trace,second",
    "trace with spaces",
  ])("replaces unsafe correlation %s", async (candidate) => {
    const response = problemResponse(
      new Request("https://web.test/api/backend/v1/students", {
        headers: { "x-correlation-id": candidate },
      }),
      502,
      "BACKEND_UNAVAILABLE",
    );
    const traceId = response.headers.get("x-correlation-id");
    expect(traceId).toMatch(/^[a-f0-9]{32}$/);
    expect((await response.json()).traceId).toBe(traceId);
  });
  it.each([
    "/api/mobile/public/invites/secret-token",
    "/api/backend/v1/invites/secret-token/accept",
    "/api/mobile/backend/v1/invites/secret-token",
  ])("redacts invitation credentials at %s", async (path) => {
    const response = problemResponse(
      new Request(`https://web.test${path}?token=secret-token`),
      502,
      "BACKEND_UNAVAILABLE",
    );
    expect(await response.text()).not.toContain("secret-token");
  });
});
