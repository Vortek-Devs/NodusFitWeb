import { describe, expect, it, vi } from "vitest";
import { withoutBridgeJwt } from "./public-auth-response";

describe("public Better Auth responses", () => {
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

    const response = await withoutBridgeJwt(handler)(new Request("https://nodus.test"));

    expect(response.status).toBe(200);
    expect(response.headers.has("set-auth-jwt")).toBe(false);
    expect(response.headers.get("set-cookie")).toContain("better-auth.session_token");
    expect(response.headers.get("set-cookie")).toContain("better-auth.account_data");
    expect(await response.text()).toBe("session");
  });
});
