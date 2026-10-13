const PUBLIC_TOKEN_PATH = "/api/auth/token";

/** Keep JWT issuance private to server-side BFF calls and hide the bridge token from clients. */
export function protectPublicAuthResponse<Args extends [Request, ...unknown[]]>(
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    const path = new URL(args[0].url).pathname.replace(/\/+$/, "");
    if (path === PUBLIC_TOKEN_PATH) return new Response(null, { status: 404 });

    const response = await handler(...args);
    const headers = new Headers(response.headers);
    headers.delete("set-auth-jwt");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}
