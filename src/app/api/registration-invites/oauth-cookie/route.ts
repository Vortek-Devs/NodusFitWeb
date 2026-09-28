import { NextResponse } from "next/server";
import { INVITE_COOKIE_NAME, inviteCookieOptions } from "@/lib/auth/invite-context";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string };
  if (!body.token) {
    return NextResponse.json({ code: "INVITE_TOKEN_REQUIRED" }, { status: 400 });
  }

  const apiUrl = process.env.NODUS_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ code: "NODUS_API_NOT_CONFIGURED" }, { status: 500 });
  }

  // Validamos antes de gravar o cookie para nao carregar tokens invalidos
  // durante todo o redirect do Google.
  const validation = await fetch(
    `${apiUrl.replace(/\/$/, "")}/api/v1/invites/${encodeURIComponent(body.token)}`,
    { cache: "no-store" },
  );
  if (!validation.ok) {
    return new Response(validation.body, {
      status: validation.status,
      headers: { "content-type": "application/json" },
    });
  }

  // JavaScript do browser nao precisa ler este token temporario.
  const response = NextResponse.json({ valid: true });
  response.cookies.set(
    INVITE_COOKIE_NAME,
    body.token,
    inviteCookieOptions(process.env.NODE_ENV === "production"),
  );
  return response;
}
