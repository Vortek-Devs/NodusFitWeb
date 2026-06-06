import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildBackendHeaders } from "@/lib/bff/headers";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: Request, context: RouteContext) {
  const requestHeaders = await headers();
  const sessionResult = await auth.api.getSession({
    headers: requestHeaders,
    returnHeaders: true,
  });
  if (!sessionResult.response) {
    return NextResponse.json({ code: "SESSION_REQUIRED" }, { status: 401 });
  }

  const jwt = sessionResult.headers.get("set-auth-jwt");
  if (!jwt) {
    return NextResponse.json({ code: "JWT_NOT_ISSUED" }, { status: 502 });
  }

  const apiUrl = process.env.NODUS_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ code: "NODUS_API_NOT_CONFIGURED" }, { status: 500 });
  }

  const { path } = await context.params;
  const sourceUrl = new URL(request.url);
  const target = new URL(
    `/api/${path.map(encodeURIComponent).join("/")}${sourceUrl.search}`,
    `${apiUrl.replace(/\/$/, "")}/`,
  );
  const method = request.method.toUpperCase();
  const response = await fetch(target, {
    method,
    headers: buildBackendHeaders(request.headers, jwt),
    body: method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer(),
    cache: "no-store",
    redirect: "manual",
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
