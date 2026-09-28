import {
  isCalendarDate,
  isRecord,
  isStudentStatus,
  isUuid,
  type StudentStatus,
} from "./students";

export type NodusRole = "PERSONAL" | "ALUNO" | "ADMIN";

export interface AuthenticatedNodusUser {
  userId: string;
  email: string;
  name: string;
  role: NodusRole;
  emailVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  personalProfileId: string | null;
  studentProfileId: string | null;
}

export interface MeResponse {
  user: AuthenticatedNodusUser;
  personalProfile: {
    id: string;
    cpf: string;
    cref: string;
    telefone: string;
    especialidade: string | null;
  } | null;
  studentProfile: {
    id: string;
    personalProfileId: string;
    status: StudentStatus;
    telefone: string | null;
    birthDate: string | null;
  } | null;
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

export function isMeResponse(value: unknown): value is MeResponse {
  if (!isRecord(value) || !isRecord(value.user) || !isRecord(value.onboarding))
    return false;
  const { user, onboarding, personalProfile, studentProfile } = value;
  return (
    typeof user.userId === "string" &&
    user.userId.trim().length > 0 &&
    typeof user.email === "string" &&
    typeof user.name === "string" &&
    (user.role === "PERSONAL" || user.role === "ALUNO" || user.role === "ADMIN") &&
    typeof user.emailVerified === "boolean" &&
    typeof user.isActive === "boolean" &&
    typeof user.isBanned === "boolean" &&
    (user.personalProfileId === null || isUuid(user.personalProfileId)) &&
    (user.studentProfileId === null || isUuid(user.studentProfileId)) &&
    typeof onboarding.required === "boolean" &&
    Array.isArray(onboarding.missingFields) &&
    onboarding.missingFields.every((field) => typeof field === "string") &&
    (personalProfile === null ||
      (isRecord(personalProfile) &&
        isUuid(personalProfile.id) &&
        typeof personalProfile.cpf === "string" &&
        typeof personalProfile.cref === "string" &&
        typeof personalProfile.telefone === "string" &&
        (personalProfile.especialidade === null ||
          typeof personalProfile.especialidade === "string"))) &&
    (studentProfile === null ||
      (isRecord(studentProfile) &&
        isUuid(studentProfile.id) &&
        isUuid(studentProfile.personalProfileId) &&
        isStudentStatus(studentProfile.status) &&
        (studentProfile.telefone === null ||
          typeof studentProfile.telefone === "string") &&
        (studentProfile.birthDate === null || isCalendarDate(studentProfile.birthDate))))
  );
}

export interface CreatedInvite {
  id: string;
  link: string;
  expiresAt: string;
}
