import { describe, expect, it } from "vitest";
import { getTrustedOrigins } from "./trusted-origins";

describe("Better Auth trusted origins", () => {
  it("allows local web previews only during development", () => {
    expect(
      getTrustedOrigins({ nodeEnv: "development", mobileScheme: "nodusfit://" }),
    ).toEqual(["nodusfit://", "http://localhost:*", "http://127.0.0.1:*"]);
  });

  it("does not trust loopback web origins outside development", () => {
    expect(
      getTrustedOrigins({ nodeEnv: "production", mobileScheme: "nodusfit://" }),
    ).toEqual(["nodusfit://"]);
  });
});
