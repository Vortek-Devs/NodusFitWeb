import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  buildBackendHeaders,
  buildClientResponseHeaders,
  buildPublicBackendHeaders,
} from "./headers";
import { problemResponse } from "./problem-details";

export async function proxyAuthenticatedBackend(
  request: Request,
  path: string[],
  channel: "web" | "mobile",
): Promise<Response> {
  request.signal.throwIfAborted();
  let jwt: string | null;
  try {
    const session = await auth.api.getSession({
      headers: channel === "web" ? await headers() : request.headers,
      returnHeaders: true,
    });
    request.signal.throwIfAborted();
    if (!session.response) return problemResponse(request, 401, "SESSION_REQUIRED");
    jwt = session.headers.get("set-auth-jwt");
    if (!jwt) return problemResponse(request, 502, "AUTH_BRIDGE_UNAVAILABLE");
  } catch {
    request.signal.throwIfAborted();
    return problemResponse(request, 502, "AUTH_BRIDGE_UNAVAILABLE");
  }
  return proxyBackend(request, path, buildBackendHeaders(request.headers, jwt));
}

export function proxyPublicBackend(request: Request, path: string[]): Promise<Response> {
  return proxyBackend(request, path, buildPublicBackendHeaders(request.headers));
}

async function proxyBackend(
  request: Request,
  path: string[],
  outgoing: Headers,
): Promise<Response> {
  request.signal.throwIfAborted();
  if (path.some((segment) => segment === "." || segment === "..")) {
    return problemResponse(request, 400, "INVALID_BACKEND_PATH");
  }
  let target: URL;
  try {
    const base = new URL(process.env.NODUS_API_URL ?? "");
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password) {
      return problemResponse(request, 500, "NODUS_API_NOT_CONFIGURED");
    }
    target = new URL(
      `/api/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`,
      base,
    );
  } catch {
    return problemResponse(request, 500, "NODUS_API_NOT_CONFIGURED");
  }
  try {
    const method = request.method.toUpperCase();
    const upstream = await fetch(target, {
      method,
      headers: outgoing,
      body:
        method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
      signal: request.signal,
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: buildClientResponseHeaders(upstream.headers),
    });
  } catch {
    request.signal.throwIfAborted();
    return problemResponse(request, 502, "BACKEND_UNAVAILABLE");
  }
}
