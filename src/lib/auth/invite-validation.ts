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

type InviteResponse = {
  personal?: { name?: string; especialidade?: string | null };
  code?: string;
};

export async function validateInviteToken(token?: string): Promise<InviteValidation> {
  if (!token) return { status: "missing" };

  const apiUrl = process.env.NODUS_API_URL;
  if (!apiUrl) return { status: "invalid" };

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/$/, "")}/api/v1/invites/${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    const body = (await response.json().catch(() => ({}))) as InviteResponse;

    if (response.ok && body.personal?.name) {
      return {
        status: "valid",
        personal: {
          name: body.personal.name,
          initials: initialsFromName(body.personal.name),
          title: "Personal Trainer",
          city: "",
          students: 0,
        },
      };
    }

    return { status: body.code === "INVITE_EXPIRED" ? "expired" : "invalid" };
  } catch {
    return { status: "invalid" };
  }
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
