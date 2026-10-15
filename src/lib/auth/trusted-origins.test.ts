import { describe, expect, it } from "vitest";
import { getTrustedOrigins } from "./trusted-origins";

describe("Better Auth trusted origins", () => {
  it("allows local web and Expo Go origins only during development", () => {
    expect(
      getTrustedOrigins({ nodeEnv: "development", mobileScheme: "nodusfit://" }),
    ).toEqual([
      "nodusfit://",
      "http://localhost:*",
      "http://127.0.0.1:*",
      "exp://",
      "exp://**",
    ]);
  });

  it("does not trust loopback web origins outside development", () => {
    expect(
      getTrustedOrigins({ nodeEnv: "production", mobileScheme: "nodusfit://" }),
    ).toEqual(["nodusfit://"]);
  });

  it("does not trust Expo Go origins outside development", () => {
    expect(
      getTrustedOrigins({ nodeEnv: "production", mobileScheme: "nodusfit://" }),
    ).not.toContain("exp://**");
  });

  it("allows one exact Expo Go origin only on the configured staging branch", () => {
    expect(
      getTrustedOrigins({
        nodeEnv: "production",
        mobileScheme: "nodusfit://",
        vercelEnv: "preview",
        vercelGitCommitRef: "codex/final-pr-preview-2026-09-28",
        previewExpoGoOrigin: "exp://192.168.50.20:8081",
      }),
    ).toEqual(["nodusfit://", "exp://192.168.50.20:8081"]);
  });

  it.each([
    { vercelEnv: "production", vercelGitCommitRef: "codex/final-pr-preview-2026-09-28" },
    { vercelEnv: "preview", vercelGitCommitRef: "feature/other-branch" },
  ])("does not trust the Expo Go origin outside its staging branch", (runtime) => {
    expect(
      getTrustedOrigins({
        nodeEnv: "production",
        mobileScheme: "nodusfit://",
        ...runtime,
        previewExpoGoOrigin: "exp://192.168.50.20:8081",
      }),
    ).toEqual(["nodusfit://"]);
  });

  it.each([
    "exp://",
    "exp://**",
    "exp://192.168.50.20:8081/--/",
    "https://example.com",
  ])("rejects non-exact Expo Go origin %s", (previewExpoGoOrigin) => {
    expect(
      getTrustedOrigins({
        nodeEnv: "production",
        mobileScheme: "nodusfit://",
        vercelEnv: "preview",
        vercelGitCommitRef: "codex/final-pr-preview-2026-09-28",
        previewExpoGoOrigin,
      }),
    ).toEqual(["nodusfit://"]);
  });
});
