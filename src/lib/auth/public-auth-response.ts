export function withoutBridgeJwt<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
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
