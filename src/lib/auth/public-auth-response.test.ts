import { describe, expect, it, vi } from "vitest";
import { protectPublicAuthResponse } from "./public-auth-response";

describe("public Better Auth responses", () => {
  it.each(["GET", "POST"])("blocks public JWT issuance over %s", async (method) => {
    const handler = vi.fn(async () => new Response(JSON.stringify({ token: "jwt" })));
    const response = await protectPublicAuthResponse(handler)(
      new Request(`https://nodus.test/api/auth/token?callbackURL=%2F`, { method }),
    );

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
    expect(handler).not.toHaveBeenCalled();
  });

  it("removes only the internal API bridge JWT", async () => {
    const headers = new Headers({
      "set-auth-jwt": "private-bridge-token",
      "set-cookie": "better-auth.session_token=session-id; HttpOnly",
      "content-type": "text/plain",
    });
    headers.append("set-cookie", "better-auth.account_data=account-data; HttpOnly");
    const handler = vi.fn(
      async (_request: Request) => new Response("session", { status: 200, headers }),
    );

    const response = await protectPublicAuthResponse(handler)(
      new Request("https://nodus.test"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.has("set-auth-jwt")).toBe(false);
    expect(response.headers.get("set-cookie")).toContain("better-auth.session_token");
    expect(response.headers.get("set-cookie")).toContain("better-auth.account_data");
    expect(await response.text()).toBe("session");
  });
});
