import { describe, expect, it } from "vitest";
import { formatNodusDate } from "./format-student-date";

describe("formatNodusDate", () => {
  it.each([
    ["2000-01-01", "01/01/2000"],
    ["0099-01-01", "01/01/0099"],
    ["0001-02-03", "03/02/0001"],
    ["2000-02-29", "29/02/2000"],
    ["2026-09-08T12:30:00Z", "08/09/2026"],
    ["2025-02-29", "Data indisponível"],
    ["2026-04-31T12:00:00Z", "Data indisponível"],
    ["0000-01-01", "Data indisponível"],
    ["invalid", "Data indisponível"],
    ["2026-01-01T25:00:00Z", "Data indisponível"],
  ])("formats %s without calendar normalization", (value, expected) => {
    expect(formatNodusDate(value)).toBe(expected);
  });
});
