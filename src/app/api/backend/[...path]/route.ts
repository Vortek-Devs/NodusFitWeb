import { proxyAuthenticatedBackend } from "@/lib/bff/backend-proxy";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: Request, context: RouteContext) {
  return proxyAuthenticatedBackend(request, (await context.params).path, "web");
}

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
