export type NodusRole = "PERSONAL" | "ALUNO" | "ADMIN";

export interface AuthenticatedNodusUser {
  userId: string;
  email: string;
  name: string;
  role: NodusRole;
  emailVerified: boolean;
  personalProfileId: string | null;
  studentProfileId: string | null;
}

export interface MeResponse {
  user: AuthenticatedNodusUser;
  profile: Record<string, unknown> | null;
  onboarding: {
    required: boolean;
    missingFields: string[];
  };
}

export interface InviteSummary {
  email: string;
  role: "ALUNO";
  expiresAt: string;
  personal: {
    name: string;
    especialidade: string | null;
  };
}

export interface CreatedInvite {
  id: string;
  link: string;
  expiresAt: string;
}
