import { afterEach, describe, expect, it, vi } from "vitest";
import { NodusApiError, nodusApiRequest, readProblemDetails } from "./nodus-api-client";

const isString = (value: unknown): value is string => typeof value === "string";
afterEach(() => vi.unstubAllGlobals());

describe("nodusApiRequest", () => {
  it("uses the BFF, JSON accept and authenticated uncached transport", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json("ok"));
    vi.stubGlobal("fetch", fetcher);
    const signal = new AbortController().signal;
    expect(
      await nodusApiRequest("/me", isString, {
        signal,
        headers: { accept: "text/plain", "x-correlation-id": "test" },
        credentials: "omit",
        cache: "force-cache",
      }),
    ).toBe("ok");
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("/api/backend/me");
    expect(init).toMatchObject({ signal, credentials: "include", cache: "no-store" });
    expect(init.headers.get("accept")).toBe("application/json");
    expect(init.headers.get("x-correlation-id")).toBe("test");
  });

  it("preserves Problem Details but uses authoritative HTTP status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            type: "about:blank",
            title: "Forbidden",
            detail: "Denied",
            status: 200,
            instance: "/students",
            code: "ACCESS_DENIED",
            traceId: "trace",
          },
          { status: 403 },
        ),
      ),
    );
    await expect(nodusApiRequest("v1/students", isString)).rejects.toMatchObject({
      name: "NodusApiError",
      status: 403,
      code: "ACCESS_DENIED",
      traceId: "trace",
      message: "Denied",
    });
  });

  it.each([
    null,
    [],
    "bad",
    { status: "200", title: 3, code: false },
  ])("provides defensive error defaults for %j", (payload) => {
    expect(readProblemDetails(payload, 503)).toMatchObject({
      type: "about:blank",
      status: 503,
      code: "UPSTREAM_REQUEST_FAILED",
    });
  });

  it("preserves valid validation field errors and rejects malformed entries", () => {
    expect(
      readProblemDetails(
        {
          errors: {
            email: ["Informe um e-mail válido."],
            empty: [],
            invalid: [1],
          },
        },
        400,
      ).errors,
    ).toEqual({ email: ["Informe um e-mail válido."] });
  });

  it.each(["{", "null", "{}", "42"])("rejects malformed success %s", async (body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body)));
    await expect(nodusApiRequest("me", isString)).rejects.toMatchObject({
      status: 502,
      code: "INVALID_API_RESPONSE",
    });
  });

  it("preserves correlation when a successful response violates the contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { unexpected: true },
            { headers: { "x-correlation-id": "invalid-contract-trace" } },
          ),
        ),
    );
    await expect(nodusApiRequest("me", isString)).rejects.toMatchObject({
      status: 502,
      code: "INVALID_API_RESPONSE",
      traceId: "invalid-contract-trace",
    });
  });

  it("uses HTTP failure for non-JSON errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response("bad gateway", {
            status: 502,
            headers: { "x-correlation-id": "trace-from-header" },
          }),
        ),
      ),
    );
    await expect(nodusApiRequest("me", isString)).rejects.toBeInstanceOf(NodusApiError);
    await expect(nodusApiRequest("me", isString)).rejects.toMatchObject({
      status: 502,
      code: "UPSTREAM_REQUEST_FAILED",
      traceId: "trace-from-header",
    });
  });

  it("preserves fetch cancellation", async () => {
    const error = new DOMException("Aborted", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
    await expect(nodusApiRequest("me", isString)).rejects.toBe(error);
  });

  it("preserves cancellation while reading the response body", async () => {
    const controller = new AbortController();
    let beginRead: () => void = () => undefined;
    const reading = new Promise<void>((resolve) => {
      beginRead = resolve;
    });
    const response = new Response(
      new ReadableStream({
        start(stream) {
          controller.signal.addEventListener("abort", () =>
            stream.error(controller.signal.reason),
          );
        },
        pull() {
          beginRead();
        },
      }),
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
    const pending = nodusApiRequest("me", isString, { signal: controller.signal });
    const error = new DOMException("Aborted", "AbortError");
    const assertion = expect(pending).rejects.toBe(error);
    await reading;
    controller.abort(error);
    await assertion;
  });
});
