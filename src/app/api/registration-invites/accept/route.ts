import { parseInviteToken } from "@/lib/auth/invite-context";
import { proxyAuthenticatedBackend } from "@/lib/bff/backend-proxy";
import { problemResponse } from "@/lib/bff/problem-details";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    request.signal.throwIfAborted();
    return problemResponse(request, 400, "INVITE_TOKEN_REQUIRED");
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("token" in body) ||
    typeof body.token !== "string"
  ) {
    return problemResponse(request, 400, "INVITE_TOKEN_REQUIRED");
  }
  const invite = parseInviteToken(body.token);
  if (invite.status !== "present") {
    return problemResponse(request, 400, "INVITE_TOKEN_REQUIRED");
  }
  const headers = new Headers(request.headers);
  headers.delete("content-type");
  return proxyAuthenticatedBackend(
    new Request(request.url, { method: "POST", headers, signal: request.signal }),
    ["v1", "invites", invite.token, "accept"],
    "web",
  );
}
