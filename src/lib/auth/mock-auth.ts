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

export type AuthResult =
  | {
      ok: true;
      redirectTo: string;
      message: string;
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

export async function mockPersonalLogin(): Promise<AuthResult> {
  await waitForMock();

  return {
    ok: true,
    redirectTo: "/dashboard",
    message: "Bem-vindo de volta. Redirecionando para o painel.",
  };
}

export async function mockPersonalRegister(email: string): Promise<AuthResult> {
  await waitForMock();

  if (duplicatePersonalEmails.has(email.trim().toLowerCase())) {
    return {
      ok: false,
      field: "email",
      message: "Este email ja esta cadastrado. Use outro email ou entre no painel.",
    };
  }

  return {
    ok: true,
    redirectTo: "/onboarding",
    message: "Conta criada. Redirecionando para o onboarding.",
  };
}

export async function mockPersonalGoogleRegister(): Promise<AuthResult> {
  await waitForMock();

  return {
    ok: true,
    redirectTo: "/onboarding",
    message: "Conta Google conectada. Finalize seu onboarding profissional.",
  };
}

export async function mockStudentLogin(): Promise<AuthResult> {
  await waitForMock();

  return {
    ok: true,
    redirectTo: "/aluno/treino",
    message: "Login confirmado. Carregando o treino de hoje.",
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
  };
}

function waitForMock() {
  return new Promise((resolve) => window.setTimeout(resolve, 650));
}
