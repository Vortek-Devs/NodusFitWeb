export type AuthRole = "personal" | "aluno";

export type InviteStatus = "valid" | "missing" | "expired" | "invalid";

export type InviteValidation = {
  status: InviteStatus;
  personal?: {
    name: string;
    initials: string;
    title: string;
    city: string;
    students: number;
  };
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: AuthRole;
  personalId: string | null;
  emailVerified: boolean;
};

export type PersonalEmailRegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  cref: string;
  specialty: string;
  password: string;
};

export type PersonalGoogleProfilePayload = {
  cref: string;
  specialty: string;
};

export type GeneralProfile = {
  userId: string;
  phone: string | null;
  birthdate: string | null;
  bio: string | null;
};

export type PersonalProfile = {
  id: string;
  userId: string;
  brandColor: "#3DD9A4";
  cref: string | null;
  specialty: string | null;
};

export type ProfileProvisioning = {
  userInsert: {
    role: AuthRole;
    personalId: null;
  };
  trigger: "trg_user_created";
  generalProfile: GeneralProfile;
  personalProfile: PersonalProfile;
  personalProfileUpdate?: {
    endpoint: "PATCH /api/me/personal-profile";
    fields: Pick<PersonalProfile, "brandColor" | "cref" | "specialty">;
  };
};

// BetterAuth will rotate refresh tokens through httpOnly cookies. The client contract
// intentionally exposes only short-lived access-token shaped data for mocks.
export type AuthResult =
  | {
      ok: true;
      redirectTo: string;
      message: string;
      token?: string;
      user: AuthUser;
      authMethod: "email" | "google";
      emailVerificationSent?: boolean;
      featuresLockedUntilEmailVerified?: string[];
      profileProvisioning?: ProfileProvisioning;
      meContract?: {
        endpoint: "GET /api/me";
        authorization: "Bearer <token>";
        includes: ["user", "general_profile", "personal_profile"];
      };
      backendContract: {
        endpoint: string;
        refreshToken: "httpOnly-cookie";
        additionalFields?: {
          role: AuthRole;
        };
      };
    }
  | {
      ok: false;
      field?: string;
      message: string;
    };

const validInviteTokens = new Set(["convite-valido", "valid", "marcos", "vor-70"]);
const expiredInviteTokens = new Set(["expirado", "expired"]);
const duplicatePersonalEmails = new Set([
  "personal@exemplo.com",
  "duplicado@nodus.fit",
  "teste@nodus.fit",
]);

const lockedPersonalFeatures = ["Convidar alunos", "Controle financeiro"];

export function validateInviteToken(token?: string): InviteValidation {
  if (!token) {
    return { status: "missing" };
  }

  const normalizedToken = token.trim().toLowerCase();

  if (expiredInviteTokens.has(normalizedToken)) {
    return { status: "expired" };
  }

  if (!validInviteTokens.has(normalizedToken)) {
    return { status: "invalid" };
  }

  return {
    status: "valid",
    personal: {
      name: "Marcos Pereira",
      initials: "MP",
      title: "Personal Trainer",
      city: "Sao Paulo",
      students: 32,
    },
  };
}

export async function personalEmailLogin(): Promise<AuthResult> {
  await waitForMock();

  return {
    ok: true,
    redirectTo: "/dashboard",
    message: "Bem-vindo de volta. Redirecionando para o painel.",
    token: "mock-access-token-personal-email",
    user: {
      id: "user_personal_email",
      email: "personal@nodus.fit",
      name: "Marcos Pereira",
      role: "personal",
      personalId: "personal_marcos",
      emailVerified: true,
    },
    authMethod: "email",
    backendContract: {
      endpoint: "POST /api/auth/sign-in/email",
      refreshToken: "httpOnly-cookie",
      additionalFields: { role: "personal" },
    },
  };
}

export async function personalGoogleLogin(): Promise<AuthResult> {
  await waitForMock();

  return {
    ok: true,
    redirectTo: "/dashboard",
    message: "Google confirmado. Redirecionando para o painel.",
    token: "mock-access-token-personal-google",
    user: {
      id: "user_personal_google",
      email: "marcos.google@nodus.fit",
      name: "Marcos Pereira",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=Marcos%20Pereira",
      role: "personal",
      personalId: "personal_marcos",
      emailVerified: true,
    },
    authMethod: "google",
    backendContract: {
      endpoint: "GET /api/auth/sign-in/social/google",
      refreshToken: "httpOnly-cookie",
      additionalFields: { role: "personal" },
    },
  };
}

export async function personalEmailRegister(
  payload: PersonalEmailRegisterPayload,
): Promise<AuthResult> {
  await waitForMock();

  if (duplicatePersonalEmails.has(payload.email.trim().toLowerCase())) {
    return {
      ok: false,
      field: "email",
      message: "Este email ja esta cadastrado. Use outro email ou entre no painel.",
    };
  }

  return {
    ok: true,
    redirectTo: "/onboarding",
    message:
      "Conta criada. Enviamos o email de verificacao; convites e financeiro ficam bloqueados ate validar.",
    token: "mock-access-token-personal-register",
    user: {
      id: "user_personal_new",
      email: payload.email,
      name: `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim(),
      role: "personal",
      personalId: "personal_new",
      emailVerified: false,
    },
    authMethod: "email",
    emailVerificationSent: true,
    featuresLockedUntilEmailVerified: lockedPersonalFeatures,
    profileProvisioning: buildPersonalProvisioning({
      brandColor: "#3DD9A4",
      cref: payload.cref || null,
      phone: payload.whatsapp,
      personalId: "personal_new",
      specialty: payload.specialty,
      userId: "user_personal_new",
    }),
    meContract: buildMeContract(),
    backendContract: {
      endpoint: "POST /api/auth/sign-up/email",
      refreshToken: "httpOnly-cookie",
      additionalFields: { role: "personal" },
    },
  };
}

export async function personalGoogleStart(): Promise<AuthResult> {
  await waitForMock();

  return {
    ok: true,
    redirectTo: "/acesso?oauth=google-callback",
    message:
      "Google conectado. Nome e avatar preenchidos; complete CREF e especialidade.",
    token: "mock-google-callback-token",
    user: {
      id: "user_google_callback",
      email: "marcos.google@nodus.fit",
      name: "Marcos Pereira",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=Marcos%20Pereira",
      role: "personal",
      personalId: "personal_google_pending",
      emailVerified: true,
    },
    authMethod: "google",
    profileProvisioning: buildPersonalProvisioning({
      brandColor: "#3DD9A4",
      cref: null,
      phone: null,
      personalId: "personal_google_pending",
      specialty: null,
      userId: "user_google_callback",
    }),
    meContract: buildMeContract(),
    backendContract: {
      endpoint: "GET /api/auth/sign-in/social/google",
      refreshToken: "httpOnly-cookie",
      additionalFields: { role: "personal" },
    },
  };
}

export async function personalGoogleCompleteProfile(
  payload: PersonalGoogleProfilePayload,
): Promise<AuthResult> {
  await waitForMock();

  return {
    ok: true,
    redirectTo: "/onboarding",
    message:
      "Perfil profissional atualizado com CREF e especialidade. Indo para o onboarding.",
    token: "mock-access-token-personal-google-complete",
    user: {
      id: "user_google_callback",
      email: "marcos.google@nodus.fit",
      name: "Marcos Pereira",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=Marcos%20Pereira",
      role: "personal",
      personalId: "personal_google_pending",
      emailVerified: true,
    },
    authMethod: "google",
    profileProvisioning: {
      ...buildPersonalProvisioning({
        brandColor: "#3DD9A4",
        cref: null,
        phone: null,
        personalId: "personal_google_pending",
        specialty: null,
        userId: "user_google_callback",
      }),
      personalProfileUpdate: {
        endpoint: "PATCH /api/me/personal-profile",
        fields: {
          brandColor: "#3DD9A4",
          cref: payload.cref || null,
          specialty: payload.specialty,
        },
      },
    },
    meContract: buildMeContract(),
    backendContract: {
      endpoint: "PATCH /api/me/personal-profile",
      refreshToken: "httpOnly-cookie",
      additionalFields: { role: "personal" },
    },
  };
}

export async function mockStudentLogin(): Promise<AuthResult> {
  await waitForMock();

  return {
    ok: true,
    redirectTo: "/aluno/treino",
    message: "Login confirmado. Carregando o treino de hoje.",
    token: "mock-access-token-student-email",
    user: {
      id: "user_student_email",
      email: "aluno@nodus.fit",
      name: "Ana Costa",
      role: "aluno",
      personalId: "personal_marcos",
      emailVerified: true,
    },
    authMethod: "email",
    backendContract: {
      endpoint: "POST /api/auth/sign-in/email",
      refreshToken: "httpOnly-cookie",
    },
  };
}

export async function mockStudentGoogleLogin(): Promise<AuthResult> {
  await waitForMock();

  return {
    ok: true,
    redirectTo: "/aluno/treino",
    message: "Google confirmado. Carregando o treino de hoje.",
    token: "mock-access-token-student-google",
    user: {
      id: "user_student_google",
      email: "ana.google@nodus.fit",
      name: "Ana Costa",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=Ana%20Costa",
      role: "aluno",
      personalId: "personal_marcos",
      emailVerified: true,
    },
    authMethod: "google",
    backendContract: {
      endpoint: "GET /api/auth/sign-in/social/google",
      refreshToken: "httpOnly-cookie",
    },
  };
}

export async function mockStudentRegister(invite: InviteValidation): Promise<AuthResult> {
  await waitForMock();

  if (invite.status !== "valid") {
    return {
      ok: false,
      message: "Convite invalido ou expirado. Solicite um novo link ao seu personal.",
    };
  }

  return {
    ok: true,
    redirectTo: "/aluno/treino",
    message: "Conta criada. Seu treino ja esta pronto.",
    token: "mock-access-token-student-register",
    user: {
      id: "user_student_invite",
      email: "aluno.convidado@nodus.fit",
      name: "Aluno Convidado",
      role: "aluno",
      personalId: "personal_marcos",
      emailVerified: true,
    },
    authMethod: "email",
    backendContract: {
      endpoint: "POST /api/auth/sign-up/email",
      refreshToken: "httpOnly-cookie",
    },
  };
}

export async function mockStudentGoogleRegister(
  invite: InviteValidation,
): Promise<AuthResult> {
  await waitForMock();

  if (invite.status !== "valid") {
    return {
      ok: false,
      message: "Convite invalido ou expirado. Solicite um novo link ao seu personal.",
    };
  }

  return {
    ok: true,
    redirectTo: "/aluno/treino",
    message: "Conta Google criada pelo convite. Seu treino ja esta pronto.",
    token: "mock-access-token-student-google-register",
    user: {
      id: "user_student_google_invite",
      email: "ana.google@nodus.fit",
      name: "Ana Costa",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=Ana%20Costa",
      role: "aluno",
      personalId: "personal_marcos",
      emailVerified: true,
    },
    authMethod: "google",
    backendContract: {
      endpoint: "GET /api/auth/sign-in/social/google",
      refreshToken: "httpOnly-cookie",
    },
  };
}

function waitForMock() {
  return new Promise((resolve) => window.setTimeout(resolve, 650));
}

function buildPersonalProvisioning({
  brandColor,
  cref,
  personalId,
  phone,
  specialty,
  userId,
}: {
  brandColor: "#3DD9A4";
  cref: string | null;
  personalId: string;
  phone: string | null;
  specialty: string | null;
  userId: string;
}): ProfileProvisioning {
  return {
    userInsert: {
      role: "personal",
      personalId: null,
    },
    trigger: "trg_user_created",
    generalProfile: {
      userId,
      phone,
      birthdate: null,
      bio: null,
    },
    personalProfile: {
      id: personalId,
      userId,
      brandColor,
      cref,
      specialty,
    },
  };
}

function buildMeContract(): NonNullable<Extract<AuthResult, { ok: true }>["meContract"]> {
  return {
    endpoint: "GET /api/me",
    authorization: "Bearer <token>",
    includes: ["user", "general_profile", "personal_profile"],
  };
}
