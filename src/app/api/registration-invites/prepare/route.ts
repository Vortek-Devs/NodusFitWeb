import { parseInviteToken } from "@/lib/auth/invite-context";
import { proxyPublicBackend } from "@/lib/bff/backend-proxy";
import { buildClientResponseHeaders } from "@/lib/bff/headers";
import { problemResponse } from "@/lib/bff/problem-details";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    request.signal.throwIfAborted();
    return problemResponse(request, 400, "INVALID_REQUEST");
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
  const validation = await proxyPublicBackend(
    new Request(request.url, { headers: request.headers, signal: request.signal }),
    ["v1", "invites", invite.token],
  );
  if (!validation.ok) return validation;
  try {
    await validation.body?.cancel();
  } catch {
    request.signal.throwIfAborted();
    return problemResponse(request, 502, "BACKEND_UNAVAILABLE");
  }
  const responseHeaders = buildClientResponseHeaders(validation.headers);
  responseHeaders.set("content-type", "application/json");
  return Response.json({ valid: true }, { headers: responseHeaders });
}
