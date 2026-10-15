import { describe, expect, it } from "vitest";
import { shouldRetryRequest } from "./retry-policy";

class HttpFailure extends Error {
  constructor(public status: number) {
    super(`HTTP ${status}`);
  }
}

describe("shouldRetryRequest", () => {
  it.each([400, 401, 403, 404, 409, 422, 429])("never retries HTTP %i", (status) => {
    expect(shouldRetryRequest(0, new HttpFailure(status))).toBe(false);
  });
  it.each([500, 502, 503, 599])("retries HTTP %i only once", (status) => {
    expect(shouldRetryRequest(0, new HttpFailure(status))).toBe(true);
    expect(shouldRetryRequest(1, new HttpFailure(status))).toBe(false);
  });
  it.each([
    "fetch failed",
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "Load failed",
  ])("retries network error %s once", (message) => {
    expect(shouldRetryRequest(0, new TypeError(message))).toBe(true);
    expect(shouldRetryRequest(1, new TypeError(message))).toBe(false);
  });
  it.each([
    new TypeError("Cannot read properties of undefined"),
    new Error("broken"),
    new DOMException("Aborted", "AbortError"),
    null,
    { status: "500" },
    new HttpFailure(600),
  ])("does not retry other failures: %s", (error) => {
    expect(shouldRetryRequest(0, error)).toBe(false);
  });
});
