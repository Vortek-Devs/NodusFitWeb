import { describe, expect, it } from "vitest";
import { buildBackendHeaders } from "./headers";

describe("BFF backend headers", () => {
  it("replaces authorization and drops browser identity headers", () => {
    const incoming = new Headers({
      authorization: "Bearer attacker",
      "x-user-id": "spoofed",
      "x-user-role": "ADMIN",
      "content-type": "application/json",
    });

    const outgoing = buildBackendHeaders(incoming, "server-jwt");

    expect(outgoing.get("authorization")).toBe("Bearer server-jwt");
    expect(outgoing.get("x-user-id")).toBeNull();
    expect(outgoing.get("x-user-role")).toBeNull();
    expect(outgoing.get("content-type")).toBe("application/json");
  });
});
