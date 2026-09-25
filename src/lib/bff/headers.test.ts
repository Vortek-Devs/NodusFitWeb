import { describe, expect, it } from "vitest";
import {
  buildBackendHeaders,
  buildClientResponseHeaders,
  buildPublicBackendHeaders,
} from "./headers";

describe("BFF backend headers", () => {
  it("copies exact public request and client response allowlists", () => {
    const incoming = new Headers({
      accept: "application/json",
      "content-type": "application/problem+json",
      "if-none-match": "version1",
      "x-correlation-id": "trace-1",
      location: "/next",
      "retry-after": "30",
      cookie: "secret",
      "set-cookie": "secret",
      authorization: "Bearer secret",
      "set-auth-jwt": "secret",
      "x-user-id": "other",
      "x-role": "ADMIN",
      "x-forwarded-user": "other",
    });
    expect(Object.fromEntries(buildPublicBackendHeaders(incoming))).toEqual({
      accept: "application/json",
      "content-type": "application/problem+json",
      "if-none-match": "version1",
    });
    expect(Object.fromEntries(buildClientResponseHeaders(incoming))).toEqual({
      "content-type": "application/problem+json",
      "x-correlation-id": "trace-1",
      "retry-after": "30",
    });
  });
  it.each([
    "/api/v1/students/1",
    "http://internal-api:8080/api/v1/students/1",
  ])("does not expose upstream Location %s to the browser", (location) => {
    const outgoing = buildClientResponseHeaders(
      new Headers({ location, "x-correlation-id": "trace-1" }),
    );

    expect(outgoing.has("location")).toBe(false);
    expect(outgoing.get("x-correlation-id")).toBe("trace-1");
  });
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
