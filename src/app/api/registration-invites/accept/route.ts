import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { INVITE_COOKIE_NAME } from "@/lib/auth/invite-context";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(INVITE_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ code: "INVITE_TOKEN_REQUIRED" }, { status: 400 });
  }

  const sessionResult = await auth.api.getSession({
    headers: await headers(),
    returnHeaders: true,
  });
  if (!sessionResult.response) {
    return NextResponse.json({ code: "SESSION_REQUIRED" }, { status: 401 });
  }

  const jwt = sessionResult.headers.get("set-auth-jwt");
  const apiUrl = process.env.NODUS_API_URL;
  if (!jwt || !apiUrl) {
    return NextResponse.json({ code: "AUTH_BRIDGE_UNAVAILABLE" }, { status: 502 });
  }

  const response = await fetch(
    `${apiUrl.replace(/\/$/, "")}/api/v1/invites/${encodeURIComponent(token)}/accept`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${jwt}` },
      cache: "no-store",
    },
  );

  const result = new Response(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
  if (response.ok) {
    result.headers.append(
      "set-cookie",
      `${INVITE_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
    );
  }
  return result;
}
