import { proxyPublicBackend } from "@/lib/bff/backend-proxy";
import { problemResponse } from "@/lib/bff/problem-details";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  if (typeof token !== "string" || !token.trim())
    return problemResponse(request, 400, "INVITE_TOKEN_REQUIRED");
  return proxyPublicBackend(request, ["v1", "invites", token]);
}
