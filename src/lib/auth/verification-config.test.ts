import type { BetterAuthOptions } from "better-auth";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { bearerPlugin, configure, deliver, getOAuthState, jwtPlugin, schedule } =
  vi.hoisted(() => ({
    bearerPlugin: vi.fn(() => ({ id: "bearer" })),
    configure: vi.fn(),
    deliver: vi.fn(),
    getOAuthState: vi.fn(),
    jwtPlugin: vi.fn(() => ({ id: "jwt" })),
    schedule: vi.fn(),
  }));
vi.mock("better-auth", () => ({ betterAuth: configure }));
vi.mock("better-auth/api", () => ({ getOAuthState }));
vi.mock("next/server", () => ({ after: schedule }));
vi.mock("pg", () => ({ Pool: class {} }));
vi.mock("@better-auth/expo", () => ({ expo: () => ({ id: "expo" }) }));
vi.mock("better-auth/plugins", () => ({
  bearer: bearerPlugin,
  jwt: jwtPlugin,
}));
vi.mock("@/lib/auth/verification-email", () => ({ sendNodusVerificationEmail: deliver }));

let options: BetterAuthOptions;

beforeAll(async () => {
  vi.stubEnv("GOOGLE_CLIENT_ID", "google-client-test");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "google-secret-test");
  await import("@/lib/auth");
  options = configure.mock.calls[0][0] as BetterAuthOptions;
});
beforeEach(() => {
  deliver.mockReset();
  getOAuthState.mockReset().mockResolvedValue(null);
  schedule.mockClear();
  vi.stubEnv("NODUS_API_URL", "https://api.test");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("keeps mobile sessions cookie-bound while retaining the internal BFF JWT", () => {
  expect(options.plugins?.map((plugin) => plugin.id)).toEqual(["expo", "jwt"]);
  expect(bearerPlugin).not.toHaveBeenCalled();
  expect(jwtPlugin).toHaveBeenCalledTimes(1);
});

it("disables implicit Google signup so login cannot create a new role", () => {
  expect(options.socialProviders).toMatchObject({
    google: { disableImplicitSignUp: true },
  });
});

it("requires verification and awaits native URL delivery", async () => {
  expect(options.emailAndPassword?.requireEmailVerification).toBe(true);
  expect(options.emailVerification).toMatchObject({
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
  });
  let release = () => {};
  deliver.mockImplementationOnce(
    () => new Promise<void>((resolve) => (release = resolve)),
  );
  let settled = false;
  const sending = options.emailVerification?.sendVerificationEmail?.({
    user: {
      id: "test-user",
      email: "person@example.com",
      name: "Person",
      emailVerified: false,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    },
    url: "https://auth.example.com/api/auth/verify-email?token=native-token",
    token: "native-token",
  });
  sending?.then(() => (settled = true));
  await Promise.resolve();
  expect(deliver).toHaveBeenCalledExactlyOnceWith({
    email: "person@example.com",
    url: "https://auth.example.com/api/auth/verify-email?token=native-token",
  });
  expect(settled).toBe(false);
  release();
  await sending;
  expect(settled).toBe(true);
  expect(schedule).not.toHaveBeenCalled();
});

it("propagates verification delivery failures to the explicit resend endpoint", async () => {
  deliver.mockRejectedValueOnce(new Error("provider timeout"));
  await expect(
    options.emailVerification?.sendVerificationEmail?.({
      user: {
        id: "test-user",
        email: "person@example.com",
        name: "Person",
        emailVerified: false,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      },
      url: "https://auth.example.com/api/auth/verify-email?token=native-token",
      token: "native-token",
    }),
  ).rejects.toThrow("provider timeout");
});

describe("invite-aware user creation", () => {
  const user = {
    id: "test-user",
    email: "student@example.com",
    name: "Student",
    emailVerified: false,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
  const runHook = (headers: Headers, path = "/sign-up/email") =>
    options.databaseHooks?.user?.create?.before?.(user, {
      path,
      request: new Request(`https://auth.test/api/auth${path}`, { headers }),
    } as never);

  it("creates PERSONAL when no explicit email-signup invite exists", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      runHook(new Headers({ cookie: "nodus_registration_invite=stale-token" })),
    ).resolves.toMatchObject({ data: { role: "PERSONAL" } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates ALUNO only after a valid invite matches the signup email", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ role: "ALUNO", email: "STUDENT@example.com" }),
        ),
    );
    await expect(
      runHook(new Headers({ "x-nodus-invite-token": "valid-token" })),
    ).resolves.toMatchObject({ data: { role: "ALUNO" } });
  });

  it.each([
    410, 500,
  ])("aborts user creation when invite validation returns %s", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status })));
    await expect(
      runHook(new Headers({ "x-nodus-invite-token": "present-token" })),
    ).resolves.toBe(false);
  });

  it.each([
    [
      "malformed token",
      () => Promise.resolve(Response.json({ role: "ALUNO", email: user.email })),
    ],
    [
      "valid-token",
      () => Promise.resolve(Response.json({ role: "ALUNO", email: "other@example.com" })),
    ],
    ["valid-token", () => Promise.resolve(new Response("not-json"))],
    ["valid-token", () => Promise.reject(new Error("network failure"))],
  ])("aborts unverifiable invite context for %s", async (token, response) => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(response));
    await expect(runHook(new Headers({ "x-nodus-invite-token": token }))).resolves.toBe(
      false,
    );
  });

  it("uses the invite bound to the Better Auth OAuth transaction", async () => {
    getOAuthState.mockResolvedValue({
      requestSignUp: true,
      nodusSignupIntent: "student",
      nodusInviteToken: "oauth-token",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ role: "ALUNO", email: user.email })),
    );
    await expect(runHook(new Headers(), "/callback/:id")).resolves.toMatchObject({
      data: { role: "ALUNO" },
    });
  });

  it("creates PERSONAL only from an explicit personal OAuth signup transaction", async () => {
    getOAuthState.mockResolvedValue({
      requestSignUp: true,
      nodusSignupIntent: "personal",
    });
    await expect(runHook(new Headers(), "/callback/:id")).resolves.toMatchObject({
      data: { role: "PERSONAL" },
    });
  });

  it("fails closed when an OAuth user creation has no bound signup intent", async () => {
    await expect(runHook(new Headers(), "/callback/:id")).resolves.toBe(false);
  });
});
