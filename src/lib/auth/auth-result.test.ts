import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeVerifiedStudentInvite,
  personalEmailLogin,
  personalEmailRegister,
  personalGoogleLogin,
  personalGoogleStart,
  requestVerificationEmail,
  resolveAuthenticatedAccess,
  studentGoogleLogin,
  studentGoogleRegister,
  studentRegister,
} from "./access-actions";
import { INVITE_HEADER_NAME } from "./invite-context";

const client = vi.hoisted(() => ({
  signIn: { email: vi.fn(), social: vi.fn() },
  signUp: { email: vi.fn() },
  sendVerificationEmail: vi.fn(),
}));
vi.mock("@/lib/auth-client", () => ({ authClient: client }));
const fetchMock = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());
describe("email actions", () => {
  it("retries authenticated acceptance when public preparation reports an already-used invite", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url === "/api/registration-invites/prepare"
        ? Response.json(
            { code: "INVITE_USED", detail: "Convite já usado." },
            { status: 410 },
          )
        : Response.json({ accepted: true }),
    );

    await expect(completeVerifiedStudentInvite("Abc_123")).resolves.toEqual({
      status: "accepted",
      redirectTo: "/aluno",
    });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/api/registration-invites/accept",
    ]);
  });
  it("cancels a stale identity before starting authenticated acceptance", async () => {
    await expect(completeVerifiedStudentInvite("Abc_123", () => false)).resolves.toEqual({
      status: "cancelled",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("maps verification code without exposing provider copy", async () => {
    client.signIn.email.mockResolvedValue({
      error: { code: "EMAIL_NOT_VERIFIED", message: "secret" },
    });
    expect(await personalEmailLogin("person@example.com", "password")).toMatchObject({
      status: "verification-required",
      email: "person@example.com",
      callbackURL: "/acesso?perfil=personal&emailVerificado=1",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("sanitizes other provider errors", async () => {
    client.signIn.email.mockResolvedValue({
      error: { code: "FAILED", message: "secret" },
    });
    const result = await personalEmailLogin("person@example.com", "password");
    expect(result).toMatchObject({ status: "error", code: "FAILED" });
    expect(result.message).not.toContain("secret");
  });
  it("personal signup waits for verification without canonical fetch", async () => {
    client.signUp.email.mockResolvedValue({
      data: { user: { id: "u", email: "person@example.com", name: "Person" } },
    });
    expect(
      await personalEmailRegister({
        firstName: "Person",
        lastName: "Test",
        email: "person@example.com",
        password: "Password1",
      }),
    ).toMatchObject({ status: "verification-required" });
    expect(client.signUp.email).toHaveBeenCalledWith({
      email: "person@example.com",
      name: "Person Test",
      password: "Password1",
      callbackURL: "/acesso?perfil=personal&emailVerificado=1",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("student signup prepares but never accepts before verification", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    client.signUp.email.mockResolvedValue({ data: { user: { id: "u" } } });
    expect(
      await studentRegister(
        { status: "valid" },
        "student@example.com",
        "Student",
        "Password1",
        "Abc_123-xyz",
      ),
    ).toMatchObject({
      status: "verification-required",
      callbackURL: "/acesso?perfil=aluno&token=Abc_123-xyz&emailVerificado=1",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/registration-invites/prepare");
    expect(client.signUp.email).toHaveBeenCalledWith(
      {
        callbackURL: "/acesso?perfil=aluno&token=Abc_123-xyz&emailVerificado=1",
        email: "student@example.com",
        name: "Student",
        password: "Password1",
      },
      { headers: { [INVITE_HEADER_NAME]: "Abc_123-xyz" } },
    );
  });
  it("resends using native BetterAuth", async () => {
    client.sendVerificationEmail.mockResolvedValue({ data: { status: true } });
    expect(
      await requestVerificationEmail(
        "person@example.com",
        "/acesso?perfil=personal&emailVerificado=1",
      ),
    ).toMatchObject({ status: "verification-required" });
    expect(client.sendVerificationEmail).toHaveBeenCalledWith({
      email: "person@example.com",
      callbackURL: "/acesso?perfil=personal&emailVerificado=1",
    });
  });

  it("only requests Google signup from explicit registration flows", async () => {
    client.signIn.social.mockResolvedValue({
      data: { url: "https://accounts.google.test" },
    });
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await personalGoogleLogin();
    await studentGoogleLogin();
    await personalGoogleStart();
    await studentGoogleRegister({ status: "valid" }, "Abc_123-xyz");

    expect(client.signIn.social).toHaveBeenNthCalledWith(1, {
      provider: "google",
      callbackURL: "/acesso?perfil=personal",
      requestSignUp: false,
    });
    expect(client.signIn.social).toHaveBeenNthCalledWith(2, {
      provider: "google",
      callbackURL: "/acesso?perfil=aluno",
      requestSignUp: false,
    });
    expect(client.signIn.social).toHaveBeenNthCalledWith(3, {
      provider: "google",
      callbackURL: "/acesso?perfil=personal",
      requestSignUp: true,
      additionalData: { nodusSignupIntent: "personal" },
    });
    expect(client.signIn.social).toHaveBeenNthCalledWith(4, {
      provider: "google",
      callbackURL: "/acesso?perfil=aluno&token=Abc_123-xyz",
      requestSignUp: true,
      additionalData: {
        nodusSignupIntent: "student",
        nodusInviteToken: "Abc_123-xyz",
      },
    });
  });

  it("rejects a partial canonical me payload instead of authenticating it", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        user: {
          userId: "person-1",
          email: "person@example.com",
          name: "Person",
          role: "PERSONAL",
          emailVerified: true,
          isActive: true,
          isBanned: false,
          personalProfileId: null,
          studentProfileId: null,
        },
        personalProfile: 42,
        studentProfile: null,
        onboarding: { required: false, missingFields: [] },
      }),
    );

    await expect(resolveAuthenticatedAccess("person-1", "email")).resolves.toMatchObject({
      status: "error",
    });
  });
  it.each([
    "email",
    "google",
  ] as const)("sends a completed personal %s session to the protected roster", async (method) => {
    fetchMock.mockResolvedValue(
      Response.json({
        user: {
          userId: "person-1",
          email: "person@example.com",
          name: "Person",
          role: "PERSONAL",
          emailVerified: true,
          isActive: true,
          isBanned: false,
          personalProfileId: "0bbf3eae-6c01-4afd-a003-b6e481e68083",
          studentProfileId: null,
        },
        personalProfile: {
          id: "0bbf3eae-6c01-4afd-a003-b6e481e68083",
          cpf: "123",
          cref: "456",
          telefone: "789",
          especialidade: null,
        },
        studentProfile: null,
        onboarding: { required: false, missingFields: [] },
      }),
    );

    await expect(resolveAuthenticatedAccess("person-1", method)).resolves.toMatchObject({
      status: "authenticated",
      redirectTo: "/alunos",
      authMethod: method,
    });
  });
});
