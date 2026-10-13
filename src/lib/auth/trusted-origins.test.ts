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
});
