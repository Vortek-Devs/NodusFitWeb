const FORWARDED_REQUEST_HEADERS = new Set(["accept", "content-type", "if-none-match"]);
const FORWARDED_RESPONSE_HEADERS = new Set([
  "content-type",
  "retry-after",
  "x-correlation-id",
]);

export function buildBackendHeaders(incoming: Headers, jwt: string): Headers {
  const outgoing = copyAllowlistedHeaders(incoming, FORWARDED_REQUEST_HEADERS);

  outgoing.set("authorization", `Bearer ${jwt}`);
  return outgoing;
}

function copyAllowlistedHeaders(incoming: Headers, allowlist: Set<string>): Headers {
  const outgoing = new Headers();

  for (const [name, value] of incoming.entries()) {
    if (allowlist.has(name.toLowerCase())) {
      outgoing.set(name, value);
    }
  }

  return outgoing;
}

export function buildClientResponseHeaders(upstream: Headers): Headers {
  return copyAllowlistedHeaders(upstream, FORWARDED_RESPONSE_HEADERS);
}

export function buildPublicBackendHeaders(incoming: Headers): Headers {
  return copyAllowlistedHeaders(incoming, FORWARDED_REQUEST_HEADERS);
}
