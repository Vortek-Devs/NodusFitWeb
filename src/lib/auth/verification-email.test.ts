import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendNodusVerificationEmail } from "./verification-email";

const email = "person@example.com";
const url =
  "https://auth.example.com/api/auth/verify-email?token=private-token&callbackURL=%2Facesso";

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "test-key");
  vi.stubEnv("AUTH_EMAIL_FROM", "Nodus Fit <acesso@example.com>");
  vi.stubEnv("BETTER_AUTH_URL", "https://auth.example.com");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("verification email delivery", () => {
  it("sends the native URL with accessible Portuguese HTML and text", async () => {
    await sendNodusVerificationEmail({ email, url });
    expect(fetch).toHaveBeenCalledTimes(1);
    const [endpoint, request] = vi.mocked(fetch).mock.calls[0];
    expect(endpoint).toBe("https://api.resend.com/emails");
    expect(request?.method).toBe("POST");
    expect(request?.headers).toMatchObject({
      authorization: "Bearer test-key",
      "content-type": "application/json",
      "idempotency-key": `nodus-email-verification-${createHash("sha256").update(url, "utf8").digest("hex")}`,
    });
    const body = JSON.parse(String(request?.body));
    expect(body).toMatchObject({
      from: "Nodus Fit <acesso@example.com>",
      to: [email],
      subject: "Confirme seu e-mail no Nodus Fit",
    });
    expect(body.text).toContain(url);
    expect(body.html).toContain('lang="pt-BR"');
    expect(body.html).toContain("Confirmar e-mail</a>");
    expect(body.html).toContain(url.replaceAll("&", "&amp;"));
    expect(body.html).not.toMatch(/<img|<script|person@example.com/i);
    expect(new Set(body.html.match(/#[\da-f]{6}/gi))).toEqual(
      new Set(["#F0FBF8", "#04342C", "#FFFFFF", "#3DD9A4"]),
    );
  });

  it("reuses idempotency for the same URL and separates different full URLs", async () => {
    for (const link of [url, url, `${url}&other=1`])
      await sendNodusVerificationEmail({ email, url: link });
    const keys = vi
      .mocked(fetch)
      .mock.calls.map(([, request]) =>
        new Headers(request?.headers).get("idempotency-key"),
      );
    expect(keys[0]).toMatch(/^nodus-email-verification-[a-f0-9]{64}$/);
    expect(keys[0]).toBe(keys[1]);
    expect(keys[0]).not.toBe(keys[2]);
  });

  it("escapes HTML metacharacters in the URL", async () => {
    await sendNodusVerificationEmail({ email, url: `${url}&x="'<tag>` });
    const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(body.html).toContain("&amp;x=&quot;&#39;&lt;tag&gt;");
    expect(body.html).not.toContain("<tag>");
  });

  it.each([
    "RESEND_API_KEY",
    "AUTH_EMAIL_FROM",
    "BETTER_AUTH_URL",
  ])("requires %s only on invocation", async (key) => {
    vi.stubEnv(key, "");
    const delivery = sendNodusVerificationEmail({ email, url });
    await expect(delivery).rejects.toMatchObject({
      name: "VerificationEmailError",
      message: "EMAIL_DELIVERY_NOT_CONFIGURED",
      code: "EMAIL_DELIVERY_NOT_CONFIGURED",
    });
    await expect(delivery).rejects.not.toHaveProperty("cause");
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid", "https://auth.example.com"],
    [url, "invalid"],
    ["https://evil.example.com/verify", "https://auth.example.com"],
    ["http://auth.example.com/verify", "https://auth.example.com"],
    ["https://auth.example.com:444/verify", "https://auth.example.com"],
    ["ftp://auth.example.com/verify", "ftp://auth.example.com"],
    ["javascript:alert(1)", "javascript:alert(2)"],
    ["https://user:password@auth.example.com/verify", "https://auth.example.com"],
    [url, "https://user:password@auth.example.com"],
  ])("rejects unsafe verification/base URL pair %s %s", async (link, base) => {
    vi.stubEnv("BETTER_AUTH_URL", base);
    const delivery = sendNodusVerificationEmail({ email, url: link });
    await expect(delivery).rejects.toMatchObject({
      message: "EMAIL_DELIVERY_FAILED",
      code: "EMAIL_DELIVERY_FAILED",
    });
    await expect(delivery).rejects.not.toHaveProperty("cause");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("permits credential-free local HTTP with matching origins", async () => {
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    await expect(
      sendNodusVerificationEmail({
        email,
        url: "http://localhost:3000/api/auth/verify-email?token=test",
      }),
    ).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    "http",
    "network",
  ])("normalizes %s failures without provider or exception details", async (failure) => {
    const secret = `${email} ${url} test-key provider-private-detail`;
    if (failure === "http")
      vi.mocked(fetch).mockResolvedValue(new Response(secret, { status: 429 }));
    else vi.mocked(fetch).mockRejectedValue(new Error(secret));
    const delivery = sendNodusVerificationEmail({ email, url });
    await expect(delivery).rejects.toMatchObject({
      name: "VerificationEmailError",
      message: "EMAIL_DELIVERY_FAILED",
      code: "EMAIL_DELIVERY_FAILED",
    });
    await expect(delivery).rejects.not.toHaveProperty("cause");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
